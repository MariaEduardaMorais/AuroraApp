import os
import json
from google import genai
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

client = genai.Client(api_key=os.getenv("GOOGLE_API_KEY"))

# SYSTEM PROMPT
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

        NÍVEIS:
        - Verde: sem sinais
        - Amarelo: ciúmes, humilhação, manipulação, piadas ofensivas, chantagear, mentir/enganar, ignorar, culpar, desqualificar, ridicularizar/ofender, intimidar/ameaçar
        - Roxo: controle, isolamento (afastar de família e amigos), destruir bens pessoais, machucar, tapinhas/pancadinhas, brincar de bater, beliscar/arranhar, empurrar, dar tapas, chutar, confinar/prender
        - Azul: ameaçar com objetos e/ou armas, abuso sexual, ameaçar de morte, forçar uma relação sexual, violentar, mutilar

        FORMATO JSON OBRIGATÓRIO:
        {
         \"texto_resposta\": \"resposta acolhedora + pergunta\",
         \"nivel_atual\": \"Verde|Amarelo|Roxo|Azul\","
         \"sinal_detectado\": \"texto ou null\","
         \"sugerir_ajuda\": true/false"
        }
        
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

# ================= SINAIS =================
SINAIS = {
    "ciumes": {"peso": 1},
    "humilhacao": {"peso": 2},
    "manipulacao": {"peso": 2},
    "isolamento": {"peso": 3},
    "controle": {"peso": 3},
    "empurrao": {"peso": 4},
    "tapa": {"peso": 5},
    "ameaca": {"peso": 6},
    "arma": {"peso": 8},
    "abuso sexual": {"peso": 10}
}

NIVEL_ORDEM = {
    "Verde": 0,
    "Amarelo": 1,
    "Roxo": 2,
    "Azul": 3
}

# ================= MOTOR V3 =================
DECAY_POR_DIA = 0.9

def aplicar_decay(score, ultimo_update):
    dias = (datetime.utcnow() - ultimo_update).days
    for _ in range(dias):
        score *= DECAY_POR_DIA
    return score

def calcular_nivel(score):
    if score >= 20:
        return "Azul"
    elif score >= 10:
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
    if nivel == "Azul":
        return True
    if score >= 15:
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

        # ✅ CONTEXTO COM SYSTEM PROMPT
        contexto = f"""
{SYSTEM_PROMPT}

CONTEXTO:
{historico_formatado}

NÍVEL ATUAL: {usuario_db.nivel_atual}

MENSAGEM:
{input_data.mensagem}
"""

        response = client.models.generate_content(
            model="gemini-2.5-flash-lite",
            contents=contexto
        )

        texto_limpo = response.text.replace("```json", "").replace("```", "").strip()

        try:
            resposta = json.loads(texto_limpo)
        except Exception as e:
            print("ERRO no JSON:", e) # Isso ajuda a ver no terminal se der outro erro
            resposta = {
                "texto_resposta": "Desculpe, tive um probleminha para processar isso. Pode me explicar de novo?",
                "nivel_atual": usuario_db.nivel_atual,
                "sinal_detectado": None,
                "sugerir_ajuda": False
            }

        return {
            "status": "sucesso",
            "resposta_ia": resposta,
            "uso": REQ_COUNT
        }

    except Exception as e:
        print("ERRO:", e)
        erro_str = str(e)
        
        # Verifica se o erro é o 503 de servidor lotado
        if "503" in erro_str or "UNAVAILABLE" in erro_str:
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