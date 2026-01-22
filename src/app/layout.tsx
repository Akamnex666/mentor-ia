// app/layout.tsx
import type { Metadata } from "next";
import "../styles/globals.css";
import ToastProvider from "../providers/ToastProvider";
import { LanguageProvider } from "../contexts/LanguageContext";
import { Poppins, Inter } from "next/font/google";
import AccessibilityMenu from "../components/accessibility/AccessibilityMenu";
import SyncA11y from "../components/accessibility/SyncA11y";
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
        {/* Note: omitted beforeInteractive script to avoid hydration mismatches.
            Accessibility preferences are applied client-side by the SyncA11y
            component after hydration. */}
      </head>

      <body>
        <LanguageProvider>
          <ToastProvider>
            {/* Sync saved a11y prefs early so layout elements render correctly */}
            <SyncA11y />

            {children}

            {/* Menú de accesibilidad (siempre disponible) */}
            <AccessibilityMenu />

            <footer className="w-full border-t mt-8 p-4 text-sm text-center text-gray-600">
              {/* Footer global sin copyright ni enlaces legales */}
            </footer>
          </ToastProvider>
        </LanguageProvider>
      </body>

    </html>
  );
}
