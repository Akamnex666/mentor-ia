"use client";

import React, { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "../lib/supabase";
import { useToast } from "../providers/ToastProvider";

export default function Header() {
    const [user, setUser] = useState<any | null>(null);
    const [open, setOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const toast = useToast();
    const router = useRouter();
    const ref = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        let mounted = true;
        const load = async () => {
            try {
                const { data } = await supabase.auth.getUser();
                if (!mounted) return;
                setUser(data?.user ?? null);
            } catch (e) { }
        };
        load();

        const { data: sub } = supabase.auth.onAuthStateChange((_, session) => {
            setUser(session?.user ?? null);
        });

        const onDoc = (e: MouseEvent) => {
            if (!ref.current) return;
            if (!ref.current.contains(e.target as Node)) setOpen(false);
        };
        document.addEventListener("click", onDoc);

        return () => {
            mounted = false;
            try { sub?.subscription?.unsubscribe(); } catch (e) { }
            document.removeEventListener("click", onDoc);
        };
    }, []);

    const handleSignOut = async () => {
        await supabase.auth.signOut();
        setUser(null);
        setOpen(false);
        try { toast.push({ type: "info", message: "Has cerrado sesión" }); } catch (e) { }
        router.push("/");
    };

    const handleSearch = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter' && searchQuery.trim()) {
            router.push(`/dashboard?search=${encodeURIComponent(searchQuery)}`);
        }
    };

    return (
        <header className="site-header">
            <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Link href="/" className="logo">
                        <span className="logo-mark">Mentor</span>
                        <span className="logo-accent">IA</span>
                    </Link>
                </div>

                {user && (
                    <div className="header-search-container">
                        <i className="fas fa-search header-search-icon"></i>
                        <input
                            type="text"
                            placeholder="Buscar..."
                            className="header-search-input"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            onKeyPress={handleSearch}
                            spellCheck="false"
                        />
                    </div>
                )}

                <div className="flex items-center gap-4 header-right">
                    {!user ? (
                        <>
                            <Link href="/auth/login" className="auth-link">Entrar</Link>
                            <Link href="/auth/register" className="btn-register">Registrarse</Link>
                        </>
                    ) : (
                        <div className="user-dropdown-container" ref={ref}>
                            <button
                                className="user-avatar-button"
                                onClick={() => setOpen(!open)}
                            >
                                <div className="user-avatar">
                                    {user?.email?.[0].toUpperCase() || 'U'}
                                </div>
                                <i className={`fas fa-chevron-down dropdown-icon ${open ? 'open' : ''}`}></i>
                            </button>

                            {open && (
                                <div className="user-dropdown-menu">
                                    <div className="dropdown-header">
                                        <p className="dropdown-email">{user?.email}</p>
                                    </div>
                                    <div className="dropdown-divider"></div>
                                    <Link href="/profile" className="dropdown-item" onClick={() => setOpen(false)}>
                                        <i className="fas fa-user"></i>
                                        <span>Mi Perfil</span>
                                    </Link>
                                    <div className="dropdown-divider"></div>
                                    <button onClick={handleSignOut} className="dropdown-item logout">
                                        <i className="fas fa-sign-out-alt"></i>
                                        <span>Cerrar sesión</span>
                                    </button>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
}
