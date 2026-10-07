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
    # --- AMARELO: sinais psicológicos iniciais ---
    "ciumes":               {"peso": 1},   # Amarelo leve
    "humilhacao":           {"peso": 2},   # Amarelo moderado
    "manipulacao":          {"peso": 2},   # Amarelo moderado
    "chantagem_afetiva":    {"peso": 2},   # Amarelo moderado
    "controle_leve":        {"peso": 3},   # Amarelo (controlar saídas, roupas, amizades)

    # --- ROXO: violência psicológica grave e coercitiva ---
    "isolamento_total":     {"peso": 7},   # Cortar família, amigos, trabalho
    "controle_extremo":     {"peso": 7},   # Monitoramento, proibições severas
    "intimidacao":          {"peso": 6},   # Gritos, posturas ameaçadoras, humilhação pública
    "perseguicao":          {"peso": 8},   # Stalkear, rastrear, aparecer nos locais
    "destruicao_objetos":   {"peso": 6},   # Quebrar pertences como ameaça velada
    "ameaca_fotos":         {"peso": 9},   # Revenge porn / exposição íntima
    "ameaca_filhos":        {"peso": 10},  # Ameaçar tirar ou machucar filhos
    "ameaca_suicidio":      {"peso": 7},   # Suicídio como instrumento de manipulação
    "ameaca_morte":         {"peso": 10},  # Ameaça de morte direta

    # --- ROXO: violência física ---
    "empurrao":             {"peso": 6},
    "tapa":                 {"peso": 7},
    "abuso_sexual":         {"peso": 12},
    "arma":                 {"peso": 10},
}

NIVEL_ORDEM = {
    "Verde": 0,
    "Amarelo": 1,
    "Roxo": 2
}

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
        - Combine sinais (ex: controle_leve + humilhacao evoluindo para controle_extremo)
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

        DISTINÇÃO IMPORTANTE — controle_leve vs controle_extremo:
        - controle_leve: restrições pontuais sobre saídas, roupas, amizades, uso do celular
        - controle_extremo: monitoramento sistemático (rastrear localização, ler mensagens),
          proibições que isolam a pessoa de trabalho, família ou vida social de forma abrangente

        ATENÇÃO ESPECIAL — ameaca_suicidio:
        - Use este sinal SOMENTE quando a usuária relatar que o PARCEIRO ameaça se machucar
          ou se matar como forma de manipulá-la ou impedi-la de ir embora.
        - Se for a PRÓPRIA USUÁRIA expressando pensamentos de se machucar ou desistir da vida,
          NÃO use este sinal. Nesse caso, acolha com cuidado, não faça perguntas que aprofundem
          o sofrimento, e oriente gentilmente para o CVV (188, disponível 24h, gratuito e sigiloso).

        NÍVEIS E COMPORTAMENTO POR NÍVEL:

        🟢 VERDE — Ausência de sinais relevantes de violência psicológica.
        - Mantenha postura de escuta ativa
        - Não sinalize risco
        - Faça perguntas abertas e acolhedoras para entender melhor a situação
        - "sugerir_ajuda" deve ser FALSE

        🟡 AMARELO — Presença de comportamentos de controle e humilhação iniciais.
        - Introduza gradualmente conteúdo educativo
        - Incentive a reflexão sobre os comportamentos relatados
        - Nomeie os padrões com cuidado, sem alarmismo
        - Sinais típicos:
          · ciumes: ciúme excessivo, fiscalização de contatos
          · humilhacao: apelidos ofensivos, críticas constantes, ridicularizar
          · manipulacao: culpar a vítima, distorcer fatos, gaslighting
          · chantagem_afetiva: ameaçar terminar, retirar afeto como punição
          · controle_leve: ditar roupas, proibir saídas pontuais, controlar dinheiro
        - "sugerir_ajuda" será definido pelo backend com base no score acumulado:
          · Score < 7 (Amarelo baixo): FALSE — apenas conteúdo educativo
          · Score >= 7 (Amarelo alto): TRUE — mencione ajuda com tom acolhedor e sem urgência

        🟡 AMARELO COM SCORE ALTO (sugerir_ajuda = TRUE):
        - NÃO use a palavra "violência" ainda — a situação ainda está sendo compreendida
        - Valide o que ela sente e nomeie o padrão com cuidado
        - Mencione de forma acolhedora que existem serviços especializados, gratuitos
          e sigilosos que podem ajudá-la a refletir sobre a situação
        - Exemplo de tom: "O que você está descrevendo tem um padrão que merece atenção.
          Você não precisa passar por isso sozinha — existe a Central de Atendimento à
          Mulher, pelo 180, que é gratuita e sigilosa e pode conversar com você sobre
          como você está se sentindo."
        - NÃO mencione o 190 ainda (reservado para perigo imediato no nível Roxo)
        - Continue fazendo perguntas — não encerre a escuta ativa

        🟣 ROXO — Violência psicológica grave, coercitiva ou física.
        - Sugira ATIVAMENTE a busca por apoio especializado
        - Destaque os canais disponíveis na central de apoio
        - Valide a coragem dela, diga que não é culpa dela
        - Sinais típicos:
          · isolamento_total: cortar contato com família, amigos ou trabalho
          · controle_extremo: rastrear localização, monitorar mensagens, proibições abrangentes
          · intimidacao: gritos, posturas ameaçadoras, humilhação pública sistemática
          · perseguicao: aparecer nos locais sem avisar, seguir, vigiar
          · destruicao_objetos: quebrar pertences como forma de ameaça ou demonstração de poder
          · ameaca_fotos: ameaçar divulgar imagens íntimas (revenge porn)
          · ameaca_filhos: ameaçar tirar a guarda ou machucar os filhos
          · ameaca_suicidio: parceiro ameaça se matar para manipular ou impedir separação
          · ameaca_morte: ameaça de matar a vítima ou pessoas próximas
          · empurrao / tapa: agressão física
          · abuso_sexual: forçar atos sexuais
          · arma: uso ou ameaça com objeto ou arma
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
    """
    Retorna:
        mostrar_ajuda -> exibir recursos de apoio
        emergencia -> exibir também botão 190
    """

    if nivel == "Roxo":
        return True, True

    if score >= 7:
        return True, False

    return False, False

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

            sinal_detectado = resposta.get("sinal_detectado")

            novo_nivel, score, explicacao = motor_v3(usuario_db, sinal_detectado)
            db.commit()

            print("MOTOR_V3:", explicacao)

            mostrar_ajuda, emergencia = verificar_ajuda(score, novo_nivel)

            resposta["nivel_atual"] = novo_nivel
            resposta["sugerir_ajuda"] = mostrar_ajuda
            resposta["emergencia"] = emergencia

        return {
            "status": "sucesso",
            "resposta_ia": resposta,
            "uso": REQ_COUNT
        }

    except anthropic.APIStatusError as e:
        print("ERRO Anthropic:", e)

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