import React, { useEffect } from "react";
import { Link, useNavigate } from "react-router";
import { ArrowLeft, Phone, PhoneCall, AlertTriangle, Scale, Heart, MessageCircle } from "lucide-react";
import { Card, CardContent } from "../components/Card";
import { Button } from "../components/Button";

const contacts = [
  {
    name: "Ligue 180",
    desc: "Central de Atendimento à Mulher",
    details: "Denúncias e orientações. Funciona 24h, gratuito e confidencial.",
    icon: Phone,
    color: "bg-rose-100 text-rose-700",
    number: "180",
  },
  {
    name: "Polícia Militar",
    desc: "Emergências Imediatas",
    details: "Se estiver em perigo imediato, ligue agora.",
    icon: AlertTriangle,
    color: "bg-amber-100 text-amber-700",
    number: "190",
  },
  {
    name: "Delegacia da Mulher (DEAM)",
    desc: "Atendimento Especializado",
    details: "Procure a unidade mais próxima para registrar ocorrência.",
    icon: Scale,
    color: "bg-teal-100 text-teal-700",
    number: "",
  },
];

export function Contacts() {
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      navigate("/login");
    }
  }, []);

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
        A violência psicológica é crime. Se você precisa de orientação ou está em uma situação difícil, estes serviços estão aqui para te ajudar.
      </p>

      <div className="space-y-4">
        {contacts.map((contact, index) => {
          const Icon = contact.icon;
          return (
            <Card key={index} className="overflow-hidden border-stone-100 shadow-sm hover:shadow-md transition">
              <div className="flex flex-col p-5 gap-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`p-2.5 rounded-full ${contact.color}`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-stone-800">{contact.name}</h3>
                      <p className="text-xs text-stone-500 uppercase">{contact.desc}</p>
                    </div>
                  </div>

                  {contact.number && (
                    <a href={`tel:${contact.number}`}>
                      <Button size="icon" className="h-10 w-10 bg-stone-100 hover:bg-stone-200 rounded-full">
                        <PhoneCall className="w-4 h-4" />
                      </Button>
                    </a>
                  )}
                </div>

                <p className="text-sm text-stone-600 pt-2 border-t">
                  {contact.details}
                </p>

                {contact.number && (
                  <a href={`tel:${contact.number}`}>
                    <Button className="w-full mt-2 bg-stone-800 text-white hover:bg-stone-900">
                      Ligar para {contact.number}
                    </Button>
                  </a>
                )}
              </div>
            </Card>
          );
        })}
      </div>

      <Card className="mt-8 bg-blue-50 border-blue-100">
        <CardContent className="p-5">
          <h3 className="font-medium text-blue-900 flex items-center gap-2 mb-2">
            <MessageCircle className="w-5 h-5 text-blue-600" />
            Precisa de terapia?
          </h3>
          <p className="text-sm text-blue-800">
            Faculdades e projetos como o <strong>Mapa do Acolhimento</strong> oferecem apoio psicológico gratuito ou acessível.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}