// DashboardPage.tsx
"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "../../../lib/supabase";

export default function DashboardPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("inicio");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState(searchParams.get("search") || "");
  const dropdownRef = React.useRef<HTMLDivElement>(null);

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      setLoading(false);
    };
    getUser();

    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };

    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setDropdownOpen(false);
    router.push("/login");
  };

  const handleSearch = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      
      // Detectar si busca "biblioteca"
      if (query.includes('biblioteca') || query.includes('library') || query.includes('libros') || query.includes('books')) {
        router.push('/biblioteca');
        return;
      }
      
      // Si no, continuar con búsqueda normal (no hace nada por ahora)
      // Podrías implementar búsqueda en el dashboard aquí
    }
  };

  // Función para filtrar contenido según búsqueda
  const filterContent = (text: string, query: string) => {
    return text.toLowerCase().includes(query.toLowerCase());
  };

  const shouldShowInitTab =
    !searchQuery.trim() ||
    filterContent("Generación Rápida", searchQuery) ||
    filterContent("Resumen Inteligente", searchQuery) ||
    filterContent("Cuestionario Adaptativo", searchQuery) ||
    filterContent("Material Didáctico", searchQuery) ||
    filterContent("Historia del Arte", searchQuery) ||
    filterContent("Matemáticas Básicas", searchQuery);

  const shouldShowGenTab =
    !searchQuery.trim() ||
    filterContent("Generar Nuevo Contenido", searchQuery) ||
    filterContent("Resumen Inteligente", searchQuery) ||
    filterContent("Cuestionario Adaptativo", searchQuery) ||
    filterContent("Material Didáctico", searchQuery);

  const shouldShowContenidosTab =
    !searchQuery.trim() ||
    filterContent("Revolución Industrial", searchQuery) ||
    filterContent("Álgebra Básica", searchQuery) ||
    filterContent("Resumen", searchQuery) ||
    filterContent("Quiz", searchQuery);

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
            </ul>
          </nav>

          <div className="header-search-container" style={{ maxWidth: '350px' }}>
            <i className="fas fa-search header-search-icon"></i>
            <input
              type="text"
              placeholder="Buscar..."
              className="header-search-input"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={handleSearch}
              spellCheck="false"
            />
          </div>

          <div className="user-dropdown-container" ref={dropdownRef}>
            <button
              className="user-avatar-button"
              onClick={() => setDropdownOpen(!dropdownOpen)}
            >
              <div className="user-avatar">
                {user?.email?.[0].toUpperCase() || 'U'}
              </div>
              <i className={`fas fa-chevron-down dropdown-icon ${dropdownOpen ? 'open' : ''}`}></i>
            </button>

            {dropdownOpen && (
              <div className="user-dropdown-menu">
                <div className="dropdown-header">
                  <p className="dropdown-email">{user?.email}</p>
                </div>
                <div className="dropdown-divider"></div>
                <Link href="/profile" className="dropdown-item" onClick={() => setDropdownOpen(false)}>
                  <i className="fas fa-user"></i>
                  <span>Mi Perfil</span>
                </Link>
                <div className="dropdown-divider"></div>
                <button onClick={handleLogout} className="dropdown-item logout">
                  <i className="fas fa-sign-out-alt"></i>
                  <span>Cerrar sesión</span>
                </button>
              </div>
            )}
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
        </div>

        {/* Contenido Principal del Dashboard */}
        <div className="dashboard-content">

          {/* Sección de Generación Rápida */}
          {activeTab === "inicio" && shouldShowInitTab && (
            <div className="tab-content">
              {/* Banner Biblioteca - Destacado Horizontal */}
              <div 
                onClick={() => router.push('/biblioteca')} 
                style={{
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  borderRadius: '16px',
                  padding: '2rem',
                  marginBottom: '2rem',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  boxShadow: '0 4px 20px rgba(102, 126, 234, 0.25)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '2rem',
                  position: 'relative',
                  overflow: 'hidden'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-4px)';
                  e.currentTarget.style.boxShadow = '0 8px 30px rgba(102, 126, 234, 0.35)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 4px 20px rgba(102, 126, 234, 0.25)';
                }}
              >
                {/* Decoración de fondo */}
                <div style={{
                  position: 'absolute',
                  right: '-50px',
                  top: '-50px',
                  width: '200px',
                  height: '200px',
                  background: 'rgba(255, 255, 255, 0.1)',
                  borderRadius: '50%',
                  pointerEvents: 'none'
                }}></div>
                
                {/* Icono */}
                <div style={{
                  width: '80px',
                  height: '80px',
                  background: 'rgba(255, 255, 255, 0.2)',
                  borderRadius: '16px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  backdropFilter: 'blur(10px)'
                }}>
                  <i className="fas fa-book-open" style={{ 
                    fontSize: '2rem', 
                    color: 'white' 
                  }}></i>
                </div>

                {/* Contenido */}
                <div style={{ flex: 1, color: 'white' }}>
                  <h3 style={{ 
                    fontSize: '1.5rem', 
                    fontWeight: '700', 
                    marginBottom: '0.5rem',
                    color: 'white'
                  }}>
                    Biblioteca Digital
                  </h3>
                  <p style={{ 
                    fontSize: '1rem', 
                    opacity: 0.95,
                    marginBottom: 0,
                    color: 'white'
                  }}>
                    Explora miles de recursos educativos gratuitos de todo el mundo. Busca libros, artículos y guarda tus favoritos.
                  </p>
                </div>

                {/* Botón */}
                <button 
                  style={{
                    background: 'white',
                    color: '#667eea',
                    padding: '0.75rem 1.5rem',
                    borderRadius: '10px',
                    border: 'none',
                    fontWeight: '600',
                    fontSize: '1rem',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    transition: 'all 0.2s ease',
                    flexShrink: 0
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'scale(1.05)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'scale(1)';
                  }}
                >
                  Explorar ahora
                  <i className="fas fa-arrow-right"></i>
                </button>
              </div>

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
          {activeTab === "generar" && shouldShowGenTab && (
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
          {activeTab === "contenidos" && shouldShowContenidosTab && (
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

          {/* Mensaje de sin resultados */}
          {searchQuery.trim() && !shouldShowInitTab && !shouldShowGenTab && !shouldShowContenidosTab && (
            <div className="tab-content">
              <div style={{
                textAlign: 'center',
                padding: '3rem',
                color: '#6b7280'
              }}>
                <i className="fas fa-search" style={{ fontSize: '3rem', marginBottom: '1rem', color: '#d1d5db' }}></i>
                <h3 style={{ marginTop: '1rem', color: '#374151' }}>Sin resultados</h3>
                <p>No encontramos contenido que coincida con "<strong>{searchQuery}</strong>"</p>
                <button
                  onClick={() => setSearchQuery("")}
                  className="btn-primary"
                  style={{ marginTop: '1.5rem' }}
                >
                  Limpiar búsqueda
                </button>
              </div>
            </div>
          )}
        </div>
      </main>
    </>
  );
}