// Login.tsx
"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../../lib/supabase";
import { useToast } from "../../../providers/ToastProvider";

export default function LoginPage() {
  const router = useRouter();
  const toast = useToast();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const { data, error: signInError } = await supabase.auth.signInWithPassword({ email, password });
      if (signInError) {
        setError(signInError.message || "Credenciales incorrectas");
        toast.push({ type: "error", message: signInError.message });
        return;
      }
      toast.push({ type: "success", message: "Inicio de sesión exitoso" });
      router.push("/dashboard");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <>
      <header className="navbar">
        <div className="nav-container">
          <div className="logo">
            <i className="fas fa-graduation-cap"></i>
            <span>MentorIA</span>
          </div>

          <nav className="nav-menu">
            <ul>
              <li>
                <a href="/">
                  <i className="fas fa-home"></i> Inicio
                </a>
              </li>
              <li>
                <a href="/#generar">
                  <i className="fas fa-magic"></i> Generar Contenido
                </a>
              </li>
              <li>
                <a href="/#planes">
                  <i className="fas fa-crown"></i> Planes
                </a>
              </li>
              <li>
                <a href="/#contacto">
                  <i className="fas fa-envelope"></i> Contacto
                </a>
              </li>
            </ul>
          </nav>

          <button
            className="btn-login"
            aria-label="Registrarse"
            onClick={() => router.push("/auth/register")}
          >
            <i className="fas fa-user-plus"></i> Registrarse
          </button>
        </div>
      </header>

      <main className="auth-container">
        <div className="auth-card" style={{ 
          maxWidth: '1000px', 
          display: 'grid', 
          gridTemplateColumns: '1fr 1fr',
          minHeight: '600px'
        }}>
          <div style={{ padding: '3rem', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
              <div className="hero-badge">
                <i className="fas fa-sign-in-alt"></i> Acceso seguro
              </div>
              <h1 style={{ fontSize: '2rem', fontWeight: '700', marginBottom: '0.5rem', color: '#1f2937' }}>
                Bienvenido de nuevo a <span className="bright-text">MentorIA</span>
              </h1>
              <p style={{ color: '#6b7280' }}>
                Accede para continuar creando contenido educativo con IA.
              </p>
            </div>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <div>
                <label style={{ display: 'block', fontWeight: '500', color: '#374151', marginBottom: '0.5rem', fontSize: '0.9rem' }}>
                  Correo electrónico
                </label>
                <div style={{ position: 'relative' }}>
                  <i className="fas fa-envelope" style={{ 
                    position: 'absolute', 
                    left: '1rem', 
                    top: '50%', 
                    transform: 'translateY(-50%)', 
                    color: '#6b7280' 
                  }}></i>
                  <input 
                    type="email" 
                    value={email} 
                    onChange={(e) => setEmail(e.target.value)} 
                    required 
                    placeholder="tú@ejemplo.com"
                    className="auth-input"
                    style={{ paddingLeft: '2.5rem', width: '100%' }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontWeight: '500', color: '#374151', marginBottom: '0.5rem', fontSize: '0.9rem' }}>
                  Contraseña
                </label>
                <div style={{ position: 'relative' }}>
                  <i className="fas fa-lock" style={{ 
                    position: 'absolute', 
                    left: '1rem', 
                    top: '50%', 
                    transform: 'translateY(-50%)', 
                    color: '#6b7280' 
                  }}></i>
                  <input 
                    type={showPassword ? "text" : "password"}
                    value={password} 
                    onChange={(e) => setPassword(e.target.value)} 
                    required 
                    placeholder="••••••••"
                    className="auth-input"
                    style={{ paddingLeft: '2.5rem', paddingRight: '2.5rem', width: '100%' }}
                  />
                  <button
                    type="button"
                    onClick={togglePasswordVisibility}
                    style={{
                      position: 'absolute',
                      right: '1rem',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'none',
                      border: 'none',
                      color: '#6b7280',
                      cursor: 'pointer'
                    }}
                  >
                    <i className={`fas ${showPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                  </button>
                </div>
              </div>

              {error && (
                <div className="auth-error">
                  <i className="fas fa-exclamation-circle"></i>
                  {error}
                </div>
              )}

              <button 
                type="submit" 
                className="btn-primary"
                disabled={loading}
                style={{ width: '100%', marginTop: '0.5rem' }}
              >
                {loading ? (
                  <>
                    <i className="fas fa-spinner fa-spin"></i>
                    Entrando...
                  </>
                ) : (
                  <>
                    <i className="fas fa-sign-in-alt"></i>
                    Iniciar sesión
                  </>
                )}
              </button>
            </form>

            <div style={{ textAlign: 'center', marginTop: '2rem', paddingTop: '1.5rem', borderTop: '1px solid #e5e7eb' }}>
              <p style={{ color: '#6b7280', fontSize: '0.9rem' }}>
                ¿No tienes cuenta?{" "}
                <a href="/auth/register" className="auth-link">
                  Regístrate ahora
                </a>
              </p>
            </div>
          </div>

          {/* Hero Visual similar al dashboard */}
          <div style={{ 
            background: 'linear-gradient(135deg, #4f46e5, #7c3aed)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative',
            overflow: 'hidden'
          }}>
            <div className="hero-illustration" style={{ 
              background: 'rgba(255, 255, 255, 0.1)',
              backdropFilter: 'blur(10px)',
              width: '180px',
              height: '180px'
            }}>
              <i className="fas fa-robot" style={{ color: 'white', fontSize: '4rem' }}></i>
            </div>
            <div className="floating-elements">
              <div className="floating-icon" style={{ animationDelay: '0s', top: '20%', right: '20%' }}>
                <i className="fas fa-brain"></i>
              </div>
              <div className="floating-icon" style={{ animationDelay: '1s', top: '60%', left: '20%' }}>
                <i className="fas fa-lightbulb"></i>
              </div>
              <div className="floating-icon" style={{ animationDelay: '2s', bottom: '20%', right: '30%' }}>
                <i className="fas fa-book"></i>
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}