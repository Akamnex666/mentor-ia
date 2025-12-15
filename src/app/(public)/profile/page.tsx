"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "../../../lib/supabase";
import { useToast } from "../../../providers/ToastProvider";

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
                    router.push("/login");
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
        <>
            <style jsx>{`
                .profile-page-header {
                    position: fixed;
                    top: 0;
                    left: 0;
                    width: 100%;
                    background: rgba(255, 255, 255, 0.98);
                    backdrop-filter: blur(10px);
                    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
                    z-index: 100;
                    padding: 1rem 2rem;
                }

                .profile-page-header-container {
                    max-width: 1400px;
                    margin: 0 auto;
                    display: flex;
                    align-items: center;
                }

                .profile-back-button {
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                    background: transparent;
                    border: none;
                    color: #1f2937;
                    font-size: 1.25rem;
                    font-weight: 600;
                    cursor: pointer;
                    transition: all 0.3s ease;
                    text-decoration: none;
                    padding: 0.5rem;
                    border-radius: 8px;
                }

                .profile-back-button:hover {
                    background: #f3f4f6;
                    color: #4f46e5;
                }

                .profile-logo-mark {
                    color: #1f2937;
                }

                .profile-logo-accent {
                    color: #4f46e5;
                }

                .profile-main-wrapper {
                    padding-top: 5rem;
                    min-height: 100vh;
                    background: linear-gradient(to bottom, #f9fafb, #ffffff);
                }

                .profile-compact-container {
                    max-width: 1200px;
                    margin: 0 auto;
                    padding: 2rem;
                }

                .profile-compact-grid {
                    display: grid;
                    grid-template-columns: 320px 1fr;
                    gap: 2rem;
                    align-items: start;
                }

                .profile-compact-sidebar {
                    background: white;
                    border-radius: 12px;
                    padding: 2rem;
                    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
                    text-align: center;
                }

                .profile-compact-avatar {
                    width: 120px;
                    height: 120px;
                    border-radius: 50%;
                    margin: 0 auto 1rem;
                    box-shadow: 0 4px 12px rgba(79, 70, 229, 0.2);
                }

                .profile-compact-name {
                    font-size: 1.25rem;
                    font-weight: 700;
                    color: #1f2937;
                    margin-bottom: 0.25rem;
                }

                .profile-compact-email {
                    font-size: 0.813rem;
                    color: #6b7280;
                    margin-bottom: 1rem;
                }

                .profile-compact-badge {
                    display: inline-block;
                    padding: 0.5rem 1rem;
                    background: linear-gradient(135deg, #eef2ff, #e0e7ff);
                    color: #4f46e5;
                    border-radius: 8px;
                    font-size: 0.875rem;
                    font-weight: 600;
                    margin-bottom: 1.5rem;
                }

                .profile-compact-signout {
                    width: 100%;
                    padding: 0.65rem 1rem;
                    background: #fef2f2;
                    color: #ef4444;
                    border: 1px solid #fecaca;
                    border-radius: 8px;
                    font-weight: 500;
                    font-size: 0.875rem;
                    cursor: pointer;
                    transition: all 0.3s ease;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 0.5rem;
                }

                .profile-compact-signout:hover {
                    background: #fee2e2;
                    border-color: #fca5a5;
                }

                .profile-compact-form {
                    background: white;
                    border-radius: 12px;
                    padding: 2rem;
                    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
                }

                .profile-compact-title {
                    font-size: 1.5rem;
                    font-weight: 700;
                    color: #1f2937;
                    margin-bottom: 1.5rem;
                }

                .profile-field {
                    margin-bottom: 1.5rem;
                }

                .profile-field-label {
                    display: block;
                    font-size: 0.875rem;
                    font-weight: 600;
                    color: #374151;
                    margin-bottom: 0.5rem;
                }

                .profile-field-input,
                .profile-field-textarea {
                    width: 100%;
                    padding: 0.65rem 1rem;
                    border: 1px solid #e5e7eb;
                    border-radius: 8px;
                    font-size: 0.875rem;
                    font-family: inherit;
                    transition: all 0.3s ease;
                }

                .profile-field-input:focus,
                .profile-field-textarea:focus {
                    outline: none;
                    border-color: #4f46e5;
                    box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.1);
                }

                .profile-field-textarea {
                    min-height: 100px;
                    resize: vertical;
                }

                .profile-field-helper {
                    font-size: 0.75rem;
                    color: #6b7280;
                    margin-top: 0.25rem;
                }

                .profile-field-counter {
                    font-size: 0.75rem;
                    color: #9ca3af;
                    margin-top: 0.25rem;
                    text-align: right;
                }

                .profile-role-grid {
                    display: grid;
                    gap: 0.75rem;
                }

                .profile-role-item {
                    display: flex;
                    align-items: center;
                    gap: 0.75rem;
                    padding: 0.875rem;
                    border: 1px solid #e5e7eb;
                    border-radius: 8px;
                    cursor: pointer;
                    transition: all 0.3s ease;
                }

                .profile-role-item:hover {
                    border-color: #4f46e5;
                    background: #f9fafb;
                }

                .profile-role-item input[type="radio"] {
                    accent-color: #4f46e5;
                }

                .profile-role-item-content {
                    flex: 1;
                }

                .profile-role-item-title {
                    font-weight: 600;
                    color: #1f2937;
                    font-size: 0.875rem;
                }

                .profile-role-item-desc {
                    font-size: 0.75rem;
                    color: #6b7280;
                }

                .profile-actions {
                    display: flex;
                    gap: 1rem;
                    margin-top: 2rem;
                }

                .profile-btn-save {
                    flex: 1;
                    padding: 0.65rem 1.25rem;
                    background: #4f46e5;
                    color: white;
                    border: none;
                    border-radius: 8px;
                    font-weight: 600;
                    font-size: 0.875rem;
                    cursor: pointer;
                    transition: all 0.3s ease;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 0.5rem;
                }

                .profile-btn-save:hover:not(:disabled) {
                    background: #4338ca;
                    transform: translateY(-1px);
                    box-shadow: 0 4px 12px rgba(79, 70, 229, 0.3);
                }

                .profile-btn-save:disabled {
                    opacity: 0.6;
                    cursor: not-allowed;
                }

                .profile-btn-reset {
                    padding: 0.65rem 1.25rem;
                    background: transparent;
                    color: #6b7280;
                    border: 1px solid #e5e7eb;
                    border-radius: 8px;
                    font-weight: 500;
                    font-size: 0.875rem;
                    cursor: pointer;
                    transition: all 0.3s ease;
                }

                .profile-btn-reset:hover {
                    background: #f9fafb;
                    border-color: #d1d5db;
                }

                .profile-tip-box {
                    margin-top: 1.5rem;
                    padding: 1rem;
                    background: #eff6ff;
                    border-left: 3px solid #3b82f6;
                    border-radius: 6px;
                    font-size: 0.813rem;
                    color: #1e40af;
                }

                @media (max-width: 968px) {
                    .profile-compact-grid {
                        grid-template-columns: 1fr;
                    }
                }
            `}</style>

            {/* Header */}
                 <header className="navbar">
            <div className="nav-container">
              <div className="logo">
                <Link href="/dashboard" className="profile-back-button">
                     <i className="fas fa-graduation-cap"></i>        
                <span>MentorIA</span>
                </Link>
              </div>
            </div>
          </header>
                        
                        
    
                {/* Main Content */}
            <div className="profile-main-wrapper">
                <div className="profile-compact-container">
                    <div className="profile-compact-grid">
                        {/* Sidebar */}
                        <aside className="profile-compact-sidebar">
                            <img
                                src={avatarUrl ?? avatarDataUrl(fullName)}
                                alt="Avatar"
                                className="profile-compact-avatar"
                            />
                            <h2 className="profile-compact-name">{fullName || 'Usuario'}</h2>
                            <p className="profile-compact-email">{email}</p>
                            <div className="profile-compact-badge">
                                {role === 'student' ? '👨‍🎓 Estudiante' : role === 'teacher' ? '👨‍🏫 Profesor' : '👤 Otro'}
                            </div>
                            <button onClick={handleSignOut} className="profile-compact-signout">
                                <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                                </svg>
                                Cerrar sesión
                            </button>
                        </aside>

                        {/* Form */}
                        <section className="profile-compact-form">
                            <h3 className="profile-compact-title">Información Personal</h3>
                            <form onSubmit={handleSave}>
                                <div className="profile-field">
                                    <label className="profile-field-label">Nombre Completo</label>
                                    <input
                                        type="text"
                                        className="profile-field-input"
                                        value={fullName}
                                        onChange={(e) => setFullName(e.target.value)}
                                        placeholder="Ej: Juan Pérez García"
                                    />
                                    <p className="profile-field-helper">Este es el nombre que verán otros usuarios</p>
                                </div>

                                <div className="profile-field">
                                    <label className="profile-field-label">Rol en la Plataforma</label>
                                    <div className="profile-role-grid">
                                        {[
                                            { value: 'student', label: '👨‍🎓 Estudiante', desc: 'Acceso a cursos y recursos' },
                                            { value: 'teacher', label: '👨‍🏫 Profesor', desc: 'Crear y gestionar cursos' },
                                            { value: 'other', label: '👤 Otro', desc: 'Rol personalizado' }
                                        ].map((option) => (
                                            <label key={option.value} className="profile-role-item">
                                                <input
                                                    type="radio"
                                                    name="role"
                                                    value={option.value}
                                                    checked={role === option.value}
                                                    onChange={(e) => setRole(e.target.value)}
                                                />
                                                <div className="profile-role-item-content">
                                                    <div className="profile-role-item-title">{option.label}</div>
                                                    <div className="profile-role-item-desc">{option.desc}</div>
                                                </div>
                                            </label>
                                        ))}
                                    </div>
                                </div>

                                <div className="profile-field">
                                    <label className="profile-field-label">Biografía</label>
                                    <textarea
                                        className="profile-field-textarea"
                                        value={bio}
                                        onChange={(e) => setBio(e.target.value)}
                                        placeholder="Cuéntanos sobre ti, tus intereses, experiencia educativa..."
                                        maxLength={500}
                                    />
                                    <p className="profile-field-counter">{bio.length}/500 caracteres</p>
                                </div>

                                <div className="profile-actions">
                                    <button type="submit" className="profile-btn-save" disabled={saving}>
                                        {saving ? (
                                            <>
                                                <svg className="animate-spin" width="16" height="16" fill="none" viewBox="0 0 24 24">
                                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                </svg>
                                                Guardando...
                                            </>
                                        ) : (
                                            <>
                                                <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                                </svg>
                                                Guardar Cambios
                                            </>
                                        )}
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => { setFullName(''); setBio(''); setRole('student'); }}
                                        className="profile-btn-reset"
                                    >
                                        Restablecer
                                    </button>
                                </div>

                                <div className="profile-tip-box">
                                    <strong>💡 Consejo:</strong> Mantén tu perfil actualizado para que otros usuarios conozcan mejor quién eres y qué puedes aportar a la comunidad.
                                </div>
                            </form>
                        </section>
                    </div>
                </div>
            </div>
        </>
    );
}
