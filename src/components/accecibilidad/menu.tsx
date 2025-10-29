"use client"
import React, { useEffect, useState } from "react";
import styles from "./accessibility.module.css";

type A11yState = {
  contrast: boolean;
  largeText: boolean;
  increasedSpacing: boolean;
  dyslexicFont: boolean;
};

const STORAGE_KEY = "site_a11y_prefs";

export default function AccessibilityMenu() {
  const [open, setOpen] = useState(false);
  const [state, setState] = useState<A11yState>({
    contrast: false,
    largeText: false,
    increasedSpacing: false,
    dyslexicFont: false,
  });

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setState(JSON.parse(raw));
    } catch (e) {
      // ignore
    }
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    toggleClass(root, "a11y-contrast", state.contrast);
    toggleClass(root, "a11y-large-text", state.largeText);
    toggleClass(root, "a11y-spacing", state.increasedSpacing);
    toggleClass(root, "a11y-dyslexic-font", state.dyslexicFont);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (e) {}
  }, [state]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.altKey || e.metaKey) && e.key.toLowerCase() === "m") {
        setOpen((o) => !o);
      }
      if (e.key === "Escape") {
        setOpen(false);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  function toggleClass(el: Element, className: string, enabled: boolean) {
    if (enabled) el.classList.add(className);
    else el.classList.remove(className);
  }

  function update<K extends keyof A11yState>(key: K, val: A11yState[K]) {
    setState((s) => ({ ...s, [key]: val }));
  }

  return (
    <div className={styles.container} aria-hidden={false}>
      <button
        aria-expanded={open}
        aria-controls="a11y-panel"
        className={styles.fab}
        onClick={() => setOpen((o) => !o)}
        title="Opciones de accesibilidad (Alt+M)"
      >
        ♿
      </button>

      <aside
        id="a11y-panel"
        className={`${styles.panel} ${open ? styles.open : ""}`}
        role="dialog"
        aria-label="Panel de accesibilidad"
      >
        <header className={styles.header}>
          <strong>Accesibilidad</strong>
          <button onClick={() => setOpen(false)} aria-label="Cerrar">
            ✕
          </button>
        </header>

        <div className={styles.section}>
          <h4>Visual</h4>
          <label className={styles.row}>
            <input
              type="checkbox"
              checked={state.contrast}
              onChange={(e) => update("contrast", e.target.checked)}
            />
            Alto contraste / modo oscuro
          </label>

          <label className={styles.row}>
            <input
              type="checkbox"
              checked={state.largeText}
              onChange={(e) => update("largeText", e.target.checked)}
            />
            Aumentar tamaño de texto
          </label>

          <label className={styles.row}>
            <input
              type="checkbox"
              checked={state.dyslexicFont}
              onChange={(e) => update("dyslexicFont", e.target.checked)}
            />
            Fuente legible (estilo disléxico)
          </label>

          <label className={styles.row}>
            <input
              type="checkbox"
              checked={state.increasedSpacing}
              onChange={(e) => update("increasedSpacing", e.target.checked)}
            />
            Aumentar espaciado entre letras y líneas
          </label>
        </div>

        <div className={styles.section}>
          <h4>Auditiva</h4>
          <p className={styles.note}>
            Herramientas auditivas como subtítulos o transcripción deben
            activarse por la entidad de media (placeholder).
          </p>
          <button
            className={styles.small}
            onClick={() => alert("Funcionalidad de subtítulos (placeholder)")}
          >
            Activar subtítulos (placeholder)
          </button>
        </div>

        <div className={styles.section}>
          <h4>Motriz</h4>
          <p className={styles.note}>
            Atajos y navegación por teclado ya son soportados; use Tab/Enter/Esc.
            (Opciones avanzadas: placeholder)
          </p>
          <button
            className={styles.small}
            onClick={() =>
              alert("Activar navegación por teclado (placeholder)")
            }
          >
            Configurar atajos (placeholder)
          </button>
        </div>

        <footer className={styles.footer}>
          <small>Preferencias guardadas localmente.</small>
        </footer>
      </aside>
    </div>
  );
}