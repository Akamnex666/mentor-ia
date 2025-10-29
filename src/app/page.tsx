"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import "../styles/globals.css"; // tus estilos principales

export default function HomePage() {
  const [activeFAQ, setActiveFAQ] = useState<number | null>(null);
  const router = useRouter();

  const toggleFAQ = (index: number) => {
    setActiveFAQ(activeFAQ === index ? null : index);
  };

  return (
    <>
      {/* Enlace de accesibilidad */}
      <a href="#main-content" className="skip-to-content">
        Saltar al contenido principal
      </a>

      {/* Navbar */}
      <header className="navbar">
        <div className="nav-container">
          <div className="logo">
            <i className="fas fa-graduation-cap"></i>
            <span>MentorIA</span>
          </div>

          <nav className="nav-menu">
            <ul>
              <li>
                <a href="#inicio">
                  <i className="fas fa-home"></i> Inicio
                </a>
              </li>
              <li>
                <a href="#generar">
                  <i className="fas fa-magic"></i> Generar Contenido
                </a>
              </li>
              <li>
                <a href="#planes">
                  <i className="fas fa-crown"></i> Planes
                </a>
              </li>
              <li>
                <a href="#contacto">
                  <i className="fas fa-envelope"></i> Contacto
                </a>
              </li>
            </ul>
          </nav>

          <button
            className="btn-login"
            aria-label="Iniciar sesión"
            onClick={() => router.push("/login")}
          >
            <i className="fas fa-user"></i> Iniciar Sesión
          </button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="hero" id="inicio">
        <main id="main-content">
          <div className="hero-container">
            <div className="hero-content">
              <div className="hero-badge">
                <i className="fas fa-sparkles"></i> Potenciado por IA
              </div>
              <h1>
                Transforma la educación con{" "}
                <span className="bright-text">Inteligencia Artificial</span>
              </h1>
              <p>
                Crea contenido educativo personalizado, resúmenes inteligentes y
                cuestionarios adaptativos que se ajustan al nivel de cada
                estudiante. El futuro de la educación está aquí.
              </p>
              <div className="hero-buttons">
                <button className="btn-primary">
                  <i className="fas fa-rocket"></i> Comenzar Gratis
                </button>
                <button className="btn-secondary">
                  <i className="fas fa-play"></i> Ver Demo
                </button>
              </div>
              <div className="hero-stats">
                <div className="stat">
                  <span className="stat-number">10K+</span>
                  <span className="stat-label">Educadores</span>
                </div>
                <div className="stat">
                  <span className="stat-number">50K+</span>
                  <span className="stat-label">Estudiantes</span>
                </div>
                <div className="stat">
                  <span className="stat-number">99%</span>
                  <span className="stat-label">Satisfacción</span>
                </div>
              </div>
            </div>

            {/* Visual con íconos flotantes */}
            <div className="hero-visual">
              <div className="hero-image-container">
                <div className="floating-elements">
                  <div className="floating-icon" style={{ animationDelay: "0s" }}>
                    <i className="fas fa-brain"></i>
                  </div>
                  <div className="floating-icon" style={{ animationDelay: "1s" }}>
                    <i className="fas fa-lightbulb"></i>
                  </div>
                  <div className="floating-icon" style={{ animationDelay: "2s" }}>
                    <i className="fas fa-book"></i>
                  </div>
                </div>
                <div className="hero-illustration">
                  <i className="fas fa-robot"></i>
                </div>
              </div>
            </div>
          </div>
        </main>
      </section>

      {/* Features */}
      <section className="features" id="generar">
        <div className="features-container">
          <div className="section-header">
            <h2>
              ¿Qué puedes crear con{" "}
              <span className="gradient-text">MentorIA</span>?
            </h2>
            <p>
              Herramientas potenciadas por IA para revolucionar tu manera de
              enseñar.
            </p>
          </div>
          <div className="features-grid">
            <div className="feature-card">
              <div className="card-icon">
                <i className="fas fa-file-alt"></i>
              </div>
              <h3>Resúmenes Inteligentes</h3>
              <p>
                Genera resúmenes automáticos adaptados al nivel del estudiante
                con análisis semántico avanzado.
              </p>
            </div>

            <div className="feature-card featured">
              <div className="featured-badge">Popular</div>
              <div className="card-icon">
                <i className="fas fa-question-circle"></i>
              </div>
              <h3>Cuestionarios Adaptativos</h3>
              <p>
                Crea quizzes personalizados que se ajustan dinámicamente al
                progreso del estudiante.
              </p>
            </div>

            <div className="feature-card">
              <div className="card-icon">
                <i className="fas fa-chalkboard-teacher"></i>
              </div>
              <h3>Material Didáctico</h3>
              <p>
                Fichas educativas, presentaciones y contenido estructurado listo
                para usar.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ interactivo */}
      <section className="faq" id="faq">
        <div className="faq-container">
          <div className="section-header">
            <h2>
              Preguntas <span className="gradient-text">frecuentes</span>
            </h2>
            <p>Resolvemos tus dudas sobre MentorIA</p>
          </div>
          <div className="faq-grid">
            {[
              {
                q: "¿Cómo garantizan la calidad del contenido generado?",
                a: "Usamos modelos de IA entrenados en contenido educativo y filtros de calidad, además de permitir revisión por el usuario.",
              },
              {
                q: "¿Puedo usar el contenido generado comercialmente?",
                a: "Sí, los contenidos generados pueden usarse en contextos educativos y profesionales, respetando nuestras políticas de uso.",
              },
            ].map((faq, i) => (
              <div key={i} className="faq-item">
                <button
                  className={`faq-question ${
                    activeFAQ === i ? "active" : ""
                  }`}
                  onClick={() => toggleFAQ(i)}
                >
                  <span>{faq.q}</span>
                  <i className="fas fa-chevron-down"></i>
                </button>
                <div
                  className={`faq-answer ${
                    activeFAQ === i ? "open" : "closed"
                  }`}
                >
                  <p>{faq.a}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="footer-container">
          <div>
            <div className="footer-logo">
              <i className="fas fa-graduation-cap"></i> MentorIA
            </div>
            <p>Transformando la educación con inteligencia artificial.</p>
          </div>
          <div className="footer-copy">
            © 2025 MentorIA — Todos los derechos reservados.
          </div>
        </div>
      </footer>
    </>
  );
}
