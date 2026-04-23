from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from sqlalchemy.orm import Session
from passlib.context import CryptContext
import models
from database import get_db

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,  # ⚠️ muda isso
    allow_methods=["*"],
    allow_headers=["*"],
)

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

class UsuarioCadastro(BaseModel):
    nome: str
    email: str
    senha: str

class UsuarioLogin(BaseModel):
    email: str
    senha: str

@app.get("/")
def pagina_inicial():
    return {"mensagem": "A API do Aurora está conectada e rodando perfeitamente!"}


@app.post("/api/cadastro")
def cadastrar_usuario(usuario: UsuarioCadastro, db: Session = Depends(get_db)):
    
    print("CHEGOU NO BACKEND")

    usuario_existente = db.query(models.Usuario).filter(models.Usuario.email == usuario.email).first()
    if usuario_existente:
        return {"status": "erro", "mensagem": "Este email já está cadastrado."}
    
    senha_criptografada = pwd_context.hash(usuario.senha)
    
    novo_usuario = models.Usuario(
        nome=usuario.nome, 
        email=usuario.email, 
        senha=senha_criptografada
    )
    db.add(novo_usuario)
    db.commit()
    
    return {"status": "sucesso", "mensagem": "Cadastro realizado com sucesso!"}

@app.post("/api/login")
def fazer_login(usuario: UsuarioLogin, db: Session = Depends(get_db)):
    db_user = db.query(models.Usuario).filter(models.Usuario.email == usuario.email).first()
    
    if not db_user or not pwd_context.verify(usuario.senha, db_user.senha):
        return {"status": "erro", "mensagem": "Email ou senha incorretos."}
    
    return {
        "status": "sucesso", 
        "mensagem": "Login aprovado",
        "nome_usuaria": db_user.nome
    }