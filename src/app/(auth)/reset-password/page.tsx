// /app/auth/reset-password/page.tsx
"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../../lib/supabase";
import { useToast } from "../../../providers/ToastProvider";

export default function ResetPasswordPage() {
  const router = useRouter();
  const toast = useToast();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    // Verificar si hay un hash de recuperación en la URL
    const hash = window.location.hash;
    if (hash.includes('type=recovery')) {
      // Supabase maneja automáticamente la verificación del token
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (password !== confirmPassword) {
      setError("Las contraseñas no coinciden");
      setLoading(false);
      return;
    }

    if (password.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres");
      setLoading(false);
      return;
    }

    try {
      const { error: updateError } = await supabase.auth.updateUser({
        password: password
      });

      if (updateError) {
        setError(updateError.message);
        toast.push({ type: "error", message: updateError.message });
        return;
      }

      setSuccess(true);
      toast.push({ type: "success", message: "Contraseña actualizada correctamente" });

      // Redirigir al login después de 2 segundos
      setTimeout(() => {
        router.push("/login");
      }, 2000);
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
            aria-label="Iniciar sesión"
            onClick={() => router.push("/login")}
          >
            <i className="fas fa-sign-in-alt"></i> Iniciar Sesión
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

            {success ? (
              <div style={{ textAlign: 'center' }}>
                <div style={{
                  width: '80px',
                  height: '80px',
                  background: '#d1fae5',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 1.5rem',
                  color: '#10b981',
                  fontSize: '2rem'
                }}>
                  <i className="fas fa-check"></i>
                </div>
                <h1 style={{ fontSize: '2rem', fontWeight: '700', marginBottom: '1rem', color: '#1f2937' }}>
                  ¡Contraseña actualizada!
                </h1>
                <p style={{ color: '#6b7280', marginBottom: '2rem' }}>
                  Tu contraseña ha sido restablecida correctamente. Serás redirigido al login.
                </p>
                <div className="loading-spinner" style={{ margin: '2rem auto' }}>
                  <i className="fas fa-spinner fa-spin" style={{ fontSize: '2rem', color: '#4f46e5' }}></i>
                </div>
              </div>
            ) : (
              <>
                <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                  <div className="hero-badge">
                    <i className="fas fa-key"></i> Nueva contraseña
                  </div>
                  <h1 style={{ fontSize: '2rem', fontWeight: '700', marginBottom: '0.5rem', color: '#1f2937' }}>
                    Crear nueva contraseña
                  </h1>
                  <p style={{ color: '#6b7280' }}>
                    Ingresa tu nueva contraseña para recuperar el acceso a tu cuenta.
                  </p>
                </div>

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                  <div>
                    <label style={{ display: 'block', fontWeight: '500', color: '#374151', marginBottom: '0.5rem', fontSize: '0.9rem' }}>
                      Nueva contraseña
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

                  <button
                    type="submit"
                    className="btn-primary"
                    disabled={loading}
                    style={{ width: '100%', marginTop: '0.5rem' }}
                  >
                    {loading ? (
                      <>
                        <i className="fas fa-spinner fa-spin"></i>
                        Actualizando...
                      </>
                    ) : (
                      <>
                        <i className="fas fa-check"></i>
                        Restablecer contraseña
                      </>
                    )}
                  </button>
                </form>

                <div style={{ textAlign: 'center', marginTop: '2rem', paddingTop: '1.5rem', borderTop: '1px solid #e5e7eb' }}>
                  <p style={{ color: '#6b7280', fontSize: '0.9rem' }}>
                    ¿Recordaste tu contraseña?{" "}
                    <a href="/login" className="auth-link">
                      Iniciar sesión
                    </a>
                  </p>
                </div>
              </>
            )}
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
              <i className="fas fa-shield-alt" style={{ color: 'white', fontSize: '4rem' }}></i>
            </div>
            <div className="floating-elements">
              <div className="floating-icon" style={{ animationDelay: '0s', top: '20%', right: '20%' }}>
                <i className="fas fa-key"></i>
              </div>
              <div className="floating-icon" style={{ animationDelay: '1s', top: '60%', left: '20%' }}>
                <i className="fas fa-lock"></i>
              </div>
              <div className="floating-icon" style={{ animationDelay: '2s', bottom: '20%', right: '30%' }}>
                <i className="fas fa-user-shield"></i>
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}