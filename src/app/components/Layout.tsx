import React from "react";
import { Outlet, Link, useLocation, useNavigate } from "react-router";
import { Home, BookHeart, Sparkles, PhoneCall, XOctagon, LogOut } from "lucide-react";
import { Button } from "./Button";
import { cn } from "../../lib/utils";

export function Layout() {
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token"); // 🔥 CORRIGIDO
    navigate("/login", { replace: true });
  };

  const handleQuickExit = () => {
    localStorage.removeItem("token"); // 🔥 CORRIGIDO
    navigate("/receitas", { replace: true });
  };

  const navItems = [
    { path: "/app", icon: Home, label: "Início" },
    { path: "/app/chat", icon: Sparkles, label: "Aurora" },
    { path: "/app/info", icon: BookHeart, label: "Aprender" },
    { path: "/app/contacts", icon: PhoneCall, label: "Apoio" },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-stone-50 font-sans selection:bg-teal-200">
      
      {/* HEADER */}
      <header className="sticky top-0 z-50 flex items-center justify-between p-4 bg-stone-50/80 backdrop-blur-md border-b border-stone-200/50">
        <div className="flex items-center gap-3">
          <h1 className="text-xl font-medium text-stone-700 tracking-tight">
            AURORA
          </h1>

          <button
            onClick={handleLogout}
            className="text-stone-400 hover:text-stone-600 p-1 rounded-full"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>

        <Button
          variant="danger"
          size="sm"
          onClick={handleQuickExit}
          className="gap-2 px-3 py-1 bg-rose-100 text-rose-700"
        >
          <XOctagon className="w-4 h-4" />
          Sair Rápido
        </Button>
      </header>

      {/* CONTEÚDO */}
      <main className="flex-1 w-full max-w-md mx-auto p-4 pb-24">
        <Outlet />
      </main>

      {/* NAV */}
      <nav className="fixed bottom-0 w-full bg-white border-t">
        <div className="flex justify-around items-center h-16 max-w-md mx-auto">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            const Icon = item.icon;

            return (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  "flex flex-col items-center text-xs",
                  isActive ? "text-teal-700" : "text-stone-400"
                )}
              >
                <Icon className="w-5 h-5" />
                {item.label}
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}