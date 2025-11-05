"use client";

import React, { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "../lib/supabase";
import { useToast } from "../providers/ToastProvider";

export default function Header() {
  const [user, setUser] = useState<any | null>(null);
  const [open, setOpen] = useState(false);
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
      } catch (e) {}
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
      try {
        sub?.subscription?.unsubscribe();
      } catch (e) {}
      document.removeEventListener("click", onDoc);
    };
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    try {
      toast.push({ type: "info", message: "Has cerrado sesión" });
    } catch (e) {}
    router.push("/");
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

        <div className="flex items-center gap-4 header-right" ref={ref}>
          {!user ? (
            <>
              <Link href="/auth/login" className="auth-link">
                Entrar
              </Link>
              <Link href="/auth/register" className="btn-register">
                Registrarse
              </Link>
            </>
          ) : (
            <div className="flex items-center gap-3">
              <Link href="/profile" className="profile-btn">
                <span className="profile-name">Perfil</span>
              </Link>

              <button onClick={handleSignOut} className="btn-logout" title="Cerrar sesión">
                <i className="fas fa-sign-out-alt"></i>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
