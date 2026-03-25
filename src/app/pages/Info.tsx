import React from "react";
import { Link } from "react-router";
import { ArrowLeft, BookOpen, AlertCircle, EyeOff, MessageSquareOff, UserMinus, ShieldAlert } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../components/Card";
import { Button } from "../components/Button";

const topics = [
  {
    title: "O que é Gaslighting?",
    description: "É uma forma de manipulação onde a pessoa faz você duvidar da sua própria memória, percepção ou sanidade. Frases comuns: 'Você está imaginando coisas', 'Isso nunca aconteceu'.",
    icon: EyeOff,
    color: "text-rose-500",
    bg: "bg-rose-50",
  },
  {
    title: "Isolamento Social",
    description: "Quando a pessoa afasta você progressivamente de amizades, familiares e hobbies. A intenção é que você dependa exclusivamente dela.",
    icon: UserMinus,
    color: "text-amber-500",
    bg: "bg-amber-50",
  },
  {
    title: "Tratamento de Silêncio",
    description: "Ignorar ou recusar-se a falar com você por horas ou dias como forma de punição por não ter feito o que a pessoa queria.",
    icon: MessageSquareOff,
    color: "text-indigo-500",
    bg: "bg-indigo-50",
  },
  {
    title: "Controle e Ciúme Excessivo",
    description: "Acompanhar obsessivamente onde você vai, com quem fala, o que veste e exigir senhas das suas redes sociais sob o disfarce de 'cuidado'.",
    icon: ShieldAlert,
    color: "text-teal-500",
    bg: "bg-teal-50",
  },
];

export function Info() {
  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-8">
      <div className="flex items-center gap-4 text-stone-500 mb-6">
        <Link to="/app">
          <ArrowLeft className="w-5 h-5 hover:text-stone-800 transition-colors" />
        </Link>
        <h2 className="text-xl font-serif text-stone-800 font-medium flex items-center gap-2">
          <BookOpen className="w-5 h-5" />
          Aprender e Entender
        </h2>
      </div>

      <p className="text-stone-600 text-sm leading-relaxed mb-6">
        A violência psicológica muitas vezes não deixa marcas visíveis, mas causa danos profundos. Ela começa de forma sutil e se confunde com "cuidado" ou "amor exagerado". Entender os sinais é o primeiro passo para a mudança.
      </p>

      <div className="space-y-4">
        {topics.map((topic, index) => {
          const Icon = topic.icon;
          return (
            <Card key={index} className="overflow-hidden border-stone-100">
              <div className="flex items-start p-5 gap-4">
                <div className={`p-3 rounded-xl shrink-0 ${topic.bg}`}>
                  <Icon className={`w-6 h-6 ${topic.color}`} />
                </div>
                <div className="space-y-1">
                  <h3 className="font-medium text-stone-800 tracking-tight">{topic.title}</h3>
                  <p className="text-sm text-stone-500 leading-relaxed">
                    {topic.description}
                  </p>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      <Card className="mt-8 bg-rose-50/50 border-rose-100">
        <CardContent className="p-5 flex gap-4">
          <AlertCircle className="w-6 h-6 text-rose-500 shrink-0 mt-0.5" />
          <p className="text-sm text-rose-800 leading-relaxed">
            Se você se identifica com essas situações, saiba que <strong>não é sua culpa</strong> e que existe apoio disponível.
          </p>
        </CardContent>
      </Card>
      
      <div className="pt-4">
        <Link to="/app/contacts" className="w-full block">
          <Button variant="soft" className="w-full bg-teal-100 text-teal-800 hover:bg-teal-200 shadow-sm">
            Ver canais de apoio
          </Button>
        </Link>
      </div>
    </div>
  );
}
