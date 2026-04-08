import React from "react";
import { Link } from "react-router";
import { ArrowLeft, Phone, PhoneCall, AlertTriangle, Scale, Heart, MessageCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../components/Card";
import { Button } from "../components/Button";

const contacts = [
  {
    name: "Ligue 180",
    desc: "Central de Atendimento à Mulher",
    details: "Denúncias e orientações. É por aqui que devemos começar (se não estiver correndo PERIGO IMEDIATO, como um atentado à sua vida). Funciona 24h, todos os dias. A ligação é gratuita e confidencial.",
    icon: Phone,
    color: "bg-rose-100 text-rose-700",
    number: "180",
  },
  {
    name: "Polícia Militar",
    desc: "Emergências Imediatas",
    details: "Se você estiver em PERIGO IMEDIATO, ligue para a polícia. Funciona 24h.",
    icon: AlertTriangle,
    color: "bg-amber-100 text-amber-700",
    number: "190",
  },
  {
    name: "Delegacia da Mulher (DEAM)",
    desc: "Atendimento Especializado",
    details: "Se em sua cidade possuir uma Delegacia da Mulher, procure-a para registrar o boletim de ocorrência.",
    icon: Scale,
    color: "bg-teal-100 text-teal-700",
    number: "",
  },
];

export function Contacts() {
  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-12">
      <div className="flex items-center gap-4 text-stone-500 mb-6">
        <Link to="/app">
          <ArrowLeft className="w-5 h-5 hover:text-stone-800 transition-colors" />
        </Link>
        <h2 className="text-xl font-serif text-stone-800 font-medium flex items-center gap-2">
          <Heart className="w-5 h-5 text-rose-500" />
          Apoio e Denúncia
        </h2>
      </div>

      <p className="text-stone-600 text-sm leading-relaxed mb-6 bg-stone-100 p-4 rounded-xl border border-stone-200/50 shadow-inner">
        A violência psicológica é crime. Se você precisa de orientação ou está em uma situação difícil, estes serviços estão aqui para te ajudar. Você não precisa passar por isso sem apoio.
      </p>

      <div className="space-y-4">
        {contacts.map((contact, index) => {
          const Icon = contact.icon;
          return (
            <Card key={index} className="overflow-hidden border-stone-100 shadow-sm transition-all hover:shadow-md">
              <div className="flex flex-col p-5 gap-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`p-2.5 rounded-full ${contact.color}`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-stone-800 text-base">{contact.name}</h3>
                      <p className="text-xs font-medium text-stone-500 uppercase tracking-wide">
                        {contact.desc}
                      </p>
                    </div>
                  </div>
                  {contact.number && (
                    <a href={`tel:${contact.number}`}>
                      <Button variant="soft" size="icon" className="h-10 w-10 shrink-0 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-full">
                        <PhoneCall className="w-4 h-4" />
                      </Button>
                    </a>
                  )}
                </div>
                
                <p className="text-sm text-stone-600 leading-relaxed pt-2 border-t border-stone-100">
                  {contact.details}
                </p>

                {contact.number && (
                  <a href={`tel:${contact.number}`} className="w-full">
                    <Button variant="default" className="w-full mt-2 bg-stone-800 hover:bg-stone-900 text-white shadow-md">
                      Ligar para {contact.number}
                    </Button>
                  </a>
                )}
              </div>
            </Card>
          );
        })}
      </div>

      <Card className="mt-8 bg-blue-50/50 border-blue-100">
        <CardContent className="p-5">
          <h3 className="font-medium text-blue-900 flex items-center gap-2 mb-2">
            <MessageCircle className="w-5 h-5 text-blue-600" />
            Precisa de terapia?
          </h3>
          <p className="text-sm text-blue-800/80 leading-relaxed">
            Muitas faculdades de psicologia oferecem atendimento gratuito ou a preços sociais. Projetos como o <strong>Mapa do Acolhimento</strong> também conectam pessoas que sofrem violência a terapeutas profissionais.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
