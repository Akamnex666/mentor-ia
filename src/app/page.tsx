"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useLanguage } from "../contexts/LanguageContext";
import LanguageSelector from "../components/ui/LanguageSelector";
import AIGenerator from "../components/ai/AIGenerator";
import "../styles/globals.css";

// Tipo de contenido para el modal
type AIModalType = "summary" | "quiz" | "material" | null;

export default function HomePage() {
  const [activeFAQ, setActiveFAQ] = useState<number | null>(null);
  const [showVideoModal, setShowVideoModal] = useState(false);
  const [showAIModal, setShowAIModal] = useState<AIModalType>(null);
  const [contactForm, setContactForm] = useState({
    name: '',
    email: '',
    message: ''
  });
  const [contactLoading, setContactLoading] = useState(false);
  const [contactMessage, setContactMessage] = useState('');
  const router = useRouter();
  const { t } = useLanguage();

  const toggleFAQ = (index: number) => {
    setActiveFAQ(activeFAQ === index ? null : index);
  };

  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!contactForm.name || !contactForm.email || !contactForm.message) {
      setContactMessage('Por favor completa todos los campos');
      return;
    }

    setContactLoading(true);
    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(contactForm)
      });

      if (response.ok) {
        setContactMessage('¡Mensaje enviado exitosamente! Nos pondremos en contacto pronto.');
        setContactForm({ name: '', email: '', message: '' });
        setTimeout(() => setContactMessage(''), 5000);
      } else {
        setContactMessage('Error al enviar el mensaje. Intenta nuevamente.');
      }
    } catch (error) {
      setContactMessage('Error de conexión. Por favor intenta más tarde.');
      console.error(error);
    } finally {
      setContactLoading(false);
    }
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
                <a href="#inicio" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', textDecoration: 'none', color: 'inherit', cursor: 'pointer' }}>
                  <i className="fas fa-home"></i> {t('nav.home')}
                </a>
              </li>
              <li>
                <a href="#generar" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', textDecoration: 'none', color: 'inherit', cursor: 'pointer' }}>
                  <i className="fas fa-magic"></i> {t('nav.generate')}
                </a>
              </li>
              <li>
                <a href="#contacto" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', textDecoration: 'none', color: 'inherit', cursor: 'pointer' }}>
                  <i className="fas fa-envelope"></i> {t('nav.contact')}
                </a>
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
                <button className="btn-primary" onClick={() => router.push("/register")}>
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
            <div className="feature-card" onClick={() => setShowAIModal("summary")} style={{ cursor: "pointer" }}>
              <div className="card-icon">
                <i className="fas fa-file-alt"></i>
              </div>
              <h3>{t('features.summary.title')}</h3>
              <p>
                {t('features.summary.description')}
              </p>
            </div>

            <div className="feature-card featured" onClick={() => setShowAIModal("quiz")} style={{ cursor: "pointer" }}>
              <div className="featured-badge">{t('features.quiz.badge')}</div>
              <div className="card-icon">
                <i className="fas fa-question-circle"></i>
              </div>
              <h3>{t('features.quiz.title')}</h3>
              <p>
                {t('features.quiz.description')}
              </p>
            </div>

            <div className="feature-card" onClick={() => setShowAIModal("material")} style={{ cursor: "pointer" }}>
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
                  className={`faq-question ${activeFAQ === i ? "active" : ""
                    }`}
                  onClick={() => toggleFAQ(i)}
                >
                  <span>{faq.q}</span>
                  <i className="fas fa-chevron-down"></i>
                </button>
                <div
                  className={`faq-answer ${activeFAQ === i ? "open" : "closed"
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
        <div className="footer-container" style={{ display: 'flex', flexDirection: 'column', gap: '3rem' }}>

          {/* Sección principal del footer */}
          <div style={{ display: 'flex', gap: '3rem', justifyContent: 'space-between', flexWrap: 'wrap' }}>

            {/* Columna 1: Logo */}
            <div style={{ flex: '1', minWidth: '250px' }}>
              <div className="footer-logo" style={{ marginBottom: '1rem' }}>
                <i className="fas fa-graduation-cap"></i> MentorIA
              </div>
              <p style={{ color: 'rgba(255,255,255,0.8)', lineHeight: '1.6' }}>
                Transformando la educación con inteligencia artificial para el mundo.
              </p>
            </div>

            {/* Columna 2: Contacto */}
            <div style={{ flex: '1', minWidth: '250px' }}>
              <h4 style={{ color: '#fff', marginBottom: '1rem', fontSize: '1rem', fontWeight: 700 }}>Contacto Directo</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <p style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'rgba(255,255,255,0.8)' }}>
                  <i className="fas fa-envelope" style={{ width: '20px' }}></i>
                  <a href="mailto:contacto@mentoria.com" style={{ color: 'inherit', textDecoration: 'none' }}>contacto@mentoria.com</a>
                </p>
                <p style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'rgba(255,255,255,0.8)' }}>
                  <i className="fas fa-phone" style={{ width: '20px' }}></i>
                  <a href="tel:+593912345678" style={{ color: 'inherit', textDecoration: 'none' }}>+593 91 234 5678</a>
                </p>
                <p style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'rgba(255,255,255,0.8)' }}>
                  <i className="fas fa-map-marker-alt" style={{ width: '20px' }}></i>
                  Manta, Ecuador
                </p>
              </div>
            </div>

            {/* Columna 3: Formulario de contacto */}
            <div style={{ flex: '1', minWidth: '280px', maxWidth: '350px' }}>
              <h4 style={{ color: '#fff', marginBottom: '1rem', fontSize: '1rem', fontWeight: 700 }}>Envíanos un Mensaje</h4>
              <form onSubmit={handleContactSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <input
                  type="text"
                  placeholder="Tu nombre"
                  value={contactForm.name}
                  onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })}
                  required
                  style={{
                    padding: '0.6rem',
                    borderRadius: '0.4rem',
                    border: 'none',
                    background: 'rgba(255, 255, 255, 0.95)',
                    fontSize: '0.9rem',
                    fontFamily: 'inherit'
                  }}
                />
                <input
                  type="email"
                  placeholder="Tu email"
                  value={contactForm.email}
                  onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                  required
                  style={{
                    padding: '0.6rem',
                    borderRadius: '0.4rem',
                    border: 'none',
                    background: 'rgba(255, 255, 255, 0.95)',
                    fontSize: '0.9rem',
                    fontFamily: 'inherit'
                  }}
                />
                <textarea
                  placeholder="Tu mensaje"
                  value={contactForm.message}
                  onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })}
                  rows={3}
                  required
                  style={{
                    padding: '0.6rem',
                    borderRadius: '0.4rem',
                    border: 'none',
                    background: 'rgba(255, 255, 255, 0.95)',
                    fontSize: '0.9rem',
                    resize: 'none',
                    fontFamily: 'inherit'
                  }}
                />
                {contactMessage && (
                  <div
                    style={{
                      padding: '0.6rem',
                      borderRadius: '0.4rem',
                      background: contactMessage.includes('Error') ? 'rgba(239, 68, 68, 0.3)' : 'rgba(34, 197, 94, 0.3)',
                      color: contactMessage.includes('Error') ? '#fca5a5' : '#86efac',
                      fontSize: '0.85rem',
                      textAlign: 'center',
                      fontWeight: 500
                    }}
                  >
                    {contactMessage}
                  </div>
                )}
                <button
                  type="submit"
                  disabled={contactLoading}
                  style={{
                    padding: '0.6rem',
                    background: contactLoading ? '#999' : 'linear-gradient(135deg, #ec4899 0%, #f43f5e 100%)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '0.4rem',
                    fontSize: '0.9rem',
                    fontWeight: 700,
                    cursor: contactLoading ? 'not-allowed' : 'pointer',
                    opacity: contactLoading ? 0.7 : 1,
                    transition: 'all 0.3s ease'
                  }}
                >
                  {contactLoading ? 'Enviando...' : 'Enviar'}
                </button>
              </form>
            </div>

          </div>

          {/* Copyright */}
          <div style={{
            borderTop: '1px solid rgba(255,255,255,0.1)',
            paddingTop: '2rem',
            textAlign: 'center',
            color: 'rgba(255,255,255,0.6)',
            fontSize: '0.9rem'
          }}>
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

      {/* Modal de Generador IA */}
      {showAIModal && (
        <div 
          className="ai-modal-overlay" 
          onClick={() => setShowAIModal(null)}
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(0, 0, 0, 0.7)",
            backdropFilter: "blur(5px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 9999,
            padding: "1rem"
          }}
        >
          <div 
            className="ai-modal-content" 
            onClick={(e) => e.stopPropagation()}
            style={{
              background: "white",
              borderRadius: "20px",
              width: "100%",
              maxWidth: "900px",
              maxHeight: "90vh",
              overflow: "hidden",
              boxShadow: "0 25px 50px rgba(0, 0, 0, 0.25)",
              animation: "modalSlideIn 0.3s ease-out"
            }}
          >
            {/* Header del Modal */}
            <div style={{
              background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
              padding: "1.5rem 2rem",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center"
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                <div style={{
                  width: "50px",
                  height: "50px",
                  background: "rgba(255,255,255,0.2)",
                  borderRadius: "12px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center"
                }}>
                  <i className={`fas ${
                    showAIModal === "summary" ? "fa-file-alt" : 
                    showAIModal === "quiz" ? "fa-question-circle" : 
                    "fa-chalkboard-teacher"
                  }`} style={{ fontSize: "1.5rem", color: "white" }}></i>
                </div>
                <div>
                  <h2 style={{ color: "white", margin: 0, fontSize: "1.5rem" }}>
                    {showAIModal === "summary" && "Generar Resumen Inteligente"}
                    {showAIModal === "quiz" && "Crear Cuestionario Adaptativo"}
                    {showAIModal === "material" && "Crear Material Didáctico"}
                  </h2>
                  <p style={{ color: "rgba(255,255,255,0.8)", margin: 0, fontSize: "0.9rem" }}>
                    Potenciado por Gemini AI
                  </p>
                </div>
              </div>
              <button 
                onClick={() => setShowAIModal(null)}
                style={{
                  width: "40px",
                  height: "40px",
                  borderRadius: "50%",
                  border: "none",
                  background: "rgba(255,255,255,0.2)",
                  color: "white",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "1.2rem",
                  transition: "background 0.2s ease"
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = "rgba(255,255,255,0.3)"}
                onMouseLeave={(e) => e.currentTarget.style.background = "rgba(255,255,255,0.2)"}
              >
                <i className="fas fa-times"></i>
              </button>
            </div>

            {/* Contenido del Modal */}
            <div style={{ 
              padding: "2rem", 
              maxHeight: "calc(90vh - 120px)", 
              overflowY: "auto" 
            }}>
              <AIGenerator 
                defaultType={showAIModal}
                onContentGenerated={(content, type) => {
                  console.log("Contenido generado:", type);
                }}
                onQuizGenerated={(quiz) => {
                  console.log("Quiz generado:", quiz.title);
                }}
              />
            </div>
          </div>
        </div>
      )}

      <style jsx global>{`
        @keyframes modalSlideIn {
          from {
            opacity: 0;
            transform: scale(0.9) translateY(20px);
          }
          to {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }
        
        .feature-card {
          transition: all 0.3s ease;
        }
        
        .feature-card:hover {
          transform: translateY(-8px);
          box-shadow: 0 20px 40px rgba(102, 126, 234, 0.2);
        }
      `}</style>
    </>
  );
}
