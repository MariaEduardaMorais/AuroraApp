from sqlalchemy import Column, Integer, String, Text, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from datetime import datetime
from database import Base

# 1. Tabela de Usuárias
class Usuario(Base):
    __tablename__ = "usuarios"

    id = Column(Integer, primary_key=True, index=True)
    nome = Column(String(100), nullable=False)
    email = Column(String(100), unique=True, index=True, nullable=False)
    senha = Column(String(255), nullable=False)
    data_criacao = Column(DateTime, default=datetime.utcnow)

    # Relacionamentos
    sessoes_chat = relationship("ChatSession", back_populates="usuario")

# 2. Tabela de Sessões de Chat 
class ChatSession(Base):
    __tablename__ = "chat_sessions"

    id = Column(Integer, primary_key=True, index=True)
    usuario_id = Column(Integer, ForeignKey("usuarios.id", ondelete="CASCADE"))
    data_inicio = Column(DateTime, default=datetime.utcnow)

    usuario = relationship("Usuario", back_populates="sessoes_chat")
    mensagens = relationship("Mensagem", back_populates="sessao")

# 3. Tabela de Mensagens 
class Mensagem(Base):
    __tablename__ = "mensagens"

    id = Column(Integer, primary_key=True, index=True)
    sessao_id = Column(Integer, ForeignKey("chat_sessions.id", ondelete="CASCADE"))
    remetente = Column(String(20)) # 'usuario' ou 'ia'
    conteudo = Column(Text, nullable=False)
    timestamp = Column(DateTime, default=datetime.utcnow)

    sessao = relationship("ChatSession", back_populates="mensagens")