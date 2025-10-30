"use client";
import { useEffect } from "react";

type A11yState = {
  contrast?: boolean;
  textScale?: number;
  increasedSpacing?: boolean;
  dyslexicFont?: boolean;
  largeControls?: boolean;
};

const STORAGE_KEY = "site_a11y_prefs";

function applyPrefs(p: A11yState | null) {
  const root = document.documentElement;
  if (!root) return;
  try {
    if (!p) return;
    if (p.contrast) root.classList.add("a11y-contrast");
    else root.classList.remove("a11y-contrast");

    if (p.increasedSpacing) root.classList.add("a11y-spacing");
    else root.classList.remove("a11y-spacing");

    if (p.dyslexicFont) root.classList.add("a11y-dyslexic-font");
    else root.classList.remove("a11y-dyslexic-font");

    if (p.largeControls) root.classList.add("a11y-large-controls");
    else root.classList.remove("a11y-large-controls");

    if (typeof p.textScale === "number") {
      root.style.setProperty("--a11y-text-scale", String(p.textScale));
    }
  } catch (e) {
    // ignore
  }
}

export default function SyncA11y() {
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as A11yState;
        // support old largeText -> textScale
        if (typeof (parsed as any).largeText === "boolean") {
          parsed.textScale = (parsed as any).largeText ? 1.15 : 1;
        }
        applyPrefs(parsed);
      }
    } catch (e) {}

    const onStorage = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY) {
        try {
          const parsed = e.newValue ? (JSON.parse(e.newValue) as A11yState) : null;
          applyPrefs(parsed);
        } catch (err) {}
      }
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  return null;
}
