// DashboardPage.tsx
"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "../../lib/supabase";

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("inicio");

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      setLoading(false);
    };
    getUser();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/auth/login");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="hero-illustration" style={{ margin: '0 auto 2rem' }}>
            <i className="fas fa-spinner fa-spin text-4xl text-blue-600"></i>
          </div>
          <p className="text-gray-600">Cargando dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Navbar del Dashboard */}
      <header className="navbar">
        <div className="nav-container">
          <div className="logo">
            <i className="fas fa-graduation-cap"></i>
            <span>MentorIA</span>
          </div>

          <nav className="nav-menu">
            <ul>
              <li>
                <button 
                  className={`nav-tab ${activeTab === "inicio" ? "active" : ""}`}
                  onClick={() => setActiveTab("inicio")}
                >
                  <i className="fas fa-home"></i> Inicio
                </button>
              </li>
              <li>
                <button 
                  className={`nav-tab ${activeTab === "generar" ? "active" : ""}`}
                  onClick={() => setActiveTab("generar")}
                >
                  <i className="fas fa-magic"></i> Generar
                </button>
              </li>
              <li>
                <button 
                  className={`nav-tab ${activeTab === "contenidos" ? "active" : ""}`}
                  onClick={() => setActiveTab("contenidos")}
                >
                  <i className="fas fa-folder"></i> Mis Contenidos
                </button>
              </li>
              <li>
                <button 
                  className={`nav-tab ${activeTab === "estadisticas" ? "active" : ""}`}
                  onClick={() => setActiveTab("estadisticas")}
                >
                  <i className="fas fa-chart-bar"></i> Estadísticas
                </button>
              </li>
            </ul>
          </nav>

          <div className="user-menu">
            <div className="user-info">
              <i className="fas fa-user-circle"></i>
              <span>{user?.user_metadata?.full_name || user?.email}</span>
            </div>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <Link href="/profile" className="auth-link" style={{ paddingRight: 8 }}>
                <i className="fas fa-user"></i> Perfil
              </Link>
              <button
                className="btn-login"
                onClick={handleLogout}
              >
                <i className="fas fa-sign-out-alt"></i> Cerrar Sesión
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="dashboard-container">
        {/* Header del Dashboard */}
        <div className="dashboard-header">
          <div className="welcome-section">
            <h1>
              ¡Bienvenido de vuelta,{" "}
              <span className="bright-text">
                {user?.user_metadata?.full_name || "Educador"}
              </span>
              !
            </h1>
            <p>Continúa transformando la educación con inteligencia artificial</p>
          </div>
          <div className="quick-stats">
            <div className="stat-card">
              <div className="stat-icon">
                <i className="fas fa-file-alt"></i>
              </div>
              <div className="stat-content">
                <span className="stat-number">12</span>
                <span className="stat-label">Contenidos Creados</span>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">
                <i className="fas fa-users"></i>
              </div>
              <div className="stat-content">
                <span className="stat-number">45</span>
                <span className="stat-label">Estudiantes</span>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">
                <i className="fas fa-star"></i>
              </div>
              <div className="stat-content">
                <span className="stat-number">98%</span>
                <span className="stat-label">Satisfacción</span>
              </div>
            </div>
          </div>
        </div>

        {/* Contenido Principal del Dashboard */}
        <div className="dashboard-content">
          
          {/* Sección de Generación Rápida */}
          {activeTab === "inicio" && (
            <div className="tab-content">
              <div className="section-header">
                <h2>Generación Rápida</h2>
                <p>Crea nuevo contenido educativo en segundos</p>
              </div>
              
              <div className="features-grid">
                <div className="feature-card">
                  <div className="card-icon">
                    <i className="fas fa-file-contract"></i>
                  </div>
                  <h3>Resumen Inteligente</h3>
                  <p>Genera resúmenes automáticos de cualquier tema educativo</p>
                  <button className="btn-primary" style={{ marginTop: '1rem' }}>
                    <i className="fas fa-plus"></i> Crear Resumen
                  </button>
                </div>

                <div className="feature-card featured">
                  <div className="featured-badge">Popular</div>
                  <div className="card-icon">
                    <i className="fas fa-question-circle"></i>
                  </div>
                  <h3>Cuestionario Adaptativo</h3>
                  <p>Crea quizzes que se ajustan al nivel de cada estudiante</p>
                  <button className="btn-primary" style={{ marginTop: '1rem' }}>
                    <i className="fas fa-plus"></i> Crear Quiz
                  </button>
                </div>

                <div className="feature-card">
                  <div className="card-icon">
                    <i className="fas fa-chalkboard"></i>
                  </div>
                  <h3>Material Didáctico</h3>
                  <p>Fichas educativas y presentaciones personalizadas</p>
                  <button className="btn-primary" style={{ marginTop: '1rem' }}>
                    <i className="fas fa-plus"></i> Crear Material
                  </button>
                </div>
              </div>

              {/* Contenidos Recientes */}
              <div className="recent-content">
                <h3 style={{ marginBottom: '1.5rem', color: '#1f2937' }}>Contenidos Recientes</h3>
                <div className="content-grid">
                  <div className="content-item">
                    <div className="content-icon">
                      <i className="fas fa-file-pdf"></i>
                    </div>
                    <div className="content-info">
                      <h4>Resumen: Historia del Arte</h4>
                      <p>Generado hace 2 horas • 15 estudiantes</p>
                    </div>
                    <div className="content-actions">
                      <button className="btn-secondary small">
                        <i className="fas fa-eye"></i>
                      </button>
                      <button className="btn-secondary small">
                        <i className="fas fa-download"></i>
                      </button>
                    </div>
                  </div>
                  
                  <div className="content-item">
                    <div className="content-icon">
                      <i className="fas fa-question-circle"></i>
                    </div>
                    <div className="content-info">
                      <h4>Quiz: Matemáticas Básicas</h4>
                      <p>Generado ayer • 28 estudiantes</p>
                    </div>
                    <div className="content-actions">
                      <button className="btn-secondary small">
                        <i className="fas fa-eye"></i>
                      </button>
                      <button className="btn-secondary small">
                        <i className="fas fa-download"></i>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Sección de Generación de Contenido */}
          {activeTab === "generar" && (
            <div className="tab-content">
              <div className="section-header">
                <h2>Generar Nuevo Contenido</h2>
                <p>Selecciona el tipo de contenido educativo que deseas crear</p>
              </div>
              
              <div className="generation-options">
                <div className="generation-card">
                  <div className="generation-header">
                    <i className="fas fa-file-contract"></i>
                    <h3>Resumen Inteligente</h3>
                  </div>
                  <p>Transforma textos largos en resúmenes concisos y educativos</p>
                  <ul className="feature-list">
                    <li><i className="fas fa-check"></i> Análisis semántico avanzado</li>
                    <li><i className="fas fa-check"></i> Adaptado al nivel educativo</li>
                    <li><i className="fas fa-check"></i> Puntos clave destacados</li>
                  </ul>
                  <button className="btn-primary full">
                    <i className="fas fa-wand-magic-sparkles"></i> Crear Resumen
                  </button>
                </div>

                <div className="generation-card featured">
                  <div className="featured-badge">Más Usado</div>
                  <div className="generation-header">
                    <i className="fas fa-question-circle"></i>
                    <h3>Cuestionario Adaptativo</h3>
                  </div>
                  <p>Genera evaluaciones que se ajustan al progreso del estudiante</p>
                  <ul className="feature-list">
                    <li><i className="fas fa-check"></i> Dificultad progresiva</li>
                    <li><i className="fas fa-check"></i> Retroalimentación inmediata</li>
                    <li><i className="fas fa-check"></i> Múltiples formatos de pregunta</li>
                  </ul>
                  <button className="btn-primary full">
                    <i className="fas fa-wand-magic-sparkles"></i> Crear Cuestionario
                  </button>
                </div>

                <div className="generation-card">
                  <div className="generation-header">
                    <i className="fas fa-chalkboard-teacher"></i>
                    <h3>Material Didáctico</h3>
                  </div>
                  <p>Crea fichas, presentaciones y recursos visuales educativos</p>
                  <ul className="feature-list">
                    <li><i className="fas fa-check"></i> Diseños profesionales</li>
                    <li><i className="fas fa-check"></i> Contenido estructurado</li>
                    <li><i className="fas fa-check"></i> Listo para usar en clase</li>
                  </ul>
                  <button className="btn-primary full">
                    <i className="fas fa-wand-magic-sparkles"></i> Crear Material
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Sección de Mis Contenidos */}
          {activeTab === "contenidos" && (
            <div className="tab-content">
              <div className="section-header">
                <h2>Mis Contenidos Educativos</h2>
                <p>Gestiona y organiza todo tu material creado</p>
              </div>
              
              <div className="content-filters">
                <button className="filter-btn active">Todos</button>
                <button className="filter-btn">Resúmenes</button>
                <button className="filter-btn">Cuestionarios</button>
                <button className="filter-btn">Materiales</button>
              </div>
              
              <div className="content-list">
                <div className="content-item detailed">
                  <div className="content-icon large">
                    <i className="fas fa-file-pdf"></i>
                  </div>
                  <div className="content-info">
                    <h4>Resumen: Revolución Industrial</h4>
                    <p>Historia • Nivel: Secundaria</p>
                    <div className="content-meta">
                      <span><i className="fas fa-calendar"></i> Creado: 15 Nov 2024</span>
                      <span><i className="fas fa-users"></i> 32 estudiantes</span>
                      <span><i className="fas fa-star"></i> 4.8/5</span>
                    </div>
                  </div>
                  <div className="content-actions">
                    <button className="btn-primary small">
                      <i className="fas fa-edit"></i> Editar
                    </button>
                    <button className="btn-secondary small">
                      <i className="fas fa-share"></i> Compartir
                    </button>
                  </div>
                </div>
                
                <div className="content-item detailed">
                  <div className="content-icon large">
                    <i className="fas fa-question-circle"></i>
                  </div>
                  <div className="content-info">
                    <h4>Quiz: Álgebra Básica</h4>
                    <p>Matemáticas • Nivel: Primaria</p>
                    <div className="content-meta">
                      <span><i className="fas fa-calendar"></i> Creado: 12 Nov 2024</span>
                      <span><i className="fas fa-users"></i> 45 estudiantes</span>
                      <span><i className="fas fa-star"></i> 4.9/5</span>
                    </div>
                  </div>
                  <div className="content-actions">
                    <button className="btn-primary small">
                      <i className="fas fa-edit"></i> Editar
                    </button>
                    <button className="btn-secondary small">
                      <i className="fas fa-share"></i> Compartir
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Sección de Estadísticas */}
          {activeTab === "estadisticas" && (
            <div className="tab-content">
              <div className="section-header">
                <h2>Estadísticas de Uso</h2>
                <p>Mide el impacto de tus contenidos educativos</p>
              </div>
              
              <div className="stats-grid">
                <div className="stat-card large">
                  <h3>Contenidos Más Populares</h3>
                  <div className="popular-list">
                    <div className="popular-item">
                      <span>1. Resumen: Biología Celular</span>
                      <span>128 vistas</span>
                    </div>
                    <div className="popular-item">
                      <span>2. Quiz: Gramática Española</span>
                      <span>115 vistas</span>
                    </div>
                    <div className="popular-item">
                      <span>3. Material: Tabla Periódica</span>
                      <span>98 vistas</span>
                    </div>
                  </div>
                </div>
                
                <div className="stat-card large">
                  <h3>Progreso Mensual</h3>
                  <div className="progress-chart">
                    <div className="chart-placeholder">
                      <i className="fas fa-chart-line" style={{ fontSize: '3rem', color: '#4f46e5', marginBottom: '1rem' }}></i>
                      <p>Gráfico de progreso interactivo</p>
                      <small>Contenidos creados vs Estudiantes alcanzados</small>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="achievements">
                <h3 style={{ marginBottom: '1.5rem' }}>Logros</h3>
                <div className="achievement-grid">
                  <div className="achievement-card">
                    <div className="achievement-icon">
                      <i className="fas fa-rocket"></i>
                    </div>
                    <h4>Creador Novato</h4>
                    <p>10 contenidos creados</p>
                  </div>
                  <div className="achievement-card">
                    <div className="achievement-icon">
                      <i className="fas fa-users"></i>
                    </div>
                    <h4>Influencer Educativo</h4>
                    <p>50 estudiantes alcanzados</p>
                  </div>
                  <div className="achievement-card">
                    <div className="achievement-icon">
                      <i className="fas fa-star"></i>
                    </div>
                    <h4>Calidad Comprobada</h4>
                    <p>Promedio 4.5+ estrellas</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </>
  );
}