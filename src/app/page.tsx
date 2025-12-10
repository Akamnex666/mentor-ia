"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useLanguage } from "../contexts/LanguageContext";
import LanguageSelector from "../components/LanguageSelector";
import "../styles/globals.css"; // tus estilos principales

export default function HomePage() {
  const [activeFAQ, setActiveFAQ] = useState<number | null>(null);
  const [showVideoModal, setShowVideoModal] = useState(false);
  const router = useRouter();
  const { t } = useLanguage();

  const toggleFAQ = (index: number) => {
    setActiveFAQ(activeFAQ === index ? null : index);
  };

  return (
    <>
      {/* Enlace de accesibilidad */}
      <a href="#main-content" className="skip-to-content">
        {t('accessibility.skip')}
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
                <button onClick={() => document.getElementById('inicio')?.scrollIntoView({ behavior: 'smooth' })}>
                  <i className="fas fa-home"></i> {t('nav.home')}
                </button>
              </li>
              <li>
                <button onClick={() => document.getElementById('generar')?.scrollIntoView({ behavior: 'smooth' })}>
                  <i className="fas fa-magic"></i> {t('nav.generate')}
                </button>
              </li>
              <li>
                <button onClick={() => document.getElementById('contacto')?.scrollIntoView({ behavior: 'smooth' })}>
                  <i className="fas fa-envelope"></i> {t('nav.contact')}
                </button>
              </li>
            </ul>
          </nav>

          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
            <LanguageSelector />
            <button
              className="btn-login"
              aria-label={t('nav.login')}
              onClick={() => router.push("/login")}
            >
              <i className="fas fa-user"></i> {t('nav.login')}
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="hero" id="inicio">
        <main id="main-content">
          <div className="hero-container">
            <div className="hero-content">
              <div className="hero-badge">
                <i className="fas fa-sparkles"></i> {t('hero.badge')}
              </div>
              <h1>
                {t('hero.title')}{" "}
                <span className="bright-text">{t('hero.titleHighlight')}</span>
              </h1>
              <p>
                {t('hero.subtitle')}
              </p>
              <div className="hero-buttons">
                <button className="btn-primary" onClick={() => router.push("/auth/register")}>
                  <i className="fas fa-rocket"></i> {t('hero.ctaPrimary')}
                </button>
                <button className="btn-secondary" onClick={() => setShowVideoModal(true)}>
                  <i className="fas fa-play"></i> {t('hero.ctaSecondary')}
                </button>
              </div>
              <div className="hero-stats">
                <div className="stat">
                  <span className="stat-number">10K+</span>
                  <span className="stat-label">{t('hero.stats.educators')}</span>
                </div>
                <div className="stat">
                  <span className="stat-number">50K+</span>
                  <span className="stat-label">{t('hero.stats.students')}</span>
                </div>
                <div className="stat">
                  <span className="stat-number">99%</span>
                  <span className="stat-label">{t('hero.stats.satisfaction')}</span>
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
              <h3>{t('features.summary.title')}</h3>
              <p>
                {t('features.summary.description')}
              </p>
            </div>

            <div className="feature-card featured">
              <div className="featured-badge">{t('features.quiz.badge')}</div>
              <div className="card-icon">
                <i className="fas fa-question-circle"></i>
              </div>
              <h3>{t('features.quiz.title')}</h3>
              <p>
                {t('features.quiz.description')}
              </p>
            </div>

            <div className="feature-card">
              <div className="card-icon">
                <i className="fas fa-chalkboard-teacher"></i>
              </div>
              <h3>{t('features.material.title')}</h3>
              <p>
                {t('features.material.description')}
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
      <footer className="footer" id="contacto">
        <div className="footer-container">
          <div>
            <div className="footer-logo">
              <i className="fas fa-graduation-cap"></i> MentorIA
            </div>
            <p>Transformando la educación con inteligencia artificial.</p>
          </div>
          <div className="footer-contact">
            <h4>Contacto</h4>
            <p><i className="fas fa-envelope"></i> contacto@mentoria.com</p>
            <p><i className="fas fa-phone"></i> +593 91 234 5678</p>
            <p><i className="fas fa-map-marker-alt"></i> Manta, Ecuador</p>
          </div>
          <div className="footer-copy">
            © 2025 MentorIA — Todos los derechos reservados.
          </div>
        </div>
      </footer>

      {/* Modal de Video */}
      {showVideoModal && (
        <div className="video-modal-overlay" onClick={() => setShowVideoModal(false)}>
          <div className="video-modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="video-modal-close" onClick={() => setShowVideoModal(false)}>
              <i className="fas fa-times"></i>
            </button>
            <div className="video-container">
              <iframe
                width="100%"
                height="100%"
                src="https://www.youtube.com/embed/UKncFg0PyEk"
                title="Video de MentorIA"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              ></iframe>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
