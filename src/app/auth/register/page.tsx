"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../../lib/supabase";
import { useToast } from "../../../providers/ToastProvider";

export default function RegisterPage() {
    const router = useRouter();
    const toast = useToast();
    const [email, setEmail] = useState("");
    const [fullName, setFullName] = useState("");
    const [password, setPassword] = useState("");
    const [role, setRole] = useState("student");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [message, setMessage] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setMessage(null);
        try {
            const { data, error: signUpError } = await supabase.auth.signUp({
                email,
                password,
                options: { data: { full_name: fullName, role } },
            });
            if (signUpError) {
                const msg = signUpError.message;
                setError(msg);
                try { toast.push({ type: 'error', message: msg }); } catch (e) { }
                setLoading(false);
                return;
            }

            try {
                if ((data as any)?.user?.id) {
                    await supabase.from("profiles").insert([
                        { id: (data as any).user.id, email, full_name: fullName, role },
                    ]);
                }
            } catch (e) {
                // ignore profile insert errors
            }

            const ok = "Registro enviado. Revisa tu correo para confirmar (si procede).";
            setMessage(ok);
            try { toast.push({ type: 'success', message: ok }); } catch (e) { }
            setTimeout(() => router.push("/auth/login"), 1200);
        } catch (err: any) {
            setError(err?.message ?? "Error inesperado");
        } finally {
            setLoading(false);
        }
    };

    return (
        <main className="auth-container">
            <div className="auth-card">
                <h1 className="auth-title">Crear cuenta</h1>
                <p className="auth-subtitle">Regístrate para acceder a MentorIA</p>

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
                        <label className="block text-sm font-medium">Nombre completo</label>
                        <input
                            type="text"
                            required
                            value={fullName}
                            onChange={(e) => setFullName(e.target.value)}
                            className="auth-input"
                            placeholder="Tu nombre completo"
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
                            placeholder="Crea una contraseña segura"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium">Tipo de usuario</label>
                        <select value={role} onChange={(e) => setRole(e.target.value)} className="auth-input">
                            <option value="student">Estudiante</option>
                            <option value="teacher">Profesor</option>
                            <option value="other">Otro</option>
                        </select>
                    </div>

                    {error && <div className="auth-error">{error}</div>}
                    {message && <div className="auth-success">{message}</div>}

                    <div className="mt-2">
                        <button type="submit" className="auth-button" disabled={loading}>
                            {loading ? "Registrando..." : "Crear cuenta"}
                        </button>
                    </div>
                </form>

                <p className="mt-4 text-sm">
                    ¿Ya tienes cuenta? <a href="/auth/login" className="auth-link">Inicia sesión</a>
                </p>
            </div>
        </main>
    );
}
