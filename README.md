<div align="center">

<img src="https://img.shields.io/badge/Aurora-IA-rose?style=for-the-badge&logo=sparkles&logoColor=white" />

# Aurora 🌸

**Assistente inteligente de identificação de violência psicológica**

Aurora é um aplicativo mobile que utiliza IA conversacional para ajudar mulheres a identificarem situações de violência psicológica em seus relacionamentos, oferecendo escuta ativa, conteúdo educativo e canais de apoio de forma segura e sigilosa.

[![Python](https://img.shields.io/badge/Python-3.11+-3776AB?style=flat-square&logo=python&logoColor=white)](https://python.org)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.115+-009688?style=flat-square&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com)
[![React](https://img.shields.io/badge/React-18.3-61DAFB?style=flat-square&logo=react&logoColor=black)](https://react.dev)
[![Capacitor](https://img.shields.io/badge/Capacitor-8.3-119EFF?style=flat-square&logo=capacitor&logoColor=white)](https://capacitorjs.com)
[![Claude](https://img.shields.io/badge/Claude-Haiku_4.5-D4A017?style=flat-square&logo=anthropic&logoColor=white)](https://anthropic.com)
[![MySQL](https://img.shields.io/badge/MySQL-8.0+-4479A1?style=flat-square&logo=mysql&logoColor=white)](https://mysql.com)

</div>

---

## Sobre o projeto

O Aurora nasceu como Trabalho de Conclusão de Curso em Sistemas de Informação no IFMG — Campus Ouro Branco, com o objetivo de criar uma ferramenta acessível, empática e tecnicamente sólida para auxiliar no reconhecimento de violência doméstica.

A IA conversa com a usuária de forma acolhedora e, ao longo da conversa, identifica sinais de risco com base no **Violentômetro**. Um motor de regras próprio — o **Motor V3** — calcula o nível de risco de forma determinística, garantindo que as decisões críticas (como exibir canais de ajuda) nunca dependam exclusivamente da IA.

---

## Funcionalidades

- 💬 **Chat com IA** — conversa empática e sem julgamentos, com escuta ativa
- 🎯 **Detecção de sinais** — identifica padrões como ciúme excessivo, manipulação, isolamento, ameaças e violência física
- 📊 **Motor de risco (Motor V3)** — score acumulado com decay temporal e regra de não regressão de nível
- 🟢🟡🟣 **Três níveis de risco** — Verde, Amarelo e Roxo, com respostas diferentes em cada um
- 📞 **Botões de discagem direta** — atalhos nativos para o 180 (Central da Mulher) e 190 (Polícia Militar) quando o risco é alto
- 🔐 **Autenticação JWT** — sessões seguras com token de 60 minutos
- 📱 **App mobile** — compilado para Android via Capacitor

---

## Arquitetura

```
AuroraProject/
├── backend/
│   ├── main.py          # API FastAPI — endpoints, IA (Claude), Motor V3
│   ├── models.py        # Modelos SQLAlchemy (Usuario, ChatSession, Mensagem)
│   ├── database.py      # Conexão MySQL via SQLAlchemy
│   ├── requirements.txt
│   └── .env             # Variáveis de ambiente (não versionar)
│
├── src/
│   ├── app/
│   │   ├── components/  # Componentes reutilizáveis
│   │   ├── pages/       # Páginas (Chat, Login, Cadastro...)
│   │   ├── App.tsx
│   │   └── routes.tsx
│   ├── lib/
│   │   └── utils.ts
│   └── styles/
│
├── android/             # Projeto Android gerado pelo Capacitor
├── capacitor.config.json
├── vite.config.ts
└── package.json
```

---

## Stack

### Back-end
| Tecnologia | Uso |
|---|---|
| Python 3.11+ | Linguagem principal |
| FastAPI | Framework da API REST |
| SQLAlchemy | ORM para o banco de dados |
| MySQL + PyMySQL | Banco de dados relacional |
| Claude Haiku 4.5 (Anthropic) | Modelo de IA conversacional |
| python-jose | Geração e validação de JWT |
| passlib + bcrypt | Hash de senhas |
| python-dotenv | Gerenciamento de variáveis de ambiente |

### Front-end / Mobile
| Tecnologia | Uso |
|---|---|
| React 18 + TypeScript | Interface do usuário |
| Vite 6 | Bundler |
| Tailwind CSS 4 | Estilização |
| Capacitor 8 | Compilação para Android |
| Radix UI | Componentes acessíveis |
| React Router 7 | Navegação |
| Lucide React | Ícones |

---

## Como rodar localmente

### Pré-requisitos

- Python 3.11+
- Node.js 18+
- MySQL 8.0+
- Conta na [Anthropic](https://console.anthropic.com) com créditos de API

---

### 1. Clone o repositório

```bash
git clone https://github.com/seu-usuario/aurora.git
cd aurora
```

---

### 2. Configure o back-end

```bash
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
```

Crie o arquivo `.env` dentro de `backend/`:

```env
ANTHROPIC_API_KEY=sua_chave_aqui
SECRET_KEY=uma_chave_secreta_qualquer

DB_USER=root
DB_PASSWORD=sua_senha
DB_HOST=localhost
DB_PORT=3306
DB_NAME=aurora_db
```

Crie o banco de dados no MySQL:

```sql
CREATE DATABASE aurora_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

Suba as tabelas:

```bash
python -c "from database import engine; from models import Base; Base.metadata.create_all(bind=engine)"
```

Inicie o servidor:

```bash
uvicorn main:app --reload
```

A API estará disponível em `http://localhost:8000`.

---

### 3. Configure o front-end

Na raiz do projeto:

```bash
npm install
npm run dev
```

O app estará disponível em `http://localhost:5173`.

> ⚠️ Atualize a URL da API em `src/app/pages/Chat.tsx` para apontar para `http://localhost:8000` durante o desenvolvimento local.

---

### 4. Compilar para Android (opcional)

```bash
npm run build
npx cap sync android
npx cap open android
```

Abra o Android Studio e rode no emulador ou dispositivo físico.

---

## Endpoints da API

| Método | Endpoint | Descrição | Auth |
|---|---|---|---|
| GET | `/` | Health check | ❌ |
| POST | `/api/cadastro` | Criar nova conta | ❌ |
| POST | `/api/login` | Login e geração de token JWT | ❌ |
| POST | `/api/chat` | Enviar mensagem para a IA | ✅ |
| GET | `/api/chat/historico` | Buscar histórico de mensagens | ✅ |
| GET | `/api/perfil` | Dados da sessão atual | ✅ |

---

## Como o Motor V3 funciona

O Motor V3 é o sistema de regras que calcula o nível de risco de forma determinística, independente da IA.

### Sinais e pesos

| Sinal | Peso | Nível |
|---|---|---|
| ciumes | 1 | 🟡 Amarelo |
| humilhacao, manipulacao, chantagem_afetiva | 2 | 🟡 Amarelo |
| controle_leve | 3 | 🟡 Amarelo |
| intimidacao, destruicao_objetos, empurrao | 6 | 🟣 Roxo |
| isolamento_total, controle_extremo, ameaca_suicidio, tapa | 7 | 🟣 Roxo |
| perseguicao | 8 | 🟣 Roxo |
| ameaca_fotos | 9 | 🟣 Roxo |
| ameaca_morte, ameaca_filhos, arma | 10 | 🟣 Roxo |
| abuso_sexual | 12 | 🟣 Roxo |

### Regras

- **Score ≥ 4** → Nível Amarelo
- **Score ≥ 10** → Nível Roxo
- **Decay de 10% por dia** de inatividade (`score × 0.9` por dia)
- **Sem regressão de nível** — uma vez Roxo, nunca volta para Amarelo ou Verde
- **Score ≥ 7** → exibe canal 180 (mesmo em Amarelo)
- **Nível Roxo** → exibe canal 180 + 190

---

## Variáveis de ambiente

| Variável | Descrição |
|---|---|
| `ANTHROPIC_API_KEY` | Chave da API da Anthropic |
| `SECRET_KEY` | Chave para assinar os tokens JWT |
| `DB_USER` | Usuário do banco de dados |
| `DB_PASSWORD` | Senha do banco de dados |
| `DB_HOST` | Host do banco de dados |
| `DB_PORT` | Porta do banco de dados (padrão: 3306) |
| `DB_NAME` | Nome do banco de dados |

---

## Canais de apoio

O Aurora integra dois canais de apoio que aparecem automaticamente quando o risco é identificado:

- **180** — Central de Atendimento à Mulher (gratuito, sigiloso, 24h)
- **190** — Polícia Militar (emergências imediatas)

---

## Licença

Este projeto foi desenvolvido para fins acadêmicos como Trabalho de Conclusão de Curso no IFMG — Campus Ouro Branco.

---

<div align="center">
  Feito com 💜 por <strong>Maria Eduarda Rodrigues Alves Morais</strong>
</div>
