"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../../lib/supabase";
import { useToast } from "../../../providers/ToastProvider";

export default function LoginPage() {
  const router = useRouter();
  const toast = useToast();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [remember, setRemember] = useState(true);
  const [lockedUntil, setLockedUntil] = useState<number | null>(null);

  const LOCK_KEY = "auth_lock"; // localStorage key
  const ATTEMPTS_KEY = "auth_attempts"; // localStorage key

  // cargar email recordado y estado de bloqueo
  React.useEffect(() => {
    try {
      const saved = localStorage.getItem("remembered_email");
      if (saved) setEmail(saved);

      const lockRaw = localStorage.getItem(LOCK_KEY);
      if (lockRaw) {
        const ts = parseInt(lockRaw, 10);
        if (!isNaN(ts) && ts > Date.now()) setLockedUntil(ts);
      }
    } catch (e) {
      // noop
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (lockedUntil && lockedUntil > Date.now()) {
      setError(`Cuenta bloqueada temporalmente. Intenta de nuevo en ${Math.ceil((lockedUntil - Date.now())/1000)}s`);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (signInError) {
        // Llevar contador de intentos fallidos en localStorage para bloqueo temporal
        try {
          const raw = localStorage.getItem(ATTEMPTS_KEY);
          let attempts = raw ? parseInt(raw, 10) : 0;
          attempts = (isNaN(attempts) ? 0 : attempts) + 1;
          localStorage.setItem(ATTEMPTS_KEY, String(attempts));

          const MAX = 5;
          const LOCK_MS = 1000 * 60 * 5; // 5 minutos
          if (attempts >= MAX) {
            const until = Date.now() + LOCK_MS;
            localStorage.setItem(LOCK_KEY, String(until));
            setLockedUntil(until);
            localStorage.removeItem(ATTEMPTS_KEY);
            const msg = `Demasiados intentos incorrectos. Cuenta bloqueada ${Math.round(LOCK_MS/60000)} minutos.`;
            setError(msg);
            try { toast.push({ type: 'error', title: 'Cuenta bloqueada', message: msg }); } catch(e){}
          } else {
            const msg = signInError.message || "Credenciales incorrectas";
            setError(msg);
            try { toast.push({ type: 'error', message: msg }); } catch(e){}
          }
        } catch (e) {
          setError(signInError.message || "Credenciales incorrectas");
        }
        setLoading(false);
        return;
      }

      // Login exitoso: limpiar contador de intentos
      try {
        localStorage.removeItem(ATTEMPTS_KEY);
        localStorage.removeItem(LOCK_KEY);
        if (remember) localStorage.setItem("remembered_email", email); else localStorage.removeItem("remembered_email");
      } catch (e) {
        // noop
      }
      // Si la sesión debe persistir, Supabase ya la guarda por defecto.
  try { toast.push({ type: 'success', message: 'Has iniciado sesión correctamente' }); } catch(e){}
  router.push("/dashboard");
    } catch (err: any) {
      setError(err?.message ?? "Error inesperado");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="auth-container">
      <div className="auth-card">
        <h1 className="auth-title">Acceso al sistema</h1>
        <p className="auth-subtitle">Ingresa con tu correo y contraseña para continuar</p>

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

          <div>
            <label className="block text-sm font-medium">Contraseña</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="auth-input"
              placeholder="••••••••"
            />
          </div>

          {error && <div className="auth-error">{error}</div>}

          <div className="auth-aux">
            <div className="flex items-center gap-3">
              <input id="remember" type="checkbox" checked={remember} onChange={(e) => setRemember(e.target.checked)} />
              <label htmlFor="remember" className="text-sm">Recordarme</label>
            </div>

            <div>
              <a href="/auth/forgot" className="auth-link" style={{marginRight: '12px'}}>¿Olvidaste tu contraseña?</a>
              <button type="submit" className="auth-button" disabled={loading}>
                {loading ? "Entrando..." : "Entrar"}
              </button>
            </div>
          </div>

          {lockedUntil && lockedUntil > Date.now() && (
            <div className="auth-error">Cuenta bloqueada temporalmente. Intenta más tarde.</div>
          )}
        </form>

        <p className="mt-4 text-sm">¿No tienes cuenta? <a href="/auth/register" className="auth-link">Regístrate</a></p>
      </div>
    </main>
  );
}
