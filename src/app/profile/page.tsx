"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../lib/supabase";
import { useToast } from "../../providers/ToastProvider";

export default function ProfilePage() {
    const router = useRouter();
    const toast = useToast();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [email, setEmail] = useState("");
    const [fullName, setFullName] = useState("");
    const [role, setRole] = useState("student");

    useEffect(() => {
        let mounted = true;
        const load = async () => {
            setLoading(true);
            try {
                const { data: userData, error: userErr } = await supabase.auth.getUser();
                const user = userData?.user;
                if (userErr || !user) {
                    // no hay usuario -> redirigir a login
                    router.push("/auth/login");
                    return;
                }

                setEmail(user.email ?? "");

                // leer tabla profiles si existe
                const { data: profile, error: profileErr } = await supabase
                    .from("profiles")
                    .select("full_name, role")
                    .eq("id", user.id)
                    .single();

                if (!profileErr && profile) {
                    if (mounted) {
                        setFullName((profile as any).full_name ?? "");
                        setRole((profile as any).role ?? "student");
                    }
                } else {
                    // si no existe en profiles, intentar leer de metadata
                    setFullName((user.user_metadata as any)?.full_name ?? "");
                    setRole((user.user_metadata as any)?.role ?? "student");
                }
            } catch (err: any) {
                toast.push({ type: "error", message: "No se pudo cargar el perfil" });
            } finally {
                if (mounted) setLoading(false);
            }
        };
        load();
        return () => {
            mounted = false;
        };
    }, [router, toast]);

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        try {
            // actualizar metadata en Auth
            const { error: authErr } = await supabase.auth.updateUser({ data: { full_name: fullName, role } });
            if (authErr) throw authErr;

            // upsert en tabla profiles
            const { error: upsertErr } = await supabase.from("profiles").upsert([
                { id: (await supabase.auth.getUser()).data?.user?.id, email, full_name: fullName, role },
            ]);
            if (upsertErr) throw upsertErr;

            toast.push({ type: "success", message: "Perfil actualizado" });
        } catch (err: any) {
            toast.push({ type: "error", message: err?.message ?? "Error al guardar" });
        } finally {
            setSaving(false);
        }
    };

    const handleSignOut = async () => {
        await supabase.auth.signOut();
        router.push("/");
    };

    if (loading) return <div className="p-6">Cargando perfil...</div>;

    return (
        <main className="p-6 max-w-2xl mx-auto">
            <h1 className="text-2xl font-semibold mb-4">Mi Perfil</h1>
            <form onSubmit={handleSave} className="space-y-4">
                <div>
                    <label className="block text-sm font-medium">Correo</label>
                    <input className="auth-input" value={email} readOnly />
                </div>

                <div>
                    <label className="block text-sm font-medium">Nombre completo</label>
                    <input
                        className="auth-input"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder="Tu nombre completo"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium">Rol</label>
                    <select value={role} onChange={(e) => setRole(e.target.value)} className="auth-input">
                        <option value="student">Estudiante</option>
                        <option value="teacher">Profesor</option>
                        <option value="other">Otro</option>
                    </select>
                </div>

                <div className="flex gap-3">
                    <button type="submit" className="auth-button" disabled={saving}>{saving ? 'Guardando...' : 'Guardar cambios'}</button>
                    <button type="button" onClick={handleSignOut} className="auth-link">Cerrar sesión</button>
                </div>
            </form>
        </main>
    );
}
