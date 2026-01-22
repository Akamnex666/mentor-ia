// DashboardPage.tsx
"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "../../../lib/supabase";
import AIGenerator from "../../../components/ai/AIGenerator";
import AIChat from "../../../components/ai/AIChat";
import { Quiz } from "../../../types/ai";

// Tipo de contenido para el modal
type AIModalType = "summary" | "quiz" | "exercises" | null;

// Tipo para contenido guardado
type SavedContent = {
  id: string;
  type: "summary" | "quiz" | "exercises";
  title: string;
  content: string;
  quiz?: Quiz;
  createdAt: string;
};

export default function DashboardPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("inicio");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState(searchParams.get("search") || "");
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [showAIModal, setShowAIModal] = useState<AIModalType>(null);
  const [savedContents, setSavedContents] = useState<SavedContent[]>([]);
  const [contentFilter, setContentFilter] = useState<string>("all");
  const [viewingContent, setViewingContent] = useState<SavedContent | null>(null);
  const [generatingPDF, setGeneratingPDF] = useState(false);
  const [generatingImage, setGeneratingImage] = useState(false);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);

  useEffect(() => {
    const getUser = async () => {
      try {
        const { data: { user }, error } = await supabase.auth.getUser();
        setUser(user);
        setLoading(false);
        if (user) {
          loadSavedContents(user.id);
        } else {
          // Si no hay usuario, redirigir al login
          router.push("/login");
        }
        // Si hay error relacionado con refresh token, redirigir
        if (error && error.message && error.message.toLowerCase().includes("refresh token")) {
          router.push("/login");
        }
      } catch (err: any) {
        // Si ocurre cualquier error, redirigir al login
        router.push("/login");
      }
    };
    getUser();

    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };

    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, [router]);

  // Cargar contenidos guardados
  const loadSavedContents = (userId: string) => {
    try {
      const saved = localStorage.getItem(`mentoria_contents_${userId}`);
      if (saved) {
        setSavedContents(JSON.parse(saved));
      }
    } catch (e) {
      console.error("Error loading saved contents:", e);
    }
  };

  // Guardar contenido generado
  const saveContent = (type: string, title: string, content: string, quiz?: Quiz) => {
    if (!user) return;

    const newContent: SavedContent = {
      id: `content_${Date.now()}`,
      type: type as SavedContent["type"],
      title,
      content,
      quiz,
      createdAt: new Date().toISOString(),
    };

    const updated = [newContent, ...savedContents];
    setSavedContents(updated);
    localStorage.setItem(`mentoria_contents_${user.id}`, JSON.stringify(updated));
  };

  // Eliminar contenido individual
  const deleteContent = (id: string) => {
    if (!user) return;
    const updated = savedContents.filter(c => c.id !== id);
    setSavedContents(updated);
    localStorage.setItem(`mentoria_contents_${user.id}`, JSON.stringify(updated));
  };

  // Eliminar todos los contenidos
  const deleteAllContents = () => {
    if (!user) return;
    setSavedContents([]);
    localStorage.removeItem(`mentoria_contents_${user.id}`);
  };

  // Filtrar contenidos
  const filteredContents = savedContents.filter(c => {
    if (contentFilter === "all") return true;
    return c.type === contentFilter;
  });

  // Generar PDF del contenido
  const generatePDF = async (content: SavedContent) => {
    setGeneratingPDF(true);
    try {
      // Crear contenido HTML para el PDF
      const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <title>${content.title}</title>
          <style>
            body { 
              font-family: 'Segoe UI', Arial, sans-serif; 
              padding: 40px; 
              max-width: 800px; 
              margin: 0 auto;
              line-height: 1.8;
              color: #333;
            }
            h1 { 
              color: #667eea; 
              border-bottom: 3px solid #667eea; 
              padding-bottom: 15px;
              margin-bottom: 30px;
            }
            h2 { color: #764ba2; margin-top: 30px; }
            h3 { color: #667eea; }
            .meta { 
              color: #666; 
              font-size: 14px; 
              margin-bottom: 30px;
              padding: 15px;
              background: #f8f9fa;
              border-radius: 8px;
            }
            .content { 
              white-space: pre-wrap; 
              font-size: 16px;
            }
            ul, ol { margin: 15px 0; padding-left: 25px; }
            li { margin: 8px 0; }
            .footer {
              margin-top: 50px;
              padding-top: 20px;
              border-top: 1px solid #eee;
              color: #888;
              font-size: 12px;
              text-align: center;
            }
          </style>
        </head>
        <body>
          <h1>${content.title}</h1>
          <div class="meta">
            <strong>Tipo:</strong> ${content.type === 'summary' ? 'Resumen' : content.type === 'quiz' ? 'Cuestionario' : content.type === 'exercises' ? 'Ejercicios' : ''}<br>
            <strong>Fecha de creación:</strong> ${new Date(content.createdAt).toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}<br>
            <strong>Generado por:</strong> MentorIA con Gemini AI
          </div>
          <div class="content">${content.content.replace(/\n/g, '<br>')}</div>
          <div class="footer">
            Generado con MentorIA - Plataforma Educativa con IA<br>
            © ${new Date().getFullYear()} MentorIA
          </div>
        </body>
        </html>
      `;

      // Crear blob y descargar
      const blob = new Blob([htmlContent], { type: 'text/html' });
      const url = URL.createObjectURL(blob);
      
      // Abrir en nueva ventana para imprimir como PDF
      const printWindow = window.open(url, '_blank');
      if (printWindow) {
        printWindow.onload = () => {
          printWindow.print();
        };
      }
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Error al generar el PDF');
    } finally {
      setGeneratingPDF(false);
    }
  };

  // Generar imagen con IA basada en el contenido
  const generateImage = async (content: SavedContent) => {
    setGeneratingImage(true);
    setGeneratedImage(null);
    try {
      // Usar la API para generar una descripción visual del contenido
      const response = await fetch('/api/ai/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'material',
          topic: `Crea una infografía educativa visual en formato texto/ASCII art sobre: ${content.title}. 
                  Incluye iconos representativos usando emojis, diagramas simples con caracteres, 
                  y organiza la información de forma muy visual y atractiva. 
                  Usa cajas, flechas y símbolos para representar conceptos.`,
          additionalContext: content.content.substring(0, 500)
        })
      });

      if (!response.ok) throw new Error('Error en la API');
      
      const data = await response.json();
      setGeneratedImage(data.content);
    } catch (error) {
      console.error('Error generating image:', error);
      alert('Error al generar la imagen. Intenta de nuevo.');
    } finally {
      setGeneratingImage(false);
    }
  };

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
        {/* Header del Dashboard - Solo visible en Inicio */}
        {activeTab === "inicio" && (
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
        )}

        {/* Contenido Principal del Dashboard */}
        <div className="dashboard-content" style={activeTab !== "inicio" ? { paddingTop: '4rem' } : {}}>

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
                </div>

                <div className="feature-card">
                  <div className="card-icon">
                    <i className="fas fa-question-circle"></i>
                  </div>
                  <h3>Cuestionario Adaptativo</h3>
                  <p>Crea quizzes que se ajustan al nivel de cada estudiante</p>
                </div>

                <div className="feature-card">
                  <div className="card-icon">
                    <i className="fas fa-pen-to-square"></i>
                  </div>
                  <h3>Ejercicios Prácticos</h3>
                  <p>Genera ejercicios personalizados para practicar</p>
                </div>
              </div>

              {/* Contenidos Recientes */}
              <div className="recent-content">
                <h3 style={{ marginBottom: '1.5rem', color: '#1f2937' }}>Contenidos Recientes</h3>
                {savedContents.length === 0 ? (
                  <div style={{
                    textAlign: 'center',
                    padding: '2rem',
                    background: '#f8fafc',
                    borderRadius: '12px',
                    color: '#6b7280'
                  }}>
                    <i className="fas fa-folder-open" style={{ fontSize: '2.5rem', marginBottom: '1rem', color: '#cbd5e1' }}></i>
                    <p style={{ margin: 0 }}>Aún no has generado contenido. ¡Crea tu primer resumen o quiz!</p>
                  </div>
                ) : (
                  <div className="content-grid">
                    {savedContents.slice(0, 4).map((content) => (
                      <div 
                        key={content.id} 
                        className="content-item"
                        onClick={() => setViewingContent(content)}
                        style={{ cursor: 'pointer' }}
                      >
                        <div className="content-icon">
                          <i className={`fas ${
                            content.type === 'quiz' ? 'fa-question-circle' :
                            content.type === 'summary' ? 'fa-file-alt' :
                            content.type === 'exercises' ? 'fa-tasks' :
                            'fa-lightbulb'
                          }`}></i>
                        </div>
                        <div className="content-info">
                          <h4>{content.title}</h4>
                          <p>Generado {new Date(content.createdAt).toLocaleDateString('es-ES', { 
                            day: 'numeric', 
                            month: 'short',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}</p>
                        </div>
                        <div className="content-actions">
                          <button 
                            className="btn-secondary small"
                            onClick={(e) => {
                              e.stopPropagation();
                              setViewingContent(content);
                            }}
                            title="Ver contenido"
                          >
                            <i className="fas fa-eye"></i>
                          </button>
                          <button 
                            className="btn-secondary small"
                            onClick={(e) => {
                              e.stopPropagation();
                              generatePDF(content);
                            }}
                            title="Descargar PDF"
                          >
                            <i className="fas fa-file-pdf"></i>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Sección de Generación de Contenido */}
          {activeTab === "generar" && shouldShowGenTab && (
            <div className="tab-content" style={{ maxWidth: '100%', padding: 0 }}>
              <div style={{
                width: '100%',
                maxWidth: '1400px',
                margin: '0 auto',
                minHeight: 'calc(100vh - 180px)',
                background: 'white',
                borderRadius: '24px',
                padding: '0',
                boxShadow: '0 8px 32px rgba(102,126,234,0.15)',
                border: '1px solid rgba(102,126,234,0.1)',
                overflow: 'hidden'
              }}>
                {/* Decorative Header */}
                <div style={{
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  padding: '2rem 2.5rem',
                  position: 'relative',
                  overflow: 'hidden'
                }}>
                  {/* Decorative circles */}
                  <div style={{
                    position: 'absolute',
                    top: '-30px',
                    right: '-30px',
                    width: '150px',
                    height: '150px',
                    background: 'rgba(255,255,255,0.1)',
                    borderRadius: '50%'
                  }}></div>
                  <div style={{
                    position: 'absolute',
                    bottom: '-50px',
                    left: '-20px',
                    width: '120px',
                    height: '120px',
                    background: 'rgba(255,255,255,0.08)',
                    borderRadius: '50%'
                  }}></div>
                  
                  <div style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '1rem',
                    position: 'relative',
                    zIndex: 1
                  }}>
                    <div style={{
                      width: '60px',
                      height: '60px',
                      background: 'rgba(255,255,255,0.2)',
                      backdropFilter: 'blur(10px)',
                      borderRadius: '16px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '1.8rem',
                      color: 'white'
                    }}>
                      <i className="fas fa-robot"></i>
                    </div>
                    <div style={{ color: 'white' }}>
                      <h3 style={{ 
                        margin: 0, 
                        fontSize: '1.5rem', 
                        fontWeight: 700,
                        color: 'white'
                      }}>
                        Asistente Educativo IA
                      </h3>
                      <p style={{ 
                        margin: '0.25rem 0 0 0', 
                        fontSize: '1rem', 
                        opacity: 0.95,
                        color: 'white'
                      }}>
                        Crea resúmenes, cuestionarios y ejercicios personalizados
                      </p>
                    </div>
                  </div>
                </div>

                {/* Chat Container */}
                <div style={{
                  padding: '2rem 2.5rem',
                  background: 'linear-gradient(180deg, #fafbff 0%, #ffffff 100%)'
                }}>
                  <AIChat 
                    placeholder="Ej: Necesito un resumen sobre la Revolución Industrial..." 
                    onSaveContent={saveContent}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Sección de Mis Contenidos */}
          {activeTab === "contenidos" && shouldShowContenidosTab && (
            <div className="tab-content">

              <div className="section-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem' }}>
                <div>
                  <h2>Mis Contenidos Educativos</h2>
                  <p>Gestiona y organiza todo tu material creado con IA</p>
                </div>
                {savedContents.length > 0 && (
                  <button
                    className="btn-secondary"
                    style={{ color: '#ef4444', fontWeight: 500, border: '1px solid #ef4444', background: 'white', padding: '0.5rem 1rem', borderRadius: '8px', marginLeft: 'auto' }}
                    onClick={() => {
                      if (window.confirm('¿Estás seguro de que deseas eliminar todos los contenidos guardados? Esta acción no se puede deshacer.')) {
                        deleteAllContents();
                      }
                    }}
                    title="Eliminar todo"
                  >
                    <i className="fas fa-trash"></i> Eliminar todo
                  </button>
                )}
              </div>

              <div className="content-filters">
                <button 
                  className={`filter-btn ${contentFilter === "all" ? "active" : ""}`}
                  onClick={() => setContentFilter("all")}
                >
                  Todos ({savedContents.length})
                </button>
                <button 
                  className={`filter-btn ${contentFilter === "summary" ? "active" : ""}`}
                  onClick={() => setContentFilter("summary")}
                >
                  Resúmenes ({savedContents.filter(c => c.type === "summary").length})
                </button>
                <button 
                  className={`filter-btn ${contentFilter === "quiz" ? "active" : ""}`}
                  onClick={() => setContentFilter("quiz")}
                >
                  Cuestionarios ({savedContents.filter(c => c.type === "quiz").length})
                </button>
                <button 
                  className={`filter-btn ${contentFilter === "exercises" ? "active" : ""}`}
                  onClick={() => setContentFilter("exercises")}
                >
                  Ejercicios ({savedContents.filter(c => c.type === "exercises").length})
                </button>
              </div>

              {filteredContents.length === 0 ? (
                <div style={{
                  textAlign: 'center',
                  padding: '3rem',
                  background: '#f8fafc',
                  borderRadius: '16px',
                  color: '#6b7280'
                }}>
                  <i className="fas fa-box-open" style={{ fontSize: '3rem', marginBottom: '1rem', color: '#cbd5e1' }}></i>
                  <h3 style={{ color: '#374151', marginBottom: '0.5rem' }}>No hay contenidos</h3>
                  <p style={{ marginBottom: 0 }}>
                    {contentFilter === "all" 
                      ? "Aún no has generado ningún contenido. ¡Empieza creando tu primer resumen o quiz!"
                      : `No tienes ${contentFilter === "summary" ? "resúmenes" : contentFilter === "quiz" ? "cuestionarios" : "ejercicios"} guardados.`
                    }
                  </p>
                </div>
              ) : (
                <div className="content-list">
                  {filteredContents.map((content) => (
                    <div 
                      key={content.id} 
                      className="content-item detailed"
                      onClick={() => setViewingContent(content)}
                      style={{ cursor: 'pointer', transition: 'all 0.2s ease' }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = 'translateX(5px)';
                        e.currentTarget.style.boxShadow = '0 4px 20px rgba(250, 248, 248, 0.15)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'translateX(0)';
                        e.currentTarget.style.boxShadow = 'none';
                      }}
                    >
                      <div className="content-icon large">
                        <i className={`fas ${
                          content.type === 'quiz' ? 'fa-question-circle' :
                          content.type === 'summary' ? 'fa-file-alt' :
                          content.type === 'exercises' ? 'fa-tasks' :
                          'fa-lightbulb'
                        }`}></i>
                      </div>
                      <div className="content-info">
                        <h4>{content.title}</h4>
                        <p style={{ textTransform: 'capitalize' }}>{content.type} • Generado con IA</p>
                        <div className="content-meta">
                          <span>
                            <i className="fas fa-calendar"></i> 
                            {new Date(content.createdAt).toLocaleDateString('es-ES', { 
                              day: 'numeric', 
                              month: 'long',
                              year: 'numeric'
                            })}
                          </span>
                          <span>
                            <i className="fas fa-clock"></i>
                            {new Date(content.createdAt).toLocaleTimeString('es-ES', { 
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </span>
                        </div>
                      </div>
                      <div className="content-actions" style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                        <button 
                          className="btn-primary small"
                          onClick={(e) => {
                            e.stopPropagation();
                            setViewingContent(content);
                          }}
                          title="Ver contenido"
                        >
                          <i className="fas fa-eye"></i> Ver
                        </button>
                        <button 
                          className="btn-secondary small"
                          onClick={(e) => {
                            e.stopPropagation();
                            generatePDF(content);
                          }}
                          title="Descargar PDF"
                        >
                          <i className="fas fa-file-pdf"></i>
                        </button>
                        <button 
                          className="btn-secondary small"
                          onClick={(e) => {
                            e.stopPropagation();
                            navigator.clipboard.writeText(content.content);
                          }}
                          title="Copiar"
                        >
                          <i className="fas fa-copy"></i>
                        </button>
                        <button 
                          className="btn-secondary small"
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteContent(content.id);
                          }}
                          style={{ color: '#ef4444' }}
                          title="Eliminar"
                        >
                          <i className="fas fa-trash"></i>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
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

      {/* Modal para ver contenido */}
      {viewingContent && (
        <div 
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(0, 0, 0, 0.6)",
            backdropFilter: "blur(4px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
            padding: "1rem"
          }}
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setViewingContent(null);
              setGeneratedImage(null);
            }
          }}
        >
          <div 
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
              background: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
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
                    viewingContent.type === 'quiz' ? 'fa-question-circle' :
                    viewingContent.type === 'summary' ? 'fa-file-alt' :
                    viewingContent.type === 'exercises' ? 'fa-tasks' :
                    'fa-lightbulb'
                  }`} style={{ fontSize: "1.5rem", color: "white" }}></i>
                </div>
                <div>
                  <h2 style={{ color: "white", margin: 0, fontSize: "1.3rem" }}>
                    {viewingContent.title}
                  </h2>
                  <p style={{ color: "rgba(255,255,255,0.8)", margin: 0, fontSize: "0.85rem" }}>
                    {viewingContent.type === 'summary' ? 'Resumen' : 
                     viewingContent.type === 'quiz' ? 'Cuestionario' : 
                     viewingContent.type === 'exercises' ? 'Ejercicios' : 'Contenido'} • 
                    {new Date(viewingContent.createdAt).toLocaleDateString('es-ES')}
                  </p>
                </div>
              </div>
              <button 
                onClick={() => {
                  setViewingContent(null);
                  setGeneratedImage(null);
                }}
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
                  fontSize: "1.2rem"
                }}
              >
                <i className="fas fa-times"></i>
              </button>
            </div>

            {/* Barra de acciones */}
            <div style={{
              padding: "1rem 2rem",
              background: "#f8fafc",
              borderBottom: "1px solid #e2e8f0",
              display: "flex",
              gap: "0.75rem",
              flexWrap: "wrap"
            }}>
              <button
                onClick={() => generatePDF(viewingContent)}
                disabled={generatingPDF}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.5rem",
                  padding: "0.6rem 1.2rem",
                  background: generatingPDF ? "#cbd5e1" : "#ef4444",
                  color: "white",
                  border: "none",
                  borderRadius: "8px",
                  cursor: generatingPDF ? "not-allowed" : "pointer",
                  fontWeight: 600,
                  fontSize: "0.9rem"
                }}
              >
                <i className={`fas ${generatingPDF ? 'fa-spinner fa-spin' : 'fa-file-pdf'}`}></i>
                {generatingPDF ? 'Generando...' : 'Descargar PDF'}
              </button>
              
              {/* Botón de Generar Infografía eliminado por solicitud del usuario */}

              <button
                onClick={() => navigator.clipboard.writeText(viewingContent.content)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.5rem",
                  padding: "0.6rem 1.2rem",
                  background: "#6b7280",
                  color: "white",
                  border: "none",
                  borderRadius: "8px",
                  cursor: "pointer",
                  fontWeight: 600,
                  fontSize: "0.9rem"
                }}
              >
                <i className="fas fa-copy"></i>
                Copiar texto
              </button>
            </div>

            {/* Contenido */}
            <div style={{ 
              padding: "2rem", 
              maxHeight: "calc(90vh - 200px)", 
              overflowY: "auto" 
            }}>
              {/* Infografía generada */}
              {generatedImage && (
                <div style={{
                  marginBottom: "2rem",
                  padding: "1.5rem",
                  background: "linear-gradient(135deg, #f0f4ff 0%, #e8f5e9 100%)",
                  borderRadius: "12px",
                  border: "2px solid #667eea"
                }}>
                  <div style={{ 
                    display: "flex", 
                    alignItems: "center", 
                    gap: "0.5rem", 
                    marginBottom: "1rem",
                    color: "#667eea",
                    fontWeight: 700
                  }}>
                    <i className="fas fa-magic"></i>
                    Infografía Generada con IA
                  </div>
                  <pre style={{
                    whiteSpace: "pre-wrap",
                    fontFamily: "monospace",
                    fontSize: "0.9rem",
                    lineHeight: 1.6,
                    color: "#1f2937",
                    background: "white",
                    padding: "1.5rem",
                    borderRadius: "8px",
                    overflow: "auto"
                  }}>
                    {generatedImage}
                  </pre>
                </div>
              )}

              {/* Contenido principal */}
              <div style={{
                lineHeight: 1.8,
                color: "#374151",
                fontSize: "1rem"
              }}>
                <div dangerouslySetInnerHTML={{ 
                  __html: viewingContent.content
                    .replace(/^### (.*$)/gim, '<h3 style="margin: 1.5rem 0 0.75rem; color: #1f2937; font-size: 1.1rem; font-weight: 700;">$1</h3>')
                    .replace(/^## (.*$)/gim, '<h2 style="margin: 1.5rem 0 0.75rem; color: #1f2937; font-size: 1.25rem; font-weight: 700;">$1</h2>')
                    .replace(/^# (.*$)/gim, '<h1 style="margin: 1.5rem 0 0.75rem; color: #1f2937; font-size: 1.4rem; font-weight: 700;">$1</h1>')
                    .replace(/\*\*(.*?)\*\*/gim, '<strong style="color: #1f2937;">$1</strong>')
                    .replace(/\*(.*?)\*/gim, '<em>$1</em>')
                    .replace(/^\- (.*$)/gim, '<li style="margin: 0.25rem 0; margin-left: 1.5rem;">$1</li>')
                    .replace(/^\* (.*$)/gim, '<li style="margin: 0.25rem 0; margin-left: 1.5rem;">$1</li>')
                    .replace(/^\d+\. (.*$)/gim, '<li style="margin: 0.25rem 0; margin-left: 1.5rem;">$1</li>')
                    .replace(/\n/gim, '<br>')
                }} />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de IA */}
      {showAIModal && (
        <div 
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(0, 0, 0, 0.6)",
            backdropFilter: "blur(4px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
            padding: "1rem"
          }}
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowAIModal(null);
          }}
        >
          <div 
            style={{
              background: "white",
              borderRadius: "20px",
              width: "100%",
              maxWidth: "800px",
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
                    "fa-tasks"
                  }`} style={{ fontSize: "1.5rem", color: "white" }}></i>
                </div>
                <div>
                  <h2 style={{ color: "white", margin: 0, fontSize: "1.5rem" }}>
                    {showAIModal === "summary" && "Generar Resumen Inteligente"}
                    {showAIModal === "quiz" && "Crear Cuestionario Adaptativo"}
                    {showAIModal === "exercises" && "Crear Ejercicios"}
                  </h2>
                  <p style={{ color: "rgba(255,255,255,0.8)", margin: 0, fontSize: "0.9rem" }}>
                    Potenciado por Gemini AI • Se guardará automáticamente
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
                  // Extraer título del contenido (primera línea o primeras palabras)
                  const lines = content.split('\n');
                  let title = lines[0].replace(/^#+\s*/, '').replace(/\*\*/g, '').trim();
                  if (title.length > 50) title = title.substring(0, 50) + '...';
                  if (!title) title = `${type === 'summary' ? 'Resumen' : type === 'material' ? 'Material' : type === 'explanation' ? 'Explicación' : 'Ejercicios'} - ${new Date().toLocaleDateString()}`;
                  
                  saveContent(type, title, content);
                }}
                onQuizGenerated={(quiz) => {
                  saveContent('quiz', quiz.title, JSON.stringify(quiz, null, 2), quiz);
                }}
              />
            </div>
          </div>
        </div>
      )}

      <style jsx global>{`
        /* Navbar SaaS */
        .navbar {
          background: linear-gradient(90deg, #f8fafc 0%, #eef2ff 100%);
          box-shadow: 0 2px 12px rgba(102,126,234,0.07);
          border-bottom: 1px solid #e5e7eb;
          padding: 0.5rem 0;
        }
        .nav-container {
          max-width: 1400px;
          margin: 0 auto;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0.5rem 2rem;
        }
        .logo {
          font-size: 1.5rem;
          font-weight: 700;
          color: #4f46e5;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }
        .nav-menu ul {
          display: flex;
          gap: 1.5rem;
        }
        .nav-tab {
          background: none;
          border: none;
          font-size: 1rem;
          font-weight: 600;
          color: #6366f1;
          padding: 0.75rem 1.5rem;
          border-radius: 8px;
          transition: background 0.2s, color 0.2s;
        }
        .nav-tab.active {
          background: linear-gradient(90deg, rgba(99,102,241,0.18) 0%, rgba(118,75,162,0.18) 100%);
          color: #4f46e5;
          box-shadow: 0 2px 8px rgba(102,126,234,0.10);
          backdrop-filter: blur(2px);
          font-weight: 700;
        }
        .header-search-container {
          background: #fff;
          border-radius: 8px;
          box-shadow: 0 2px 8px rgba(102,126,234,0.07);
          padding: 0.25rem 1rem;
          display: flex;
          align-items: center;
          position: relative;
          max-width: 350px;
        }
        .header-search-icon {
          position: absolute;
          left: 1rem;
          top: 50%;
          transform: translateY(-50%);
          color: #6366f1;
          font-size: 1.2rem;
          opacity: 0.7;
          pointer-events: none;
        }
        .header-search-input {
          border: none;
          outline: none;
          background: transparent;
          font-size: 1rem;
          padding: 0.5rem 0.5rem 0.5rem 2.2rem;
          width: 100%;
        }
        .user-avatar {
          background: linear-gradient(135deg, #6366f1 0%, #764ba2 100%);
          color: #fff;
          font-weight: 700;
          border-radius: 50%;
          width: 36px;
          height: 36px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.1rem;
          box-shadow: 0 2px 8px rgba(102,126,234,0.10);
        }
        .user-dropdown-menu {
          position: absolute;
          right: 0;
          top: 48px;
          background: #fff;
          border-radius: 12px;
          box-shadow: 0 8px 32px rgba(102,126,234,0.13);
          min-width: 220px;
          z-index: 10;
          padding: 0.5rem 0;
        }
        .dropdown-header {
          padding: 0.75rem 1.25rem;
          font-weight: 600;
          color: #6366f1;
        }
        .dropdown-email {
          font-size: 0.95rem;
          color: #6366f1;
        }
        .dropdown-divider {
          height: 1px;
          background: #e5e7eb;
          margin: 0.25rem 0;
        }
        .dropdown-item {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 0.75rem 1.25rem;
          color: #374151;
          font-size: 1rem;
          background: none;
          border: none;
          width: 100%;
          cursor: pointer;
          transition: background 0.18s;
        }
        .dropdown-item:hover {
          background: #f3f4f6;
        }
        /* Dashboard Header */
        .dashboard-header {
          background: linear-gradient(90deg, #eef2ff 0%, #f8fafc 100%);
          padding: 2.5rem 2rem 1.5rem 2rem;
          border-bottom: 1px solid #e5e7eb;
        }
        .welcome-section {
          max-width: 900px;
          margin: 0 auto;
        }
        .welcome-section h1 {
          font-size: 2.2rem;
          font-weight: 800;
          color: #4f46e5;
          margin-bottom: 0.5rem;
        }
        .bright-text {
          color: #4f46e5 !important;
          font-weight: 800;
        }
        .welcome-section p {
          font-size: 1.15rem;
          color: #6366f1;
          margin-bottom: 0.5rem;
        }
        /* Dashboard Content */
        .dashboard-container {
          max-width: 1400px;
          margin: 0 auto;
          padding: 2rem 2rem 2rem 2rem;
        }
        .section-header {
          margin-bottom: 2.5rem;
        }
        .section-header h2 {
          font-size: 1.6rem;
          font-weight: 700;
          color: #4f46e5;
          margin-bottom: 0.25rem;
        }
        .section-header p {
          font-size: 1.05rem;
          color: #6366f1;
        }
        /* Cards y grids */
        .features-grid, .generation-options {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
          gap: 2rem;
          margin-bottom: 2.5rem;
        }
        .feature-card, .generation-card {
          background: linear-gradient(135deg, #f8fafc 0%, #eef2ff 100%);
          border-radius: 18px;
          box-shadow: 0 8px 32px rgba(102,126,234,0.09);
          padding: 2rem 1.5rem 1.5rem 1.5rem;
          transition: box-shadow 0.25s, transform 0.25s;
          position: relative;
        }
        .feature-card:hover, .generation-card:hover {
          box-shadow: 0 16px 48px rgba(102,126,234,0.16);
          transform: translateY(-6px) scale(1.02);
        }
        .featured-badge {
          position: absolute;
          top: 1.2rem;
          right: 1.2rem;
          background: linear-gradient(90deg, #6366f1 0%, #764ba2 100%);
          color: #fff;
          font-size: 0.85rem;
          font-weight: 700;
          padding: 0.35rem 1rem;
          border-radius: 8px;
          box-shadow: 0 2px 8px rgba(102,126,234,0.13);
        }
        .card-icon, .generation-header i {
          background: linear-gradient(135deg, #6366f1 0%, #764ba2 100%);
          color: #fff;
          border-radius: 12px;
          width: 56px;
          height: 56px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 2rem;
          margin-bottom: 1.2rem;
          box-shadow: 0 2px 8px rgba(102,126,234,0.10);
        }
        .feature-card h3, .generation-header h3 {
          font-size: 1.25rem;
          font-weight: 700;
          color: #374151;
          margin-bottom: 0.5rem;
          margin-left: 0.5rem;
          display: inline-block;
        }
        .feature-card p, .generation-card p {
          font-size: 1rem;
          color: #6b7280;
          margin-bottom: 1rem;
        }
        .btn-primary, .btn-secondary {
          background: linear-gradient(90deg, #6366f1 0%, #764ba2 100%);
          color: #fff;
          font-weight: 700;
          border: none;
          border-radius: 8px;
          padding: 0.7rem 1.5rem;
          font-size: 1rem;
          box-shadow: 0 2px 8px rgba(102,126,234,0.10);
          transition: background 0.18s, transform 0.18s;
        }
        .btn-primary:hover, .btn-secondary:hover {
          background: linear-gradient(90deg, #764ba2 0%, #6366f1 100%);
          transform: scale(1.04);
        }
        .btn-secondary {
          background: #eef2ff;
          color: #6366f1;
        }
        .btn-secondary:hover {
          background: #6366f1;
          color: #fff;
        }
        /* Filtros y listas */
        .content-filters {
          display: flex;
          gap: 1rem;
          margin-bottom: 2rem;
        }
        .filter-btn {
          background: #eef2ff;
          color: #6366f1;
          border: none;
          border-radius: 8px;
          padding: 0.5rem 1rem;
          font-size: 0.95rem;
          font-weight: 600;
          transition: background 0.18s, color 0.18s;
        }
        .filter-btn.active, .filter-btn:hover {
          background: #6366f1;
          color: #fff;
        }
        /* Modales y detalles */
        .content-item, .content-item.detailed {
          background: #fff;
          border-radius: 12px;
          box-shadow: 0 2px 8px rgba(102,126,234,0.07);
          padding: 1.2rem 1rem;
          display: flex;
          align-items: center;
          gap: 1rem;
          transition: box-shadow 0.18s, transform 0.18s;
        }
        .content-item:hover, .content-item.detailed:hover {
          box-shadow: 0 8px 32px rgba(102,126,234,0.13);
          transform: translateY(-4px) scale(1.02);
        }
        .content-icon {
          background: linear-gradient(135deg, #6366f1 0%, #764ba2 100%);
          color: #fff;
          border-radius: 10px;
          width: 40px;
          height: 40px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.2rem;
        }
        .content-info {
          flex: 1;
        }
        .content-title {
          font-size: 1.05rem;
          font-weight: 700;
          color: #374151;
          margin-bottom: 0.2rem;
        }
        .content-date {
          font-size: 0.95rem;
          color: #6b7280;
        }
        .content-actions {
          display: flex;
          gap: 0.5rem;
        }
        /* Responsive */
        @media (max-width: 768px) {
          .nav-container, .dashboard-container, .dashboard-header {
            padding: 1rem;
          }
          .features-grid, .generation-options {
            grid-template-columns: 1fr;
            gap: 1rem;
          }
          .content-filters {
            flex-direction: column;
            gap: 0.5rem;
          }
        }

        /* Eliminar borde especial, todos iguales */
        .features-grid .feature-card.featured,
        .generation-options .generation-card.featured {
          border: none !important;
          box-shadow: 0 8px 32px rgba(102,126,234,0.09);
        }
      `}</style>
    </>
  );
}