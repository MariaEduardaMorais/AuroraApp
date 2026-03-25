import React from "react";
import { Link } from "react-router";
import { HeartHandshake, ShieldCheck, Sparkles } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../components/Card";
import { Button } from "../components/Button";

export function Home() {
  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="space-y-2 text-center mt-4">
        <h2 className="text-3xl font-serif text-stone-800">Boas-vindas</h2>
        <p className="text-stone-500 text-sm max-w-[280px] mx-auto leading-relaxed">
          Este é o AURORA, um espaço seguro e acolhedor, feito para ajudar você a entender
          melhor as dinâmicas dos seus relacionamentos com a ajuda da nossa IA.
        </p>
      </div>

      <div className="grid gap-4 mt-8">
        <Card className="border-teal-100 bg-teal-50/30">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-lg text-teal-800">
              <ShieldCheck className="w-5 h-5 text-teal-600" />
              Sua segurança primeiro
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-stone-600 leading-relaxed">
              O botão "Sair Rápido" no topo da tela leva você imediatamente para o YouTube, caso precise de privacidade repentina.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 flex flex-col items-center text-center space-y-4">
            <div className="p-4 bg-rose-50 rounded-full">
              <Sparkles className="w-8 h-8 text-rose-400" />
            </div>
            <div className="space-y-1">
              <h3 className="font-medium text-stone-800">Converse com a Aurora</h3>
              <p className="text-sm text-stone-500">
                Nossa IA generativa ajuda você a reconhecer padrões e identificar sinais de violência psicológica de forma segura.
              </p>
            </div>
            <Link to="/app/chat" className="w-full">
              <Button variant="soft" className="w-full bg-rose-100 text-rose-800 hover:bg-rose-200 shadow-sm">
                Iniciar conversa
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 flex flex-col items-center text-center space-y-4">
            <div className="p-4 bg-teal-50 rounded-full">
              <HeartHandshake className="w-8 h-8 text-teal-500" />
            </div>
            <div className="space-y-1">
              <h3 className="font-medium text-stone-800">Você não está só</h3>
              <p className="text-sm text-stone-500">
                Aprenda a identificar sinais de desrespeito emocional e veja contatos de apoio.
              </p>
            </div>
            <Link to="/app/info" className="w-full">
              <Button variant="soft" className="w-full shadow-sm">
                Saber mais
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
