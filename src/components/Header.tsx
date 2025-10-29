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
      } catch (e) {
        // noop
      }
    };
    load();

    const { data: sub } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null);
    });

    const onDoc = (e: MouseEvent) => {
      if (!ref.current) return;
      if (!ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("click", onDoc);

    return () => {
      mounted = false;
      try { sub?.subscription?.unsubscribe(); } catch (e) {}
      document.removeEventListener("click", onDoc);
    };
  }, []);

  const initials = (name?: string) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map((s) => s[0])
      .slice(0, 2)
      .join("")
      .toUpperCase();
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setOpen(false);
    toast.push({ type: "info", message: "Has cerrado sesión" });
    router.push("/");
  };

  return (
    <header className="w-full border-b bg-white">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/" className="text-lg font-bold">MentorIA</Link>
        </div>

        <div className="flex items-center gap-4" ref={ref}>
          {!user ? (
            <>
              <Link href="/auth/login" className="auth-link">Entrar</Link>
              <Link href="/auth/register" className="auth-button">Registrarse</Link>
            </>
          ) : (
            <div className="relative">
              <button aria-haspopup="true" onClick={() => setOpen((v) => !v)} className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-sm font-medium">
                  {initials((user.user_metadata as any)?.full_name ?? user.email)}
                </div>
                <span className="hidden sm:inline text-sm">{((user.user_metadata as any)?.full_name) || user.email}</span>
              </button>

              {open && (
                <div className="absolute right-0 mt-2 w-44 bg-white border rounded shadow-md z-40">
                  <Link href="/profile" className="block px-4 py-2 text-sm hover:bg-gray-50">Perfil</Link>
                  <button onClick={handleSignOut} className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50">Cerrar sesión</button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
