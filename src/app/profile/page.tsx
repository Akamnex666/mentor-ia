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

    if (loading) return (
        <div className="profile-container">
            <div className="flex items-center justify-center h-screen">
                <div className="text-center">
                    <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-indigo-200 border-t-indigo-600"></div>
                    <p className="mt-4 text-gray-600 font-medium">Cargando perfil...</p>
                </div>
            </div>
        </div>
    );

    return (
        <main className="profile-container">
            {/* Header Section */}
            <div className="profile-header-section">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="profile-header-title">Mi Perfil</h1>
                        <p className="profile-header-subtitle">Gestiona tu información personal y preferencias</p>
                    </div>
                </div>
            </div>

            <div className="profile-grid-container">
                {/* Left Sidebar - Profile Card */}
                <aside className="profile-sidebar-card">
                    <div className="profile-content">
                        {/* Avatar Section */}
                        <div className="profile-avatar-wrapper">
                            <img
                                src={avatarUrl ?? avatarDataUrl(fullName)}
                                alt="Avatar de perfil"
                                className="profile-avatar-image"
                            />
                            <div className="profile-status-indicator"></div>
                        </div>

                        {/* User Info */}
                        <div className="profile-user-name-section">
                            <h2>{fullName || 'Usuario'}</h2>
                            <p className="profile-user-email">{email}</p>
                        </div>

                        {/* Role Badge */}
                        <div className="profile-role-badge">
                            {role === 'student' ? '👨‍🎓 Estudiante' : role === 'teacher' ? '👨‍🏫 Profesor' : '👤 Otro'}
                        </div>
                    </div>

                    {/* Sign Out Button */}
                    <button
                        onClick={handleSignOut}
                        className="profile-sign-out-button"
                    >
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                        </svg>
                        Cerrar sesión
                    </button>
                </aside>

                {/* Right Content - Profile Form */}
                <section className="profile-main-card">
                    <h3 className="profile-form-title">Información Personal</h3>

                    <form onSubmit={handleSave}>
                        {/* Name Field */}
                        <div className="profile-form-group">
                            <label className="profile-form-label">Nombre Completo</label>
                            <input
                                type="text"
                                className="profile-form-input"
                                value={fullName}
                                onChange={(e) => setFullName(e.target.value)}
                                placeholder="Ej: Juan Pérez García"
                            />
                            <p className="profile-form-helper">Este es el nombre que verán otros usuarios</p>
                        </div>

                        {/* Role Field */}
                        <div className="profile-form-group">
                            <label className="profile-form-label">Rol en la Plataforma</label>
                            <div className="profile-role-options">
                                {[
                                    { value: 'student', label: '👨‍🎓 Estudiante', desc: 'Acceso a cursos y recursos' },
                                    { value: 'teacher', label: '👨‍🏫 Profesor', desc: 'Crear y gestionar cursos' },
                                    { value: 'other', label: '👤 Otro', desc: 'Rol personalizado' }
                                ].map((option) => (
                                    <label key={option.value} className="profile-role-option">
                                        <input
                                            type="radio"
                                            name="role"
                                            value={option.value}
                                            checked={role === option.value}
                                            onChange={(e) => setRole(e.target.value)}
                                        />
                                        <div className="profile-role-option-label">
                                            <div className="profile-role-option-title">{option.label}</div>
                                            <div className="profile-role-option-desc">{option.desc}</div>
                                        </div>
                                    </label>
                                ))}
                            </div>
                        </div>

                        {/* Bio Field */}
                        <div className="profile-form-group">
                            <label className="profile-form-label">Biografía</label>
                            <textarea
                                className="profile-form-textarea"
                                value={bio}
                                onChange={(e) => setBio(e.target.value)}
                                placeholder="Cuéntanos sobre ti, tus intereses, experiencia educativa..."
                                maxLength={500}
                            />
                            <p className="profile-char-counter">{bio.length}/500 caracteres</p>
                        </div>

                        {/* Action Buttons */}
                        <div className="profile-form-actions">
                            <button
                                type="submit"
                                className="profile-submit-button"
                                disabled={saving}
                            >
                                {saving ? (
                                    <>
                                        <svg className="animate-spin h-1 w-1" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Guardando...
                                    </>
                                ) : (
                                    <>
                                        <svg className="w-1 h-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                        </svg>
                                        Guardar Cambios
                                    </>
                                )}
                            </button>
                            <button
                                type="button"
                                onClick={() => { setFullName(''); setBio(''); setRole('student'); }}
                                className="profile-reset-button"
                            >
                                Restablecer
                            </button>
                        </div>
                    </form>

                    {/* Info Box */}
                    <div className="profile-info-box">
                        <p>
                            <span className="profile-info-bold">💡 Consejo:</span> Mantén tu perfil actualizado para que otros usuarios conozcan mejor quién eres y qué puedes aportar a la comunidad.
                        </p>
                    </div>
                </section>
            </div>
        </main>
    );
}
