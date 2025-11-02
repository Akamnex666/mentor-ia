"use client";
import { useEffect } from "react";

type A11yState = {
  contrast?: boolean;
  textScale?: number;
  increasedSpacing?: boolean;
  dyslexicFont?: boolean;
  largeControls?: boolean;
  keyboardNav?: boolean;
  largeButtons?: boolean;
  shortcuts?: { toggleMenu?: string; skipToContent?: string };
  blockAuto?: boolean;
  font?: string;
  accentColor?: string;
  linkHighlight?: boolean;
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

    if (p.largeControls || p.largeButtons) {
      root.classList.add("a11y-large-controls");
      document.body && document.body.classList.add('a11y-large-controls');
    } else {
      root.classList.remove("a11y-large-controls");
      document.body && document.body.classList.remove('a11y-large-controls');
    }

    if (p.keyboardNav) { root.classList.add('a11y-keyboard-nav'); document.body && document.body.classList.add('a11y-keyboard-nav'); }
    else { root.classList.remove('a11y-keyboard-nav'); document.body && document.body.classList.remove('a11y-keyboard-nav'); }

    if (typeof p.textScale === "number") {
      root.style.setProperty("--a11y-text-scale", String(p.textScale));
    }
    if (p.font) {
      root.style.setProperty("--a11y-font", p.font);
      root.classList.add("a11y-custom-font");
    } else {
      root.style.removeProperty("--a11y-font");
      root.classList.remove("a11y-custom-font");
    }
    if (p.accentColor) {
      root.style.setProperty("--a11y-accent", p.accentColor);
    }
    if (p.linkHighlight) root.classList.add("a11y-link-highlight");
    else root.classList.remove("a11y-link-highlight");
    if (p.linkHighlight) document.body && document.body.classList.add('a11y-link-highlight'); else document.body && document.body.classList.remove('a11y-link-highlight');
  } catch (e) {
    // ignore
  }
}

export default function SyncA11y() {
  useEffect(() => {
    let origScrollTo: any = (window as any).scrollTo;
    let origScrollBy: any = (window as any).scrollBy;
    const origScrollIntoView = Element.prototype.scrollIntoView;
    const mediaPlayHandler = (ev: Event) => { try { (ev.target as HTMLMediaElement).pause(); } catch(e){} };

    function enableBlockAuto() {
      try {
        (window as any).scrollTo = function(){};
        (window as any).scrollBy = function(){};
        Element.prototype.scrollIntoView = function(){} as any;
        const medias = Array.from(document.querySelectorAll('audio,video')) as HTMLMediaElement[];
        medias.forEach(m=>{ try{ m.pause(); m.addEventListener('play', mediaPlayHandler); }catch(e){} });
      } catch(e){}
    }

    function disableBlockAuto() {
      try {
        (window as any).scrollTo = origScrollTo;
        (window as any).scrollBy = origScrollBy;
        Element.prototype.scrollIntoView = origScrollIntoView;
        const medias = Array.from(document.querySelectorAll('audio,video')) as HTMLMediaElement[];
        medias.forEach(m=>{ try{ m.removeEventListener('play', mediaPlayHandler); }catch(e){} });
      } catch(e){}
    }

    function handleKey(e: KeyboardEvent) {
      try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if(!raw) return;
        const prefs = JSON.parse(raw) as A11yState;
        const parts = [] as string[];
        if(e.ctrlKey) parts.push('ctrl');
        if(e.altKey) parts.push('alt');
        if(e.shiftKey) parts.push('shift');
        const key = (e.key || '').toLowerCase();
        if(!['control','alt','shift','meta'].includes(key)) parts.push(key);
        const combo = parts.join('+');
        if(prefs.shortcuts && prefs.shortcuts.toggleMenu && combo === prefs.shortcuts.toggleMenu) {
          const btn = document.querySelector('[data-a11y-fab]') as HTMLElement | null;
          if(btn) btn.click();
        }
        if(prefs.shortcuts && prefs.shortcuts.skipToContent && combo === prefs.shortcuts.skipToContent) {
          const target = document.getElementById('inicio') || document.querySelector('main');
          if(target) {
            try{ (target as HTMLElement).focus(); }catch(e){}
            try{ (target as HTMLElement).scrollIntoView({behavior:'smooth'}); }catch(e){}
          }
        }
      } catch(e){}
    }

    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as A11yState;
        // support old largeText -> textScale
        if (typeof (parsed as any).largeText === "boolean") {
          parsed.textScale = (parsed as any).largeText ? 1.15 : 1;
        }
        applyPrefs(parsed);
        if(parsed.blockAuto) enableBlockAuto(); else disableBlockAuto();
      }
    } catch (e) {}

    const onStorage = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY) {
        try {
          const parsed = e.newValue ? (JSON.parse(e.newValue) as A11yState) : null;
          applyPrefs(parsed);
          if(parsed && parsed.blockAuto) enableBlockAuto(); else disableBlockAuto();
        } catch (err) {}
      }
    };
    window.addEventListener("storage", onStorage);
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener("storage", onStorage);
      window.removeEventListener('keydown', handleKey);
      disableBlockAuto();
  }, []);

  return null;
}
