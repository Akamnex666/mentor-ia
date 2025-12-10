// Login.tsx
"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../../lib/supabase";
import { useToast } from "../../../providers/ToastProvider";

// Sistema de bloqueo temporal por intentos fallidos
const MAX_LOGIN_ATTEMPTS = 5;
const LOCK_TIME_MINUTES = 15;
const LOCK_STORAGE_KEY = "login_lock_";

const getLoginAttempts = (email: string) => {
  const key = `${LOCK_STORAGE_KEY}${email}`;
  const data = localStorage.getItem(key);
  if (!data) return { attempts: 0, lockedUntil: null };
  
  try {
    return JSON.parse(data);
  } catch {
    return { attempts: 0, lockedUntil: null };
  }
};

const setLoginAttempts = (email: string, attempts: number, lockedUntil: number | null = null) => {
  const key = `${LOCK_STORAGE_KEY}${email}`;
  localStorage.setItem(key, JSON.stringify({ attempts, lockedUntil }));
};

const isAccountLocked = (email: string): { locked: boolean; remainingTime: number } => {
  const { attempts, lockedUntil } = getLoginAttempts(email);
  
  if (!lockedUntil) {
    return { locked: false, remainingTime: 0 };
  }
  
  const now = Date.now();
  if (now < lockedUntil) {
    const remainingMs = lockedUntil - now;
    const remainingMinutes = Math.ceil(remainingMs / 60000);
    return { locked: true, remainingTime: remainingMinutes };
  }
  
  // El bloqueo ha expirado, reiniciar intentos
  setLoginAttempts(email, 0, null);
  return { locked: false, remainingTime: 0 };
};

const recordFailedAttempt = (email: string) => {
  const { attempts, lockedUntil } = getLoginAttempts(email);
  const newAttempts = attempts + 1;
  
  if (newAttempts >= MAX_LOGIN_ATTEMPTS) {
    const lockUntilTime = Date.now() + LOCK_TIME_MINUTES * 60 * 1000;
    setLoginAttempts(email, newAttempts, lockUntilTime);
  } else {
    setLoginAttempts(email, newAttempts, lockedUntil);
  }
};

const recordSuccessfulLogin = (email: string) => {
  const key = `${LOCK_STORAGE_KEY}${email}`;
  localStorage.removeItem(key);
};

export default function LoginPage() {
  const router = useRouter();
  const toast = useToast();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [resetLoading, setResetLoading] = useState(false);
  const [resetSent, setResetSent] = useState(false);
  const [accountLocked, setAccountLocked] = useState(false);
  const [lockTimeRemaining, setLockTimeRemaining] = useState(0);

  // Controlar el tiempo de desbloqueo
  useEffect(() => {
    if (!accountLocked) return;
    
    const interval = setInterval(() => {
      const { locked, remainingTime } = isAccountLocked(email);
      if (!locked) {
        setAccountLocked(false);
        setLockTimeRemaining(0);
        clearInterval(interval);
      } else {
        setLockTimeRemaining(remainingTime);
      }
    }, 1000);
    
    return () => clearInterval(interval);
  }, [accountLocked, email]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Verificar si la cuenta está bloqueada
    const { locked, remainingTime } = isAccountLocked(email);
    if (locked) {
      const errorMsg = `Cuenta bloqueada temporalmente. Intenta de nuevo en ${remainingTime} minuto${remainingTime !== 1 ? 's' : ''}`;
      setError(errorMsg);
      setAccountLocked(true);
      setLockTimeRemaining(remainingTime);
      toast.push({ type: "error", message: errorMsg });
      return;
    }

    setLoading(true);
    try {
      const { data, error: signInError } = await supabase.auth.signInWithPassword({ email, password });
      if (signInError) {
        recordFailedAttempt(email);
        const { attempts } = getLoginAttempts(email);
        const remainingAttempts = MAX_LOGIN_ATTEMPTS - attempts;
        
        let errorMsg = signInError.message || "Credenciales incorrectas";
        
        if (attempts >= MAX_LOGIN_ATTEMPTS) {
          errorMsg = `Cuenta bloqueada por ${LOCK_TIME_MINUTES} minutos debido a múltiples intentos fallidos`;
          setAccountLocked(true);
          const { remainingTime } = isAccountLocked(email);
          setLockTimeRemaining(remainingTime);
        } else if (remainingAttempts > 0) {
          errorMsg = `${errorMsg}. Intentos restantes: ${remainingAttempts}`;
        }
        
        setError(errorMsg);
        toast.push({ type: "error", message: errorMsg });
        return;
      }
      
      recordSuccessfulLogin(email);
      toast.push({ type: "success", message: "Inicio de sesión exitoso" });
      router.push("/dashboard");
    } catch (err: any) {
      setError(err.message);
      recordFailedAttempt(email);
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setResetLoading(true);
    setError(null);
    
    try {
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(resetEmail, {
        redirectTo: `${window.location.origin}/auth/reset-password`,
      });
      
      if (resetError) {
        setError(resetError.message);
        toast.push({ type: "error", message: resetError.message });
        return;
      }
      
      setResetSent(true);
      toast.push({ type: "success", message: "Correo de recuperación enviado" });
    } catch (err: any) {
      setError(err.message);
    } finally {
      setResetLoading(false);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const openForgotPassword = () => {
    setShowForgotPassword(true);
    setResetEmail(email); // Pre-fill with the email from login
    setError(null);
    setResetSent(false);
  };

  const closeForgotPassword = () => {
    setShowForgotPassword(false);
    setResetEmail("");
    setError(null);
    setResetSent(false);
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
            
            {/* Formulario de Login */}
            {!showForgotPassword ? (
              <>
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

                  <div style={{ textAlign: 'right' }}>
                    <button
                      type="button"
                      onClick={openForgotPassword}
                      className="auth-link"
                      style={{ 
                        background: 'none', 
                        border: 'none', 
                        color: '#4f46e5', 
                        cursor: 'pointer',
                        fontSize: '0.9rem',
                        textDecoration: 'underline'
                      }}
                    >
                      ¿Olvidaste tu contraseña?
                    </button>
                  </div>

                  {error && (
                    <div className="auth-error">
                      <i className="fas fa-exclamation-circle"></i>
                      {error}
                    </div>
                  )}

                  {accountLocked && (
                    <div style={{
                      backgroundColor: '#fef2f2',
                      border: '1px solid #fecaca',
                      borderRadius: '0.75rem',
                      padding: '1rem',
                      marginBottom: '1rem',
                      color: '#dc2626',
                      fontSize: '0.9rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem'
                    }}>
                      <i className="fas fa-lock" style={{ fontSize: '1.2rem' }}></i>
                      <div>
                        <strong>Cuenta bloqueada</strong>
                        <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.85rem' }}>
                          Intenta de nuevo en {lockTimeRemaining} minuto{lockTimeRemaining !== 1 ? 's' : ''}
                        </p>
                      </div>
                    </div>
                  )}

                  <button 
                    type="submit" 
                    className="btn-primary"
                    disabled={loading || accountLocked}
                    style={{ width: '100%', marginTop: '0.5rem', opacity: accountLocked ? 0.5 : 1 }}
                  >
                    {loading ? (
                      <>
                        <i className="fas fa-spinner fa-spin"></i>
                        Entrando...
                      </>
                    ) : accountLocked ? (
                      <>
                        <i className="fas fa-lock"></i>
                        Bloqueado temporalmente
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
              </>
            ) : (
              /* Formulario de Recuperación de Contraseña */
              <>
                <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                  <div className="hero-badge">
                    <i className="fas fa-key"></i> Recuperar contraseña
                  </div>
                  <h1 style={{ fontSize: '2rem', fontWeight: '700', marginBottom: '0.5rem', color: '#1f2937' }}>
                    Recupera tu acceso
                  </h1>
                  <p style={{ color: '#6b7280' }}>
                    Te enviaremos un enlace para restablecer tu contraseña.
                  </p>
                </div>

                {resetSent ? (
                  <div style={{ textAlign: 'center', padding: '2rem' }}>
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
                    <h3 style={{ marginBottom: '1rem', color: '#1f2937' }}>Correo enviado</h3>
                    <p style={{ color: '#6b7280', marginBottom: '2rem' }}>
                      Hemos enviado un enlace de recuperación a <strong>{resetEmail}</strong>. 
                      Revisa tu bandeja de entrada.
                    </p>
                    <button
                      onClick={closeForgotPassword}
                      className="btn-primary"
                      style={{ width: '100%' }}
                    >
                      <i className="fas fa-arrow-left"></i> Volver al login
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleForgotPassword} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
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
                          value={resetEmail} 
                          onChange={(e) => setResetEmail(e.target.value)} 
                          required 
                          placeholder="tú@ejemplo.com"
                          className="auth-input"
                          style={{ paddingLeft: '2.5rem', width: '100%' }}
                        />
                      </div>
                    </div>

                    {error && (
                      <div className="auth-error">
                        <i className="fas fa-exclamation-circle"></i>
                        {error}
                      </div>
                    )}

                    <div style={{ display: 'flex', gap: '1rem' }}>
                      <button
                        type="button"
                        onClick={closeForgotPassword}
                        className="btn-secondary"
                        style={{ flex: 1 }}
                      >
                        <i className="fas fa-arrow-left"></i> Volver
                      </button>
                      <button 
                        type="submit" 
                        className="btn-primary"
                        disabled={resetLoading}
                        style={{ flex: 2 }}
                      >
                        {resetLoading ? (
                          <>
                            <i className="fas fa-spinner fa-spin"></i>
                            Enviando...
                          </>
                        ) : (
                          <>
                            <i className="fas fa-paper-plane"></i>
                            Enviar enlace
                          </>
                        )}
                      </button>
                    </div>
                  </form>
                )}
              </>
            )}
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