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
    const [bio, setBio] = useState("");
    const [avatarUrl, setAvatarUrl] = useState<string | null>(null);

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
                        setBio((profile as any).bio ?? "");
                        setAvatarUrl((profile as any).avatar_url ?? null);
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
            const userId = (await supabase.auth.getUser()).data?.user?.id;
            const { error: upsertErr } = await supabase.from("profiles").upsert([
                { id: userId, email, full_name: fullName, role, bio, avatar_url: avatarUrl },
            ]);
            if (upsertErr) throw upsertErr;

            toast.push({ type: "success", message: "Perfil actualizado" });
        } catch (err: any) {
            toast.push({ type: "error", message: err?.message ?? "Error al guardar" });
        } finally {
            setSaving(false);
        }
    };

    // Nota: hemos eliminado la subida manual de avatar porque daba problemas.
    // En su lugar mostramos un avatar por defecto si no hay uno en `avatarUrl`.

    const handleSignOut = async () => {
        await supabase.auth.signOut();
        router.push("/");
    };

    const initialsFromName = (name = "") => {
        if (!name) return "U";
        return name
            .split(" ")
            .map((s) => s[0])
            .slice(0, 2)
            .join("")
            .toUpperCase();
    };

    const colorFromName = (name = "") => {
        // simple hash to pick a background color
        let hash = 0;
        for (let i = 0; i < name.length; i++) {
            hash = name.charCodeAt(i) + ((hash << 5) - hash);
        }
        const colors = ["#4f46e5", "#7c3aed", "#0ea5a4", "#ef4444", "#f59e0b", "#10b981"];
        return colors[Math.abs(hash) % colors.length];
    };

    const avatarDataUrl = (name = "") => {
        const initials = initialsFromName(name);
        const bg = colorFromName(name);
        const svg = `<?xml version='1.0' encoding='utf-8'?>\n<svg xmlns='http://www.w3.org/2000/svg' width='160' height='160' viewBox='0 0 160 160'>\n  <rect width='160' height='160' rx='20' fill='${bg}' />\n  <text x='50%' y='50%' dominant-baseline='middle' text-anchor='middle' font-family='Poppins, Inter, sans-serif' font-size='56' fill='#ffffff' font-weight='700'>${initials}</text>\n</svg>`;
        return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
    };

    if (loading) return <div className="p-6">Cargando perfil...</div>;

    return (
        <main className="p-8 max-w-6xl mx-auto">
            <h1 className="text-3xl font-bold mb-6">Mi Perfil</h1>

            <div className="profile-grid">
                <aside className="profile-card">
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
                        <div className="avatar-circle">
                            <img src={avatarUrl ?? avatarDataUrl(fullName)} alt="Avatar" />
                        </div>

                        <div style={{ textAlign: 'center' }}>
                            <h2 className="text-lg font-semibold">{fullName || 'Usuario'}</h2>
                            <p className="text-sm text-gray-600">{email}</p>
                        </div>

                        <div className="profile-actions">
                            <button className="btn-secondary" onClick={handleSignOut}>Cerrar sesión</button>
                        </div>
                    </div>
                </aside>

                <section className="profile-form-card">
                    <form onSubmit={handleSave} className="space-y-4">
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
                            <label className="block text-sm font-medium">Biografía</label>
                            <textarea className="auth-input" style={{ minHeight: 120 }} value={bio} onChange={(e) => setBio(e.target.value)} placeholder="Cuéntanos sobre ti"></textarea>
                        </div>

                        <div>
                            <label className="block text-sm font-medium">Rol</label>
                            <select value={role} onChange={(e) => setRole(e.target.value)} className="auth-input">
                                <option value="student">Estudiante</option>
                                <option value="teacher">Profesor</option>
                                <option value="other">Otro</option>
                            </select>
                        </div>

                        <div className="flex items-center gap-4">
                            <button type="submit" className="btn-primary" disabled={saving}>{saving ? 'Guardando...' : 'Guardar cambios'}</button>
                            <button type="button" onClick={() => { setFullName(''); setBio(''); setRole('student'); }} className="auth-link">Restablecer</button>
                        </div>
                    </form>
                </section>
            </div>
        </main>
    );
}
