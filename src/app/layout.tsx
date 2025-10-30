// app/layout.tsx
import type { Metadata } from "next";
import "../styles/globals.css"; // acá va tu CSS global (lo que era styles.css en el HTML)
import ToastProvider from "../providers/ToastProvider";
import { Poppins, Inter } from "next/font/google";
import AccessibilityMenu from "../components/accecibilidad/menu";
import SyncA11y from "../components/accecibilidad/SyncA11y";
import Script from 'next/script';

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-poppins",
});

const inter = Inter({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "MentorIA - Plataforma Educativa Inteligente",
  description:
    "Crea contenido educativo con IA: resúmenes, cuestionarios adaptativos y material didáctico en segundos.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" className={`${poppins.variable} ${inter.variable}`}>
      <head>
        <link
          rel="stylesheet"
          href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css"
        />
        {/* Apply saved accessibility preferences to <html> before React hydrates.
            This prevents a flash of the default (light) layout when contrast/text-scale
            were previously enabled by the user. */}
        <Script id="a11y-init" strategy="beforeInteractive" dangerouslySetInnerHTML={{ __html: `
          (function(){
            try{
              var raw = localStorage.getItem('site_a11y_prefs');
              if(!raw) return;
              var prefs = JSON.parse(raw);
              var root = document.documentElement;
              if(!root) return;
              if(prefs.contrast) root.classList.add('a11y-contrast'); else root.classList.remove('a11y-contrast');
              if(prefs.increasedSpacing) root.classList.add('a11y-spacing'); else root.classList.remove('a11y-spacing');
              if(prefs.dyslexicFont) root.classList.add('a11y-dyslexic-font'); else root.classList.remove('a11y-dyslexic-font');
              if(prefs.largeControls) root.classList.add('a11y-large-controls'); else root.classList.remove('a11y-large-controls');
              if(typeof prefs.textScale === 'number') root.style.setProperty('--a11y-text-scale', String(prefs.textScale));
              // fallback background to avoid white flash when contrast is enabled
              if(prefs.contrast){ document.documentElement.style.backgroundColor = '#1a1a1a'; document.body && (document.body.style.backgroundColor = '#1a1a1a'); }
            }catch(e){}
          })();
        ` }} />
      </head>

      <body>
        <ToastProvider>
          {/* Sync saved a11y prefs early so layout elements render correctly */}
          <SyncA11y />

          {children}

          {/* Menú de accesibilidad (siempre disponible) */}
          <AccessibilityMenu />

          <footer className="w-full border-t mt-8 p-4 text-sm text-center text-gray-600">
            <div className="max-w-4xl mx-auto flex flex-col md:flex-row items-center justify-between gap-2">
              <div>© {new Date().getFullYear()} MentorIA</div>
              <div className="flex gap-4">
                <a href="/terms" className="underline">Términos de uso</a>
                <a href="/privacy" className="underline">Política de privacidad</a>
              </div>
            </div>
          </footer>
        </ToastProvider>
      </body>

    </html>
  );
}
