// Register.tsx
"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../../lib/supabase";
import { useToast } from "../../../providers/ToastProvider";

export default function RegisterPage() {
  const router = useRouter();
  const toast = useToast();
  const [email, setEmail] = useState("");
  const [fullName, setFullName] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);

    // Validar que las contraseñas coincidan
    if (password !== confirmPassword) {
      setError("Las contraseñas no coinciden");
      setLoading(false);
      return;
    }

    // Validar longitud mínima de contraseña
    if (password.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres");
      setLoading(false);
      return;
    }

    try {
      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { full_name: fullName } },
      });
      if (signUpError) {
        setError(signUpError.message);
        toast.push({ type: "error", message: signUpError.message });
        return;
      }
      setMessage("Registro exitoso. Revisa tu correo para confirmar.");
      toast.push({ type: "success", message: "Registro exitoso" });
      setTimeout(() => router.push("/login"), 1500);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  return (
    <>
      <header className="navbar">
        <div className="nav-container">
          <div className="logo" onClick={() => router.push('/')} style={{ cursor: 'pointer' }}>
            <i className="fas fa-graduation-cap"></i>
            <span>MentorIA</span>
          </div>

          <button
            className="btn-login"
            aria-label="Iniciar sesión"
            onClick={() => router.push("/login")}
          >
            <i className="fas fa-user"></i> Iniciar Sesión
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
                <i className="fas fa-user-plus"></i> Nuevo usuario
              </div>
              <h1 style={{ fontSize: '2rem', fontWeight: '700', marginBottom: '0.5rem', color: '#1f2937' }}>
                Únete a <span className="bright-text">MentorIA</span>
              </h1>
              <p style={{ color: '#6b7280' }}>
                Crea tu cuenta y comienza a generar contenido educativo personalizado con IA.
              </p>
            </div>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <div>
                <label style={{ display: 'block', fontWeight: '500', color: '#374151', marginBottom: '0.5rem', fontSize: '0.9rem' }}>
                  Nombre completo
                </label>
                <div style={{ position: 'relative' }}>
                  <i className="fas fa-user" style={{ 
                    position: 'absolute', 
                    left: '1rem', 
                    top: '50%', 
                    transform: 'translateY(-50%)', 
                    color: '#6b7280' 
                  }}></i>
                  <input 
                    type="text" 
                    value={fullName} 
                    onChange={(e) => setFullName(e.target.value)} 
                    required 
                    placeholder="Tu nombre completo"
                    className="auth-input"
                    style={{ paddingLeft: '2.5rem', width: '100%' }}
                  />
                </div>
              </div>

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
                    placeholder="Mínimo 6 caracteres"
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

              <div>
                <label style={{ display: 'block', fontWeight: '500', color: '#374151', marginBottom: '0.5rem', fontSize: '0.9rem' }}>
                  Confirmar contraseña
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
                    type={showConfirmPassword ? "text" : "password"}
                    value={confirmPassword} 
                    onChange={(e) => setConfirmPassword(e.target.value)} 
                    required 
                    placeholder="Repite tu contraseña"
                    className="auth-input"
                    style={{ paddingLeft: '2.5rem', paddingRight: '2.5rem', width: '100%' }}
                  />
                  <button
                    type="button"
                    onClick={toggleConfirmPasswordVisibility}
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
                    <i className={`fas ${showConfirmPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                  </button>
                </div>
              </div>

              {error && (
                <div className="auth-error">
                  <i className="fas fa-exclamation-circle"></i>
                  {error}
                </div>
              )}

              {message && (
                <div className="auth-success">
                  <i className="fas fa-check-circle"></i>
                  {message}
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
                    Creando cuenta...
                  </>
                ) : (
                  <>
                    <i className="fas fa-user-plus"></i>
                    Crear cuenta
                  </>
                )}
              </button>
            </form>

            <div style={{ textAlign: 'center', marginTop: '2rem', paddingTop: '1.5rem', borderTop: '1px solid #e5e7eb' }}>
              <p style={{ color: '#6b7280', fontSize: '0.9rem' }}>
                ¿Ya tienes cuenta?{" "}
                <a href="/login" className="auth-link">
                  Inicia sesión
                </a>
              </p>
            </div>
          </div>

          {/* Hero Visual */}
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
              <i className="fas fa-lightbulb" style={{ color: 'white', fontSize: '4rem' }}></i>
            </div>
            <div className="floating-elements">
              <div className="floating-icon" style={{ animationDelay: '0s', top: '20%', right: '20%' }}>
                <i className="fas fa-graduation-cap"></i>
              </div>
              <div className="floating-icon" style={{ animationDelay: '1s', top: '60%', left: '20%' }}>
                <i className="fas fa-rocket"></i>
              </div>
              <div className="floating-icon" style={{ animationDelay: '2s', bottom: '20%', right: '30%' }}>
                <i className="fas fa-star"></i>
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}