"use client"
import React, { useEffect, useState } from "react";
import styles from "./accessibility.module.css";

type A11yState = {
  contrast: boolean;
  // textScale: 1 = normal, 1.15 = medio, 1.3 = grande
  textScale: number;
  increasedSpacing: boolean;
  dyslexicFont: boolean;
  font?: string;
  accentColor?: string;
  linkHighlight?: boolean;
};

const STORAGE_KEY = "site_a11y_prefs";

export default function AccessibilityMenu() {
  const [open, setOpen] = useState(false);
  const [state, setState] = useState<A11yState>({
    contrast: false,
    textScale: 1,
    increasedSpacing: false,
    dyslexicFont: false,
    font: undefined,
    accentColor: undefined,
    linkHighlight: false,
  });
  const [speaking, setSpeaking] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        // migration: older saved value used `largeText: true` — map to textScale
        if (typeof parsed.largeText === "boolean") {
          parsed.textScale = parsed.largeText ? 1.15 : 1;
          delete parsed.largeText;
        }
        setState((s) => ({ ...s, ...parsed }));
      }
    } catch (e) {
      // ignore
    }
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    toggleClass(root, "a11y-contrast", state.contrast);
    toggleClass(root, "a11y-spacing", state.increasedSpacing);
    toggleClass(root, "a11y-dyslexic-font", state.dyslexicFont);
    if (state.font) {
      try {
        root.style.setProperty('--a11y-font', state.font);
        root.classList.add('a11y-custom-font');
        document.body.classList.add('a11y-custom-font');
        document.body.style.fontFamily = state.font;
      } catch (e) {}
    } else {
      try {
        root.style.removeProperty('--a11y-font');
        root.classList.remove('a11y-custom-font');
        document.body.classList.remove('a11y-custom-font');
        document.body.style.fontFamily = '';
      } catch (e) {}
    }
    if (state.accentColor) {
      try { root.style.setProperty('--a11y-accent', state.accentColor); document.body.style.setProperty('--a11y-accent', state.accentColor); } catch(e){}
    } else {
      try { root.style.removeProperty('--a11y-accent'); document.body.style.removeProperty('--a11y-accent'); } catch(e){}
    }
    toggleClass(root, 'a11y-link-highlight', !!state.linkHighlight);
    toggleClass(document.body, 'a11y-link-highlight', !!state.linkHighlight);
    // apply text scale via CSS variable for predictable behaviour
    try {
      root.style.setProperty("--a11y-text-scale", String(state.textScale));
    } catch (e) {}
    // also apply a direct inline fallback for contrast so it always takes
    // effect even if other global CSS rules are very specific.
    // Avoid mutating inline background styles on <html> or <body> here because
    // changing attributes/styles before or during hydration can trigger
    // hydration mismatches. Visual changes for contrast are handled by
    // CSS rules tied to the `.a11y-contrast` class.

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (e) {}

    // debugging: log current classes and state (can be removed later)
    try {
      // eslint-disable-next-line no-console
      console.log("[a11y] state:", state, "html.classes:", document.documentElement.className);
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

  // clean up speech on unmount
  useEffect(() => {
    return () => {
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  function toggleClass(el: Element, className: string, enabled: boolean) {
    if (enabled) el.classList.add(className);
    else el.classList.remove(className);
  }

  function update<K extends keyof A11yState>(key: K, val: A11yState[K]) {
    setState((s) => ({ ...s, [key]: val }));
  }

  function increaseText() {
    setState((s) => ({ ...s, textScale: Math.min(1.5, +(s.textScale + 0.15).toFixed(2)) }));
  }

  function decreaseText() {
    setState((s) => ({ ...s, textScale: Math.max(0.85, +(s.textScale - 0.15).toFixed(2)) }));
  }

  function resetPreferences() {
    const clean: A11yState = { contrast: false, textScale: 1, increasedSpacing: false, dyslexicFont: false, font: undefined, accentColor: undefined, linkHighlight: false };
    setState(clean);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (e) {}
  }

  function speakPage() {
    if (!("speechSynthesis" in window)) {
      alert("TTS no soportado en este navegador");
      return;
    }
    const text = document.body.innerText.replace(/\s+/g, " ").trim();
    if (!text) return;
    const utter = new SpeechSynthesisUtterance(text.substring(0, 20000));
    utter.lang = document.documentElement.lang || "es-ES";
    utter.onend = () => setSpeaking(false);
    utter.onerror = () => setSpeaking(false);
    setSpeaking(true);
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utter);
  }

  function stopSpeaking() {
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
      setSpeaking(false);
    }
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
          <div className={styles.row}>
            <span>Escala de texto</span>
            <div className={styles.controlGroup}>
              <button className={styles.small} onClick={decreaseText} aria-label="Disminuir tamaño">A-</button>
              <span aria-live="polite" className={styles.scaleLabel}>{Math.round(state.textScale * 100)}%</span>
              <button className={styles.small} onClick={increaseText} aria-label="Aumentar tamaño">A+</button>
              <button className={styles.small} onClick={() => resetPreferences()} aria-label="Restablecer preferencias">Reset</button>
            </div>
          </div>

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
              checked={state.dyslexicFont}
              onChange={(e) => update("dyslexicFont", e.target.checked)}
            />
            Fuente legible (estilo disléxico)
          </label>

          <div className={styles.row} style={{flexDirection:'column',alignItems:'flex-start'}}>
            <label style={{width:'100%'}}>Tipo de fuente</label>
            <select value={state.font || ''} onChange={(e)=> update('font', e.target.value || undefined)} style={{padding:'6px',borderRadius:6}}>
              <option value="">Sistema (por defecto)</option>
              <option value="Poppins, system-ui, -apple-system, 'Segoe UI', Roboto, Arial">Poppins</option>
              <option value="Inter, system-ui, -apple-system, 'Segoe UI', Roboto, Arial">Inter</option>
              <option value="'Open Sans', system-ui, -apple-system, 'Segoe UI', Roboto, Arial">Open Sans</option>
              <option value="Roboto, system-ui, -apple-system, 'Segoe UI', Arial">Roboto</option>
            </select>
          </div>

          <div className={styles.row} style={{flexDirection:'column',alignItems:'flex-start'}}>
            <label>Color personalizado</label>
            <input type="color" value={state.accentColor || '#79b8ff'} onChange={(e)=> update('accentColor', e.target.value)} />
          </div>

          <label className={styles.row}>
            <input type="checkbox" checked={!!state.linkHighlight} onChange={(e)=> update('linkHighlight', e.target.checked)} />
            Resaltar enlaces y foco visible
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
          <div style={{ display: "flex", gap: "0.5rem", alignItems: "center", flexWrap: "wrap" }}>
            <button
              className={styles.small}
              onClick={() => alert("Funcionalidad de subtítulos (placeholder)")}
            >
              Activar subtítulos
            </button>
            <button
              className={styles.small}
              onClick={() => (speaking ? stopSpeaking() : speakPage())}
              aria-pressed={speaking}
            >
              {speaking ? "Detener lectura" : "Leer página"}
            </button>
          </div>
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