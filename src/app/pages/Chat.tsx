import React, { useState, useRef, useEffect } from "react";
import { Link } from "react-router";
import { ArrowLeft, Send, Sparkles, User, AlertTriangle } from "lucide-react";
import { Button } from "../components/Button";
import { cn } from "../../lib/utils";

interface Message {
  id: string;
  role: "user" | "aurora";
  content: string;
}

export function Chat() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      role: "aurora",
      content: "Olá, eu sou a Aurora. Estou aqui para te ouvir de forma totalmente segura e sem julgamentos. Como você tem se sentido nas suas relações ultimamente?",
    },
  ]);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const endOfMessagesRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    endOfMessagesRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim()) return;

    const newUserMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: inputValue.trim(),
    };

    setMessages((prev) => [...prev, newUserMessage]);
    setInputValue("");
    setIsTyping(true);

    // Simulated AI Response logic
    setTimeout(() => {
      const mockResponse: Message = {
        id: (Date.now() + 1).toString(),
        role: "aurora",
        content: "Entendo como isso pode causar confusão e desgaste. Pelo que você compartilhou, parece haver um padrão de controle, o que pode ser um sinal de violência psicológica. Lembre-se: isso não é sua culpa. Eu estou aqui com você. Se sentir necessidade, recomendo ver nossa seção de 'Apoio' para canais de ajuda especializados.",
      };
      setMessages((prev) => [...prev, mockResponse]);
      setIsTyping(false);
    }, 2500);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-140px)] max-h-[800px] animate-in fade-in duration-500 relative">
      <div className="flex items-center gap-4 text-stone-500 pb-4 border-b border-stone-200/50 shrink-0">
        <Link to="/app">
          <ArrowLeft className="w-5 h-5 hover:text-stone-800 transition-colors" />
        </Link>
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-rose-100 rounded-full">
            <Sparkles className="w-4 h-4 text-rose-500" />
          </div>
          <div>
            <h2 className="text-sm font-medium text-stone-800">Aurora IA</h2>
            <p className="text-[10px] text-teal-600 font-medium tracking-wide flex items-center gap-1">
              <span className="w-1.5 h-1.5 bg-teal-500 rounded-full animate-pulse"></span>
              Online e com privacidade
            </p>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto py-4 space-y-6 custom-scrollbar">
        {/* Warning Banner */}
        <div className="bg-stone-100/80 rounded-xl p-3 flex items-start gap-3 border border-stone-200/50">
          <AlertTriangle className="w-4 h-4 text-stone-500 shrink-0 mt-0.5" />
          <p className="text-xs text-stone-600 leading-relaxed">
            A Aurora é uma inteligência artificial desenvolvida para ajudar a reconhecer padrões. Se você estiver em perigo imediato, use o botão de "Sair Rápido" ou ligue para 190.
          </p>
        </div>

        {/* Messages */}
        <div className="space-y-4">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={cn(
                "flex gap-3",
                msg.role === "user" ? "flex-row-reverse" : "flex-row"
              )}
            >
              <div
                className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center shrink-0",
                  msg.role === "user"
                    ? "bg-teal-100 text-teal-700"
                    : "bg-rose-100 text-rose-500"
                )}
              >
                {msg.role === "user" ? (
                  <User className="w-4 h-4" />
                ) : (
                  <Sparkles className="w-4 h-4" />
                )}
              </div>
              
              <div
                className={cn(
                  "px-4 py-3 rounded-2xl max-w-[85%] text-sm leading-relaxed shadow-sm",
                  msg.role === "user"
                    ? "bg-teal-50 text-stone-800 rounded-tr-sm"
                    : "bg-white border border-stone-100 text-stone-700 rounded-tl-sm"
                )}
              >
                {msg.content}
              </div>
            </div>
          ))}
          
          {isTyping && (
            <div className="flex gap-3 flex-row">
              <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 bg-rose-100 text-rose-500">
                <Sparkles className="w-4 h-4" />
              </div>
              <div className="px-4 py-3 rounded-2xl bg-white border border-stone-100 text-stone-700 rounded-tl-sm flex items-center gap-1 shadow-sm">
                <span className="w-1.5 h-1.5 bg-rose-300 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                <span className="w-1.5 h-1.5 bg-rose-300 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                <span className="w-1.5 h-1.5 bg-rose-300 rounded-full animate-bounce"></span>
              </div>
            </div>
          )}
          <div ref={endOfMessagesRef} className="h-4" />
        </div>
      </div>

      <form 
        onSubmit={handleSendMessage}
        className="mt-2 bg-white rounded-2xl border border-stone-200 shadow-sm p-1.5 flex items-end gap-2 shrink-0"
      >
        <textarea
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              handleSendMessage(e);
            }
          }}
          placeholder="Escreva sua mensagem aqui..."
          className="flex-1 max-h-32 min-h-[44px] bg-transparent resize-none p-3 text-sm focus:outline-none placeholder:text-stone-400 text-stone-700"
          rows={1}
        />
        <Button 
          type="submit" 
          size="icon" 
          className="w-10 h-10 shrink-0 bg-rose-100 text-rose-700 hover:bg-rose-200 rounded-xl disabled:opacity-50"
          disabled={!inputValue.trim() || isTyping}
        >
          <Send className="w-4 h-4 ml-0.5" />
        </Button>
      </form>
    </div>
  );
}
