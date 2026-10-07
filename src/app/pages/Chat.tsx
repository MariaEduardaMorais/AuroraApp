import React, { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router";
import { ArrowLeft, Send, Sparkles, User, AlertTriangle, Phone } from "lucide-react";
import { Button } from "../components/Button";
import { cn } from "../../lib/utils";

interface Message {
  id: string;
  role: "user" | "aurora";
  content: string;

  sugerirAjuda?: boolean;
  emergencia?: boolean;

  nivel?: "Verde" | "Amarelo" | "Roxo";
}

export function Chat() {
  const navigate = useNavigate();

  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      role: "aurora",
      content:
        "Olá, eu sou a Aurora. Estou aqui para te ouvir de forma segura. Você pode começar como preferir: algo que aconteceu, como você se sente, ou um exemplo recente 💬",
      sugerirAjuda: false,
    },
  ]);

  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [nivelAtual, setNivelAtual] = useState("Verde");

  const endOfMessagesRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    setTimeout(() => {
      endOfMessagesRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 100);
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() || isTyping) return;

    const token = localStorage.getItem("token");

    if (!token) {
      navigate("/login");
      return;
    }

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: inputValue.trim(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue("");
    setIsTyping(true);

    try {
      const response = await fetch(
        "https://hardhead-customize-freehand.ngrok-free.dev/api/chat",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            mensagem: userMessage.content,
            nivel_atual: nivelAtual,
          }),
        }
      );

      if (response.status === 401) {
        localStorage.removeItem("token");
        navigate("/login", { replace: true });
        return;
      }

      if (!response.ok) {
        throw new Error("Erro na API");
      }

      const data = await response.json();

      // 🔍 DEBUG — remover após confirmar que sugerir_ajuda está chegando true
      console.log("🔍 Resposta completa da API:", JSON.stringify(data, null, 2));
      console.log("🔍 sugerir_ajuda:", data?.resposta_ia?.sugerir_ajuda, "| tipo:", typeof data?.resposta_ia?.sugerir_ajuda);

      const respostaIA = data.resposta_ia || {
        texto_resposta: "Tive um problema ao processar sua mensagem. Pode tentar novamente?",
        nivel_atual: nivelAtual,
        sugerir_ajuda: false,
      };

      setNivelAtual(respostaIA.nivel_atual);

      const auroraMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "aurora",
        content: respostaIA.texto_resposta,

        sugerirAjuda: respostaIA.sugerir_ajuda === true,
        emergencia: respostaIA.emergencia === true,

        nivel: respostaIA.nivel_atual
      };

      setMessages((prev) => [...prev, auroraMessage]);

    } catch (error) {
      console.error(error);
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 2).toString(),
          role: "aurora",
          content: "Estou com dificuldade de conexão no momento. Tente novamente.",
          sugerirAjuda: false,
        },
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-140px)] max-h-[800px] relative">

      <div className="flex items-center gap-4 text-stone-500 pb-4 border-b">
        <Link to="/app">
          <ArrowLeft className="w-5 h-5 hover:text-stone-800" />
        </Link>
        <div>
          <h2 className="text-sm font-medium text-stone-800">Aurora IA</h2>
          <p className="text-[10px] text-teal-600">Nível atual: {nivelAtual}</p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto py-4 space-y-6">
        <div className="bg-stone-100 rounded-xl p-3 flex gap-3">
          <AlertTriangle className="w-4 h-4 text-stone-500" />
          <p className="text-xs text-stone-600">
            Se estiver em perigo imediato, ligue 190.
          </p>
        </div>

        <div className="space-y-4">
          {messages.map((msg) => (
            <div key={msg.id} className="flex flex-col gap-2">
              <div
                className={cn(
                  "flex gap-3",
                  msg.role === "user" ? "flex-row-reverse" : "flex-row"
                )}
              >
                <div
                  className={cn(
                    "w-8 h-8 rounded-full flex items-center justify-center shrink-0",
                    msg.role === "user" ? "bg-teal-100" : "bg-rose-100"
                  )}
                >
                  {msg.role === "user" ? (
                    <User className="w-4 h-4" />
                  ) : (
                    <Sparkles className="w-4 h-4" />
                  )}
                </div>

                <div className="px-4 py-3 rounded-2xl bg-white border text-sm max-w-[85%]">
                  {msg.content}
                </div>
              </div>

              {msg.role === "aurora" &&
                msg.sugerirAjuda &&
                msg.nivel === "Amarelo" && (
                <div className="ml-11 mt-2 rounded-xl border border-amber-300 bg-amber-50 p-4 w-[320px]">
                    <p className="text-sm text-stone-700 mb-3">
                        Caso você sinta necessidade, existem serviços especializados,
                        gratuitos e sigilosos que podem oferecer orientação e apoio.
                    </p>
                    <a
                        href="tel:180"
                        className="flex items-center justify-center gap-2 bg-amber-500 text-white py-2.5 px-4 rounded-xl text-sm font-semibold hover:bg-amber-600 transition-colors"
                    >
                        <Phone className="w-4 h-4" />
                        Ligar 180 — Central da Mulher
                    </a>
                </div>
                )}

                {msg.role === "aurora" &&
                  msg.emergencia &&
                  msg.nivel === "Roxo" && (
                  <div className="ml-11 mt-2 rounded-xl border border-rose-300 bg-rose-50 p-4 w-[320px]">

                      <p className="text-sm text-stone-700 mb-3">
                          Pela situação descrita, é importante buscar apoio especializado.
                          Se houver risco imediato à sua segurança, procure ajuda agora.
                      </p>
                      <div className="flex flex-col gap-2">
                          <a
                              href="tel:180"
                              className="flex items-center justify-center gap-2 bg-rose-600 text-white py-2.5 px-4 rounded-xl text-sm font-semibold hover:bg-rose-700 transition-colors"
                          >
                              <Phone className="w-4 h-4" />
                              Ligar 180 — Central da Mulher
                          </a>
                          <a
                              href="tel:190"
                              className="flex items-center justify-center gap-2 bg-stone-800 text-white py-2.5 px-4 rounded-xl text-sm font-semibold hover:bg-stone-900 transition-colors"
                          >
                              <Phone className="w-4 h-4" />
                              Ligar 190 — Polícia Militar
                          </a>
                      </div>
                  </div>
                  )}
            </div>
          ))}

          {isTyping && (
            <p className="text-sm text-stone-400">Aurora está digitando...</p>
          )}

          <div ref={endOfMessagesRef} />
        </div>
      </div>

      <form
        onSubmit={handleSendMessage}
        className="mt-2 bg-white rounded-2xl border p-2 flex gap-2"
      >
        <textarea
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder="Digite sua mensagem..."
          rows={1}
          className="flex-1 resize-none p-2 text-sm outline-none max-h-32"
        />
        <Button type="submit" disabled={!inputValue.trim() || isTyping}>
          <Send className="w-4 h-4" />
        </Button>
      </form>
    </div>
  );
}