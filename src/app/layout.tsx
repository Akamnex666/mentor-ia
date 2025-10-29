// app/layout.tsx
import type { Metadata } from "next";
import "../styles/globals.css"; // acá va tu CSS global (lo que era styles.css en el HTML)
import { Poppins, Inter } from "next/font/google";
import AccessibilityMenu from "../components/accecibilidad/menu";

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
      </head>
      <body>
        {children}
        {/* Menú de accesibilidad (siempre disponible) */}
        <AccessibilityMenu />
      </body>
      
    </html>
  );
}
