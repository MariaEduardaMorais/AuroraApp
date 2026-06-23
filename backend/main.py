import os
import json
import anthropic
from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session
from passlib.context import CryptContext
from jose import JWTError, jwt
from datetime import datetime, timedelta
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from dotenv import load_dotenv

import models
from database import get_db

load_dotenv()

client = anthropic.Anthropic(api_key=os.getenv("ANTHROPIC_API_KEY"))
MODEL_NAME = "claude-haiku-4-5-20251001"

SINAIS = {
    "ciumes":       {"peso": 1},   # Amarelo leve
    "humilhacao":   {"peso": 2},   # Amarelo moderado
    "manipulacao":  {"peso": 2},   # Amarelo moderado
    "isolamento":   {"peso": 4},   # Amarelo alto → beira Roxo
    "controle":     {"peso": 4},   # Amarelo alto → beira Roxo
    "empurrao":     {"peso": 6},   # Roxo imediato (agressão física)
    "tapa":         {"peso": 7},   # Roxo imediato (agressão física)
    "ameaca":       {"peso": 6},   # Roxo imediato
    "arma":         {"peso": 10},  # Roxo grave
    "abuso sexual": {"peso": 12}   # Roxo gravíssimo
}

NIVEL_ORDEM = {
    "Verde": 0,
    "Amarelo": 1,
    "Roxo": 2
}

# ✅ Tool que força o Claude a responder SOMENTE com o JSON estruturado,
# sem nenhum texto solto antes/depois (resolve "Extra data" no json.loads)
#
# IMPORTANTE: "nivel_atual" e "sugerir_ajuda" aqui são apenas a OPINIÃO do
# modelo sobre a conversa. A decisão OFICIAL é recalculada pelo motor_v3()
# no backend, de forma determinística, a partir de "sinal_detectado".
# Isso evita que sugerir_ajuda fique inconsistente com o texto da resposta.
AURORA_RESPONSE_TOOL = {
    "name": "responder_aurora",
    "description": "Registra a resposta estruturada da Aurora para a usuária, incluindo o sinal de risco identificado.",
    "input_schema": {
        "type": "object",
        "properties": {
            "texto_resposta": {
                "type": "string",
                "description": "Resposta acolhedora e/ou instrução de ajuda para a usuária."
            },
            "nivel_atual": {
                "type": "string",
                "enum": ["Verde", "Amarelo", "Roxo"],
                "description": "Sua avaliação do nível de risco. Pode ser sobrescrita pelo motor de regras do backend."
            },
            "sinal_detectado": {
                "type": ["string", "null"],
                "enum": list(SINAIS.keys()) + [None],
                "description": (
                    "Sinal de violência detectado NESTA mensagem, escolhido EXATAMENTE entre as "
                    "chaves disponíveis, ou null se nenhum sinal foi identificado. Não invente "
                    "categorias fora desta lista."
                )
            },
            "sugerir_ajuda": {
                "type": "boolean",
                "description": "Sua avaliação se deve sugerir ajuda. Pode ser sobrescrita pelo motor de regras do backend."
            }
        },
        "required": ["texto_resposta", "nivel_atual", "sinal_detectado", "sugerir_ajuda"]
    }
}

SYSTEM_PROMPT = """
        Você é Aurora, assistente especializada em identificar violência psicológica com base no Violentômetro.

        INÍCIO DA CONVERSA:
        - Sempre ajude a pessoa a começar
        - Nunca faça apenas uma pergunta genérica
        - Ofereça caminhos simples (ex: "algo que aconteceu", "como você se sente", "um exemplo")
        - Valide a dificuldade de falar

        INTERPRETAÇÃO DE RESPOSTAS CURTAS:
        - Se a usuária responder apenas 'sim', 'não', 'às vezes', etc:
        - Relacione SEMPRE com sua pergunta anterior
        - Nunca trate como resposta isolada
        - Reforce o contexto antes de continuar

        CONTINUIDADE DA CONVERSA:
        - Cada pergunta cria um contexto
        - Interprete respostas com base nisso
        - Reconstrua o diálogo mentalmente

        CONSTRUÇÃO DE CENÁRIOS:
        - Analise padrões ao longo da conversa
        - Combine sinais (ex: controle + humilhação)
        - A violência pode evoluir de nível

        PERGUNTAS GUIADAS:
        - Evite perguntas genéricas
        - Faça perguntas baseadas no histórico
        - Use perguntas de confirmação quando necessário

        REFORÇO DE CONTEXTO:
        - Retome o que a usuária disse antes de perguntar algo novo

        PERSONA:
        - Empática
        - Acolhedora
        - Sem julgamentos
        - Linguagem simples

        REGRAS CRÍTICAS:
        - A violência ESCALA com o tempo
        - Nunca ignore sinais anteriores
        - Só reduza nível se houver evidência MUITO clara
        - Detecte padrões repetidos

        NÍVEIS E COMPORTAMENTO POR NÍVEL:

        🟢 VERDE — Ausência de sinais relevantes de violência psicológica.
        - Mantenha postura de escuta ativa
        - Não sinalize risco
        - Faça perguntas abertas e acolhedoras para entender melhor a situação
        - "sugerir_ajuda" deve ser FALSE

        🟡 AMARELO — Presença de comportamentos como ciúme excessivo, manipulação emocional,
        humilhações recorrentes e chantagem afetiva.
        - Introduza gradualmente conteúdo educativo
        - Incentive a reflexão sobre os comportamentos relatados
        - Nomeie os padrões com cuidado, sem alarmismo
        - Sinais típicos: ciúmes, humilhação, manipulação, piadas ofensivas, chantagem, mentira/engano,
          ignorar, culpar, desqualificar, ridicularizar, intimidar
        - "sugerir_ajuda" deve ser FALSE

        🟣 ROXO — Identificação de controle excessivo, isolamento social, intimidação,
        ameaças e agressões físicas leves.
        - Sugira ATIVAMENTE a busca por apoio especializado
        - Destaque os canais disponíveis na central de apoio
        - Valide a coragem dela, diga que não é culpa dela
        - Sinais típicos: controle, isolamento (afastar de família/amigos), destruir bens pessoais,
          tapinhas, beliscar, empurrar, tapas, chutar, confinar, ameaças com objetos ou armas,
          abuso sexual, ameaça de morte, forçar relação sexual, mutilar
        - "sugerir_ajuda" deve ser TRUE
        - Sua "texto_resposta" DEVE:
          1. Validar a coragem dela por ter contado
          2. Dizer claramente que o que ela vive é violência e ela não tem culpa
          3. Informar sobre ajuda especializada, gratuita e sigilosa: ligue 180 (Central de Atendimento à Mulher)
          4. Lembrar que em caso de perigo imediato, deve ligar 190 (Polícia Militar)
          5. Não fazer mais perguntas abertas — apenas oferecer apoio

        MENSAGENS FORA DE ESCOPO:
        - O Aurora existe exclusivamente para apoiar identificação de violência psicológica e doméstica
        - Se a usuária perguntar algo sem relação com esse propósito (ex: curiosidades, cultura pop,
          perguntas escolares, piadas, assuntos técnicos, qualquer tema desconectado da sua vivência
          emocional ou do relacionamento dela), NÃO responda à pergunta em si
        - Explique de forma breve e gentil que você é a Aurora e seu papel é ajudá-la a refletir sobre
          situações de relacionamento e violência psicológica, não é um assistente geral
        - Convide-a a retomar o assunto: pergunte se há algo sobre o relacionamento ou sentimento dela
          que gostaria de conversar
        - Não trate isso como sinal de risco: mantenha "nivel_atual" inalterado (o mesmo nível atual
          informado no contexto), "sinal_detectado" como null e "sugerir_ajuda" como false
        - Tom: nunca repreenda ou seja seca. Seja acolhedora mesmo ao redirecionar

        REGISTRO DA RESPOSTA:
        - Você DEVE sempre usar a ferramenta "responder_aurora" para registrar sua resposta
        - Preencha "texto_resposta" com a mensagem acolhedora para a usuária (sem JSON, sem markdown,
          apenas o texto natural que ela vai ler)
        - Preencha "nivel_atual", "sinal_detectado" e "sugerir_ajuda" de acordo com as regras de cada
          nível descritas acima

    """

app = FastAPI()

REQ_COUNT = 0
LIMITE_DIARIO = 1500

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

SECRET_KEY = os.getenv("SECRET_KEY", "aurora_secret_key")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60

security = HTTPBearer()
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def criar_token(dados: dict):
    dados = dados.copy()
    dados["exp"] = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    return jwt.encode(dados, SECRET_KEY, algorithm=ALGORITHM)

def verificar_token(credentials: HTTPAuthorizationCredentials = Depends(security)):
    try:
        return jwt.decode(credentials.credentials, SECRET_KEY, algorithms=[ALGORITHM])
    except JWTError:
        raise HTTPException(status_code=401, detail="Token inválido")

# ================= MODELS =================
class UsuarioCadastro(BaseModel):
    nome: str
    email: str
    senha: str

class UsuarioLogin(BaseModel):
    email: str
    senha: str

class ChatInput(BaseModel):
    mensagem: str
    nivel_atual: str = "Verde"
    historico: list[str] = Field(default_factory=list)

# ================= ROTAS =================
@app.get("/")
def home():
    return {"msg": "API Aurora online"}

@app.post("/api/cadastro")
def cadastro(user: UsuarioCadastro, db: Session = Depends(get_db)):
    if db.query(models.Usuario).filter(models.Usuario.email == user.email).first():
        raise HTTPException(400, "Email já cadastrado")

    novo = models.Usuario(
        nome=user.nome,
        email=user.email,
        senha=pwd_context.hash(user.senha)
    )

    db.add(novo)
    db.commit()

    return {"status": "sucesso"}

@app.post("/api/login")
def login(user: UsuarioLogin, db: Session = Depends(get_db)):
    db_user = db.query(models.Usuario).filter(models.Usuario.email == user.email).first()

    if not db_user or not pwd_context.verify(user.senha, db_user.senha):
        return {"status": "erro", "mensagem": "Credenciais inválidas"}

    token = criar_token({"sub": db_user.email})

    return {
        "status": "sucesso",
        "token": token,
        "nome_usuaria": db_user.nome
    }

# ================= MOTOR V3 =================
DECAY_POR_DIA = 0.9

def aplicar_decay(score, ultimo_update):
    dias = (datetime.utcnow() - ultimo_update).days
    for _ in range(dias):
        score *= DECAY_POR_DIA
    return score

def calcular_nivel(score):
    if score >= 10:
        return "Roxo"
    elif score >= 4:
        return "Amarelo"
    return "Verde"

def motor_v3(usuario_db, sinal_detectado):
    explicacao = []

    score = aplicar_decay(usuario_db.score_risco, usuario_db.ultimo_update)
    explicacao.append(f"Score após decay: {round(score,2)}")

    if sinal_detectado and sinal_detectado in SINAIS:
        peso = SINAIS[sinal_detectado]["peso"]
        score += peso
        explicacao.append(f"+{peso} pelo sinal: {sinal_detectado}")

    novo_nivel = calcular_nivel(score)

    if NIVEL_ORDEM[novo_nivel] < NIVEL_ORDEM[usuario_db.nivel_atual]:
        novo_nivel = usuario_db.nivel_atual
        explicacao.append("Nível mantido (sem regressão)")

    usuario_db.score_risco = score
    usuario_db.nivel_atual = novo_nivel
    usuario_db.ultimo_update = datetime.utcnow()

    return novo_nivel, score, explicacao

def verificar_ajuda(score, nivel):
    if nivel == "Roxo":
        return True
    # Sinais físicos (empurrao=6, tapa=7, ameaca=6) já ultrapassam 10 → Roxo direto.
    # Este fallback cobre casos em que o score ficou entre 6-9 por acúmulo de sinais
    # psicológicos graves (ex: isolamento + controle), mesmo sem chegar ao nível Roxo.
    if score >= 6:
        return True
    return False

# ================= CHAT =================

@app.post("/api/chat")
async def chat(
    input_data: ChatInput,
    usuario=Depends(verificar_token),
    db: Session = Depends(get_db)
):
    global REQ_COUNT
    REQ_COUNT += 1

    if REQ_COUNT > LIMITE_DIARIO:
        raise HTTPException(status_code=429, detail="Limite atingido")

    try:
        email = usuario.get("sub")

        usuario_db = db.query(models.Usuario).filter(
            models.Usuario.email == email
        ).first()

        historico_db = (
            db.query(models.Mensagem)
            .join(models.ChatSession)
            .join(models.Usuario)
            .filter(models.Usuario.email == email)
            .order_by(models.Mensagem.timestamp.asc())
            .all()
        )

        historico_formatado = "\n".join([
            f"{msg.remetente}: {msg.conteudo}" 
            for msg in reversed(historico_db)
        ])

        # ✅ CONTEXTO (system prompt vai separado, como recomenda a Anthropic)
        contexto = f"""
CONTEXTO:
{historico_formatado}

NÍVEL ATUAL: {usuario_db.nivel_atual}

MENSAGEM:
{input_data.mensagem}
"""

        response = client.messages.create(
            model=MODEL_NAME,
            max_tokens=1024,
            system=SYSTEM_PROMPT,
            tools=[AURORA_RESPONSE_TOOL],
            tool_choice={"type": "tool", "name": "responder_aurora"},
            messages=[
                {"role": "user", "content": contexto}
            ]
        )

        # ✅ Com tool_choice forçado, o Claude SEMPRE retorna um bloco tool_use
        # com o input já validado contra o schema — sem texto solto, sem
        # markdown fences, sem risco de "Extra data" no parsing.
        tool_block = next(
            (block for block in response.content if block.type == "tool_use"),
            None
        )

        if tool_block is None:
            print("ERRO: nenhum tool_use encontrado na resposta")
            resposta = {
                "texto_resposta": "Desculpe, tive um probleminha para processar isso. Pode me explicar de novo?",
                "nivel_atual": usuario_db.nivel_atual,
                "sinal_detectado": None,
                "sugerir_ajuda": False
            }
        else:
            resposta = tool_block.input

            # ✅ MOTOR DE REGRAS SOBRESCREVE A IA
            # A IA só decide o TEXTO e qual SINAL foi detectado. A decisão
            # oficial de "nivel_atual" e "sugerir_ajuda" vem do motor_v3,
            # que é determinístico, baseado em score acumulado + decay,
            # e nunca regride de nível. Isso evita o caso em que a IA
            # escreve "ligue 180" no texto mas esquece de marcar
            # sugerir_ajuda = true.
            sinal_detectado = resposta.get("sinal_detectado")

            novo_nivel, score, explicacao = motor_v3(usuario_db, sinal_detectado)
            db.commit()

            print("MOTOR_V3:", explicacao)

            resposta["nivel_atual"] = novo_nivel
            resposta["sugerir_ajuda"] = verificar_ajuda(score, novo_nivel)

        return {
            "status": "sucesso",
            "resposta_ia": resposta,
            "uso": REQ_COUNT
        }

    except anthropic.APIStatusError as e:
        print("ERRO Anthropic:", e)

        # 529 = overloaded_error (servidor sobrecarregado)
        # 429 = rate_limit_error (limite de requisições atingido)
        if e.status_code in (529, 429):
            resposta_amigavel = {
                "texto_resposta": "Desculpe, a conexão aqui deu uma leve oscilada e eu perdi o raciocínio. Você se importa de me enviar essa última mensagem de novo?",
                "nivel_atual": usuario_db.nivel_atual,
                "sinal_detectado": None,
                "sugerir_ajuda": False
            }

            return {
                "status": "sucesso",
                "resposta_ia": resposta_amigavel,
                "uso": REQ_COUNT
            }

        raise HTTPException(status_code=500, detail="Erro interno na IA")

    except Exception as e:
        print("ERRO:", e)
        raise HTTPException(status_code=500, detail="Erro interno na IA")

# ================= HISTÓRICO =================
@app.get("/api/chat/historico")
def historico(usuario=Depends(verificar_token), db: Session = Depends(get_db)):
    email = usuario.get("sub")

    mensagens = (
        db.query(models.Mensagem)
        .join(models.ChatSession)
        .join(models.Usuario)
        .filter(models.Usuario.email == email)
        .order_by(models.Mensagem.timestamp)
        .all()
    )

    return [
        {
            "role": m.remetente,
            "content": m.conteudo,
            "nivel": m.nivel
        }
        for m in mensagens
    ]

# ================= PERFIL =================
@app.get("/api/perfil")
def perfil(usuario=Depends(verificar_token)):
    return {"usuario": usuario}