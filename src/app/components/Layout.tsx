import React from "react";
import { Outlet, Link, useLocation, useNavigate } from "react-router";
import { Home, BookHeart, Sparkles, PhoneCall, XOctagon, LogOut } from "lucide-react";
import { Button } from "./Button";
import { cn } from "../../lib/utils";

export function Layout() {
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("aurora_auth");
    navigate("/login", { replace: true });
  };

  const handleQuickExit = () => {
    // 1. Limpa os rastros de uso da memória do navegador (Storage)
    localStorage.clear();
    sessionStorage.clear();
    
    // 2. Oculta todo o conteúdo da tela instantaneamente
    document.body.innerHTML = "";
    document.body.style.backgroundColor = "#000000";
    
    // 3. Tenta fechar a aba (funciona em PWA e algumas instâncias nativas WebView)
    try {
      window.close();
    } catch (e) {
      console.error(e);
    }
    
    // 4. Caso o fechamento falhe (por ser web), redireciona imediatamente apagando o histórico atual
    window.location.replace("https://youtu.be/9BMwcO6_hyA?t=18");
  };

  const navItems = [
    { path: "/app", icon: Home, label: "Início" },
    { path: "/app/chat", icon: Sparkles, label: "Aurora" },
    { path: "/app/info", icon: BookHeart, label: "Aprender" },
    { path: "/app/contacts", icon: PhoneCall, label: "Apoio" },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-stone-50 font-sans selection:bg-teal-200">
      {/* Top Header */}
      <header className="sticky top-0 z-50 flex items-center justify-between p-4 bg-stone-50/80 backdrop-blur-md border-b border-stone-200/50">
        <div className="flex items-center gap-3">
          <h1 className="text-xl font-medium text-stone-700 tracking-tight">AURORA</h1>
          <button 
            onClick={handleLogout} 
            className="text-stone-400 hover:text-stone-600 transition-colors p-1 rounded-full hover:bg-stone-200/50" 
            title="Sair da conta e voltar para o login"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
        <Button
          variant="danger"
          size="sm"
          onClick={handleQuickExit}
          className="gap-2 px-3 py-1 bg-rose-100/50 text-rose-700 hover:bg-rose-200/50 border border-rose-200/50 shadow-sm"
          title="Sair imediatamente e ir para o YouTube"
        >
          <XOctagon className="w-4 h-4" />
          <span className="font-semibold">Sair Rápido</span>
        </Button>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 w-full max-w-md mx-auto p-4 pb-24">
        <Outlet />
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 w-full bg-white/90 backdrop-blur-lg border-t border-stone-200/50 pb-safe z-50">
        <div className="flex justify-around items-center h-16 max-w-md mx-auto px-2">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            const Icon = item.icon;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  "flex flex-col items-center justify-center w-full h-full space-y-1 transition-colors",
                  isActive ? "text-teal-700" : "text-stone-400 hover:text-stone-600"
                )}
              >
                <div
                  className={cn(
                    "p-1.5 rounded-xl transition-all",
                    isActive ? "bg-teal-50" : "bg-transparent"
                  )}
                >
                  <Icon className="w-5 h-5" />
                </div>
                <span className="text-[10px] font-medium tracking-wide">
                  {item.label}
                </span>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
