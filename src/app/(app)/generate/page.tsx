"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import AIGenerator from "../../../components/ai/AIGenerator";
import AIChat from "../../../components/ai/AIChat";
import { Quiz, AIContentType } from "../../../types/ai";

export default function GeneratePage() {
  const router = useRouter();
  const [activeView, setActiveView] = useState<"generator" | "chat">("generator");
  const [generatedContent, setGeneratedContent] = useState<{
    content: string;
    type: AIContentType;
  } | null>(null);
  const [generatedQuiz, setGeneratedQuiz] = useState<Quiz | null>(null);

  const handleContentGenerated = (content: string, type: AIContentType) => {
    setGeneratedContent({ content, type });
    setGeneratedQuiz(null);
  };

  const handleQuizGenerated = (quiz: Quiz) => {
    setGeneratedQuiz(quiz);
    setGeneratedContent(null);
  };

  return (
    <>
      {/* Navbar */}
      <header className="navbar">
        <div className="nav-container">
          <div className="logo" onClick={() => router.push("/")} style={{ cursor: "pointer" }}>
            <i className="fas fa-graduation-cap"></i>
            <span>MentorIA</span>
          </div>

          <nav className="nav-menu">
            <ul>
              <li>
                <button
                  className={`nav-tab ${activeView === "generator" ? "active" : ""}`}
                  onClick={() => setActiveView("generator")}
                >
                  <i className="fas fa-magic"></i> Generador
                </button>
              </li>
              <li>
                <button
                  className={`nav-tab ${activeView === "chat" ? "active" : ""}`}
                  onClick={() => setActiveView("chat")}
                >
                  <i className="fas fa-comments"></i> Chat IA
                </button>
              </li>
            </ul>
          </nav>

          <button
            className="btn-login"
            onClick={() => router.push("/dashboard")}
          >
            <i className="fas fa-arrow-left"></i> Volver al Dashboard
          </button>
        </div>
      </header>

      <main style={{ 
        minHeight: "100vh", 
        background: "linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)",
        paddingTop: "100px",
        paddingBottom: "3rem"
      }}>
        <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "0 1.5rem" }}>
          {/* Header */}
          <div style={{ textAlign: "center", marginBottom: "2rem" }}>
            <span style={{
              background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
              color: "white",
              padding: "0.5rem 1rem",
              borderRadius: "20px",
              fontSize: "0.85rem",
              fontWeight: "600",
              display: "inline-block",
              marginBottom: "1rem"
            }}>
              <i className="fas fa-robot" style={{ marginRight: "0.5rem" }}></i>
              Potenciado por Gemini AI
            </span>
            <h1 style={{ 
              fontSize: "2.5rem", 
              fontWeight: "700", 
              color: "#1f2937",
              marginBottom: "0.5rem"
            }}>
              {activeView === "generator" ? "Generador de Contenido IA" : "Chat con MentorIA"}
            </h1>
            <p style={{ color: "#6b7280", fontSize: "1.1rem" }}>
              {activeView === "generator" 
                ? "Crea resúmenes, cuestionarios, material didáctico y más en segundos"
                : "Pregunta cualquier cosa sobre tus temas de estudio"
              }
            </p>
          </div>

          {/* Vista del Generador */}
          {activeView === "generator" && (
            <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "2rem" }}>
              <AIGenerator 
                onContentGenerated={handleContentGenerated}
                onQuizGenerated={handleQuizGenerated}
              />
            </div>
          )}

          {/* Vista del Chat */}
          {activeView === "chat" && (
            <div style={{ maxWidth: "800px", margin: "0 auto" }}>
              <AIChat 
                context="Contexto educativo general - ayuda a estudiantes y educadores"
                placeholder="Escribe tu pregunta sobre cualquier tema educativo..."
              />
            </div>
          )}

          {/* Consejos de uso */}
          <div style={{ 
            marginTop: "3rem", 
            background: "white", 
            borderRadius: "16px", 
            padding: "2rem",
            boxShadow: "0 4px 20px rgba(0, 0, 0, 0.08)"
          }}>
            <h3 style={{ 
              display: "flex", 
              alignItems: "center", 
              gap: "0.5rem",
              color: "#1f2937",
              marginBottom: "1.5rem"
            }}>
              <i className="fas fa-lightbulb" style={{ color: "#667eea" }}></i>
              Consejos para mejores resultados
            </h3>
            
            <div style={{ 
              display: "grid", 
              gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", 
              gap: "1.5rem" 
            }}>
              <div style={{ display: "flex", gap: "1rem" }}>
                <div style={{
                  width: "40px",
                  height: "40px",
                  background: "#f0fdf4",
                  borderRadius: "10px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0
                }}>
                  <i className="fas fa-bullseye" style={{ color: "#22c55e" }}></i>
                </div>
                <div>
                  <h4 style={{ margin: "0 0 0.25rem 0", color: "#1f2937" }}>Sé específico</h4>
                  <p style={{ margin: 0, color: "#6b7280", fontSize: "0.9rem" }}>
                    Cuanto más detallado sea tu tema, mejor será el resultado generado.
                  </p>
                </div>
              </div>

              <div style={{ display: "flex", gap: "1rem" }}>
                <div style={{
                  width: "40px",
                  height: "40px",
                  background: "#fef3c7",
                  borderRadius: "10px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0
                }}>
                  <i className="fas fa-graduation-cap" style={{ color: "#f59e0b" }}></i>
                </div>
                <div>
                  <h4 style={{ margin: "0 0 0.25rem 0", color: "#1f2937" }}>Indica el nivel</h4>
                  <p style={{ margin: 0, color: "#6b7280", fontSize: "0.9rem" }}>
                    Menciona si es para primaria, secundaria, universidad, etc.
                  </p>
                </div>
              </div>

              <div style={{ display: "flex", gap: "1rem" }}>
                <div style={{
                  width: "40px",
                  height: "40px",
                  background: "#fce7f3",
                  borderRadius: "10px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0
                }}>
                  <i className="fas fa-sync-alt" style={{ color: "#ec4899" }}></i>
                </div>
                <div>
                  <h4 style={{ margin: "0 0 0.25rem 0", color: "#1f2937" }}>Itera y mejora</h4>
                  <p style={{ margin: 0, color: "#6b7280", fontSize: "0.9rem" }}>
                    Puedes regenerar el contenido ajustando tus instrucciones.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <style jsx>{`
        .navbar {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          background: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(10px);
          box-shadow: 0 2px 20px rgba(0, 0, 0, 0.1);
          z-index: 1000;
          padding: 1rem 0;
        }

        .nav-container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 1.5rem;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .logo {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 1.5rem;
          font-weight: 700;
          color: #667eea;
        }

        .nav-menu ul {
          display: flex;
          gap: 0.5rem;
          list-style: none;
          margin: 0;
          padding: 0;
        }

        .nav-tab {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.75rem 1.25rem;
          border: none;
          background: transparent;
          color: #64748b;
          font-weight: 500;
          cursor: pointer;
          border-radius: 10px;
          transition: all 0.2s ease;
        }

        .nav-tab:hover {
          background: #f1f5f9;
          color: #667eea;
        }

        .nav-tab.active {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
        }

        .btn-login {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.75rem 1.25rem;
          background: #f1f5f9;
          border: none;
          border-radius: 10px;
          color: #475569;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .btn-login:hover {
          background: #e2e8f0;
        }

        @media (max-width: 768px) {
          .nav-container {
            flex-wrap: wrap;
            gap: 1rem;
          }

          .nav-menu {
            order: 3;
            width: 100%;
          }

          .nav-menu ul {
            justify-content: center;
          }
        }
      `}</style>
    </>
  );
}
