import React, { useEffect } from "react";
import { useNavigate } from "react-router";
import { motion } from "motion/react";
import { Sparkles } from "lucide-react";

export function Splash() {
  const navigate = useNavigate();

  useEffect(() => {
    // Animação de 2.5 segundos
    const timer = setTimeout(() => {
      const isAuth = localStorage.getItem("aurora_auth") === "true";
      if (isAuth) {
        navigate("/app", { replace: true });
      } else {
        navigate("/login", { replace: true });
      }
    }, 2500);

    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-stone-50 overflow-hidden relative selection:bg-teal-200">
      {/* Formas suaves de fundo */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1.5, ease: "easeOut" }}
        className="absolute top-1/4 -right-12 w-64 h-64 bg-teal-100/50 rounded-full blur-3xl pointer-events-none"
      />
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1.5, ease: "easeOut", delay: 0.2 }}
        className="absolute bottom-1/4 -left-12 w-72 h-72 bg-rose-100/40 rounded-full blur-3xl pointer-events-none"
      />

      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, delay: 0.3 }}
        className="z-10 flex flex-col items-center"
      >
        <div className="p-4 bg-white/60 backdrop-blur-sm rounded-3xl mb-5 shadow-sm border border-white/80">
          <Sparkles className="w-12 h-12 text-teal-600" strokeWidth={1.5} />
        </div>
        <h1 className="text-4xl font-light text-stone-700 tracking-[0.2em] ml-2">
          AURORA
        </h1>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 1 }}
          className="text-stone-400 text-sm mt-3 tracking-wide font-medium"
        >
          um espaço seguro
        </motion.p>
      </motion.div>
    </div>
  );
}
