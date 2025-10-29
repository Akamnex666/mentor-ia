"use client";

import React, { useState } from "react";
import { supabase } from "../../../lib/supabase";
import { useToast } from "../../../providers/ToastProvider";

export default function ForgotPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const toast = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);
    try {
      // redirectTo debe estar registrado en Authentication -> Settings -> Redirect URLs en Supabase
      const redirectTo = typeof window !== "undefined" ? window.location.origin + "/auth/login" : undefined;
      // Llamada a Supabase (v2+) para enviar email de recuperación
      // @ts-ignore - algunas versiones del SDK tienen firmas distintas
      const { data, error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo });

      // Log para depuración (abrir consola del navegador y revisar)
      console.log("resetPasswordForEmail response:", { data, error });

      if (error) {
        setError(error.message || "No se pudo enviar el correo");
        toast.push({ type: "error", title: "Error", message: error.message || "No se pudo enviar el correo" });
      } else {
        const msg = "Si existe una cuenta con ese correo, recibirás instrucciones para restablecer la contraseña.";
        setMessage(msg);
        toast.push({ type: "success", message: msg });
      }
    } catch (err: any) {
      console.error("reset password error", err);
      const m = err?.message ?? "Error inesperado";
      setError(m);
      toast.push({ type: "error", message: m });
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="auth-container">
      <div className="auth-card">
        <h1 className="auth-title">Recuperar contraseña</h1>
        <p className="auth-subtitle">Introduce tu correo y te enviaremos instrucciones para restablecerla.</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium">Correo</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="auth-input"
              placeholder="tucorreo@ejemplo.com"
            />
          </div>

          {error && <div className="auth-error">{error}</div>}
          {message && <div className="auth-success">{message}</div>}

          <div className="auth-aux">
            <a href="/auth/login" className="auth-link">Volver al login</a>
            <button type="submit" className="auth-button" disabled={loading}>
              {loading ? "Enviando..." : "Enviar instrucciones"}
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}
