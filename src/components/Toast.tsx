"use client";

import React from "react";

type ToastItem = {
  id: string;
  title?: string;
  message: string;
  type?: "info" | "success" | "warning" | "error";
};

export default function ToastList({ toasts, onDismiss }: { toasts: ToastItem[]; onDismiss: (id: string) => void }) {
  return (
    <div aria-live="polite" className="fixed z-50 bottom-6 right-6 flex flex-col gap-2 max-w-sm">
      {toasts.map((t) => (
        <div key={t.id} className={`rounded shadow-lg p-3 bg-white border ${t.type === 'error' ? 'border-red-300' : t.type === 'success' ? 'border-green-300' : 'border-gray-200'}`}>
          <div className="flex items-start gap-2">
            <div className="flex-1">
              {t.title && <div className="font-semibold">{t.title}</div>}
              <div className="text-sm text-gray-700">{t.message}</div>
            </div>
            <button aria-label="Cerrar" onClick={() => onDismiss(t.id)} className="text-gray-400 hover:text-gray-600">×</button>
          </div>
        </div>
      ))}
    </div>
  );
}
