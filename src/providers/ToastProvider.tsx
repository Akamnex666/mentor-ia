"use client";

import React, { createContext, useContext, useCallback, useState, useEffect } from "react";
import ToastList from "../components/Toast";

type Toast = {
  id: string;
  title?: string;
  message: string;
  type?: "info" | "success" | "warning" | "error";
  duration?: number; // ms
};

type ToastContextValue = {
  push: (t: Omit<Toast, "id">) => string;
  dismiss: (id: string) => void;
};

const ToastContext = createContext<ToastContextValue | null>(null);

export const useToast = () => {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within ToastProvider");
  return ctx;
};

export default function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const push = useCallback((t: Omit<Toast, "id">) => {
    const id = String(Date.now()) + Math.random().toString(36).slice(2, 9);
    const toast: Toast = { id, duration: 5000, ...t };
    setToasts((s) => [...s, toast]);
    return id;
  }, []);

  const dismiss = useCallback((id: string) => {
    setToasts((s) => s.filter((x) => x.id !== id));
  }, []);

  useEffect(() => {
    const timers: Array<{ id: string; t: number }> = [];
    toasts.forEach((toast) => {
      if (!toast.duration) return;
      const t = window.setTimeout(() => {
        setToasts((s) => s.filter((x) => x.id !== toast.id));
      }, toast.duration);
      timers.push({ id: toast.id, t });
    });
    return () => timers.forEach((x) => clearTimeout(x.t));
  }, [toasts]);

  return (
    <ToastContext.Provider value={{ push, dismiss }}>
      {children}
      <ToastList toasts={toasts} onDismiss={dismiss} />
    </ToastContext.Provider>
  );
}
