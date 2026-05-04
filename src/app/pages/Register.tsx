import React, { useState } from "react";
import { useNavigate, Link } from "react-router";
import { Sparkles, ArrowRight, Lock, Mail, User, AlertCircle, CheckCircle2, Eye, EyeOff, XCircle } from "lucide-react"; // Adicionados ícones de alerta e sucesso
import { motion } from "motion/react";
import { Button } from "../components/Button";

export function Register() {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const handleSairRapido = () => {
    navigate("/receitas", { replace: true });
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg("");
    setSuccessMsg("");

    try {
      // Faz a requisição real para o backend Python
      console.log("Tentando conectar...");
      const response = await fetch("https://hardhead-customize-freehand.ngrok-free.dev/api/cadastro", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          nome: name,
          email: email,
          senha: password
        }),
      });

      if (!response.ok) {
        const text = await response.text();
        throw new Error(text);
      }

      const data = await response.json();

      if (data.status === "sucesso") {
        setSuccessMsg("Conta criada com sucesso! Redirecionando...");

        // Aguarda 2 segundinhos para a pessoa ler a mensagem e manda pro Login
        setTimeout(() => {
          navigate("/login", { replace: true });
        }, 2000);
      } else {
        // Mostra o erro que veio do Python (ex: "Este email já está cadastrado")
        setErrorMsg(data.mensagem);
      }
    } catch (error) {
      if (error instanceof Error) {
        setErrorMsg("Erro real: " + error.message);
      } else {
        setErrorMsg("Erro desconhecido");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-stone-50 px-6 py-10 relative overflow-hidden font-sans selection:bg-rose-200">
        <div className="absolute top-6 right-6 z-50">
                <button
                  onClick={handleSairRapido}
                  className="flex items-center gap-2 px-4 py-2 bg-rose-100 text-rose-600 rounded-full text-sm font-medium hover:bg-rose-200 transition-colors shadow-sm"
                >
              <XCircle className="w-4 h-4" />
              Sair Rápido
            </button>
        </div>

      <div className="absolute top-0 left-0 w-full h-64 bg-gradient-to-b from-rose-50/60 to-transparent pointer-events-none" />

      <div className="flex-1 max-w-sm w-full mx-auto flex flex-col justify-center z-10">
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-8"
        >
          <div className="inline-flex p-3 bg-white/60 backdrop-blur-sm rounded-2xl mb-4 shadow-sm border border-stone-100">
            <Sparkles className="w-8 h-8 text-rose-400" strokeWidth={1.5} />
          </div>
          <h1 className="text-2xl font-medium text-stone-700 tracking-tight mb-2">
            Criar conta
          </h1>
          <p className="text-stone-500 text-sm font-medium leading-relaxed">
            Dê o primeiro passo. Estamos aqui para apoiar e ouvir você com segurança.
          </p>
        </motion.div>

        <motion.form
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.6 }}
          onSubmit={handleRegister}
          className="space-y-4"
        >
          {/* Caixa de Erro condicional */}
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

          {/* Caixa de Sucesso condicional */}
          {successMsg && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="bg-emerald-50 text-emerald-600 p-3 rounded-xl text-sm flex items-center border border-emerald-100"
            >
              <CheckCircle2 className="w-4 h-4 mr-2 flex-shrink-0" />
              {successMsg}
            </motion.div>
          )}

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-stone-500 uppercase tracking-wider ml-1">Como prefere ser chamada?</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-stone-400">
                <User className="h-4 w-4" />
              </div>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-white border border-stone-200/80 text-stone-800 text-sm rounded-xl focus:ring-2 focus:ring-rose-400/20 focus:border-rose-300 block p-3.5 pl-10 transition-colors shadow-sm placeholder:text-stone-300"
                placeholder="Seu nome"
              />
            </div>
          </div>

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
                className="w-full bg-white border border-stone-200/80 text-stone-800 text-sm rounded-xl focus:ring-2 focus:ring-rose-400/20 focus:border-rose-300 block p-3.5 pl-10 transition-colors shadow-sm placeholder:text-stone-300"
                placeholder="seu@email.com"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-stone-500 uppercase tracking-wider ml-1">Senha (mínimo 6 caracteres)</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-stone-400">
                <Lock className="h-4 w-4" />
              </div>
              <input
                type={showPassword ? "text" : "password"}
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-white border border-stone-200/80 text-stone-800 text-sm rounded-xl focus:ring-2 focus:ring-rose-400/20 focus:border-rose-300 block p-3.5 pl-10 pr-10 transition-colors shadow-sm placeholder:text-stone-300"
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-stone-400 hover:text-rose-500 transition-colors"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <Button
            type="submit"
            className="w-full mt-4 bg-stone-700 hover:bg-stone-800 text-white shadow-sm h-12 rounded-xl text-base font-medium transition-all group"
            disabled={isLoading}
          >
            {isLoading ? "Criando conta..." : "Criar conta"}
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
            Já possui uma conta?{" "}
            <Link to="/login" className="text-rose-500 font-medium hover:text-rose-600 underline-offset-4 hover:underline transition-colors">
              Fazer login
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}