import React, { useState } from "react";
import { useNavigate, Link } from "react-router";
import { Sparkles, ArrowRight, Lock, Mail, AlertCircle, Eye, EyeOff, XCircle } from "lucide-react";
import { motion } from "motion/react";
import { Button } from "../components/Button";

export function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleSairRapido = () => {
    navigate("/receitas", { replace: true });
  };

  const handleLogin = async (e: React.FormEvent) => {
  e.preventDefault();
  setIsLoading(true);
  setErrorMsg("");

  try {
    const response = await fetch("https://hardhead-customize-freehand.ngrok-free.dev/api/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: email,
        senha: password
      }),
    });

    const data = await response.json();

    if (data.status === "sucesso") {
      // limpa qualquer lixo antigo
      localStorage.removeItem("token");

      //salva novo token
      localStorage.setItem("token", data.token);
      localStorage.setItem("nomeUsuaria", data.nome_usuaria);

      navigate("/app", { replace: true });
    } else {
      setErrorMsg(data.mensagem);
    }

  } catch (error) {
    setErrorMsg("Erro de conexão. Verifique se o servidor está rodando.");
  } finally {
    setIsLoading(false);
  }
};

  return (
    <div className="flex flex-col min-h-screen bg-stone-50 px-6 py-12 relative overflow-hidden font-sans selection:bg-teal-200">

      <div className="absolute top-6 right-6 z-50">
        <button
          onClick={handleSairRapido}
          className="flex items-center gap-2 px-4 py-2 bg-rose-100 text-rose-600 rounded-full text-sm font-medium hover:bg-rose-200 transition-colors shadow-sm"
        >
          <XCircle className="w-4 h-4" />
          Sair Rápido
        </button>
      </div>

      <div className="absolute top-0 right-0 w-full h-64 bg-gradient-to-b from-teal-50/60 to-transparent pointer-events-none" />

      <div className="flex-1 max-w-sm w-full mx-auto flex flex-col justify-center z-10">
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-10"
        >
          <div className="inline-flex p-3 bg-white/60 backdrop-blur-sm rounded-2xl mb-4 shadow-sm border border-stone-100">
            <Sparkles className="w-8 h-8 text-teal-600" strokeWidth={1.5} />
          </div>
          <h1 className="text-2xl font-medium text-stone-700 tracking-tight mb-2">
            Boas-vindas!
          </h1>
          <p className="text-stone-500 text-sm font-medium">
            Um espaço seguro e acolhedor, só seu.
          </p>
        </motion.div>

        <motion.form
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.6 }}
          onSubmit={handleLogin}
          className="space-y-5"
        >
          {errorMsg && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="bg-red-50 text-red-600 p-3 rounded-xl text-sm flex items-center border border-red-100"
            >
              <AlertCircle className="w-4 h-4 mr-2 flex-shrink-0" />
              {errorMsg}
            </motion.div>
          )}

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-stone-500 uppercase tracking-wider ml-1">E-mail</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-stone-400">
                <Mail className="h-4 w-4" />
              </div>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-white border border-stone-200/80 text-stone-800 text-sm rounded-xl focus:ring-2 focus:ring-teal-500/20 focus:border-teal-400 block p-3.5 pl-10 transition-colors shadow-sm placeholder:text-stone-300"
                placeholder="seu@email.com"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-stone-500 uppercase tracking-wider ml-1">Senha</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-stone-400">
                <Lock className="h-4 w-4" />
              </div>
              <input
                type={showPassword ? "text" : "password"}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-white border border-stone-200/80 text-stone-800 text-sm rounded-xl focus:ring-2 focus:ring-teal-500/20 focus:border-teal-400 block p-3.5 pl-10 pr-10 transition-colors shadow-sm placeholder:text-stone-300"
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-stone-400 hover:text-teal-600 transition-colors"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <Button
            type="submit"
            className="w-full mt-2 bg-teal-600 hover:bg-teal-700 text-white shadow-sm h-12 rounded-xl text-base font-medium transition-all group border border-teal-700/50"
            disabled={isLoading}
          >
            {isLoading ? "Entrando..." : "Entrar"}
            {!isLoading && <ArrowRight className="ml-2 w-4 h-4 opacity-70 group-hover:translate-x-1 transition-transform" />}
          </Button>
        </motion.form>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.6 }}
          className="mt-8 text-center"
        >
          <p className="text-sm text-stone-500">
            Ainda não tem uma conta?{" "}
            <Link to="/register" className="text-teal-600 font-medium hover:text-teal-700 underline-offset-4 hover:underline transition-colors">
              Criar agora
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}