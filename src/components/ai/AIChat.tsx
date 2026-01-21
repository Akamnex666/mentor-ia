"use client";

import React, { useState, useRef, useEffect } from "react";
import { useAIChat } from "../../features/ai";
import { ChatMessage } from "../../types/ai";

interface AIChatProps {
  className?: string;
  context?: string;
  placeholder?: string;
}

export default function AIChat({ 
  className = "", 
  context,
  placeholder = "Escribe tu pregunta..." 
}: AIChatProps) {
  const [input, setInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  
  const { isLoading, error, messages, sendMessage, clearChat } = useAIChat();

  // Scroll automático al final
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;
    
    const message = input.trim();
    setInput("");
    await sendMessage(message, context);
    inputRef.current?.focus();
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const formatTime = (date: Date) => {
    return new Date(date).toLocaleTimeString("es-ES", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className={`ai-chat ${className}`}>
      {/* Header */}
      <div className="chat-header">
        <div className="chat-title">
          <div className="avatar ai">
            <i className="fas fa-robot"></i>
          </div>
          <div>
            <h3>MentorIA</h3>
            <span className="status">
              <span className="status-dot"></span>
              {isLoading ? "Escribiendo..." : "En línea"}
            </span>
          </div>
        </div>
        {messages.length > 0 && (
          <button className="btn-clear" onClick={clearChat} title="Limpiar chat">
            <i className="fas fa-trash"></i>
          </button>
        )}
      </div>

      {/* Mensajes */}
      <div className="chat-messages">
        {messages.length === 0 ? (
          <div className="chat-welcome">
            <div className="welcome-icon">
              <i className="fas fa-graduation-cap"></i>
            </div>
            <h4>¡Hola! Soy MentorIA</h4>
            <p>Tu asistente educativo inteligente. Puedes crear:</p>
            <div className="suggestions">
              <button onClick={() => setInput("Necesito un resumen sobre")}>
                <i className="fas fa-file-alt"></i> Resumen
              </button>
              <button onClick={() => setInput("Créame un cuestionario sobre")}>
                <i className="fas fa-list-check"></i> Cuestionario
              </button>
              <button onClick={() => setInput("Dame ejercicios prácticos sobre")}>
                <i className="fas fa-pen-to-square"></i> Ejercicios
              </button>
            </div>
          </div>
        ) : (
          <>
            {messages.map((message, index) => (
              <MessageBubble key={index} message={message} formatTime={formatTime} />
            ))}
          </>
        )}
        
        {isLoading && (
          <div className="typing-indicator">
            <div className="avatar ai small">
              <i className="fas fa-robot"></i>
            </div>
            <div className="dots">
              <span></span>
              <span></span>
              <span></span>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Error */}
      {error && (
        <div className="chat-error">
          <i className="fas fa-exclamation-circle"></i>
          <span>{error}</span>
        </div>
      )}

      {/* Input */}
      <div className="chat-input-container">
        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder={placeholder}
          disabled={isLoading}
          className="chat-input"
        />
        <button
          className="btn-send"
          onClick={handleSend}
          disabled={!input.trim() || isLoading}
        >
          <i className="fas fa-paper-plane"></i>
        </button>
      </div>

      <style jsx>{`
        .ai-chat {
          display: flex;
          flex-direction: column;
          height: 500px;
          background: white;
          border-radius: 16px;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
          overflow: hidden;
        }

        .chat-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1rem 1.5rem;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
        }

        .chat-title {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }

        .chat-title h3 {
          margin: 0;
          font-size: 1.1rem;
        }

        .avatar {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.1rem;
        }

        .avatar.ai {
          background: rgba(255, 255, 255, 0.2);
        }

        .avatar.small {
          width: 32px;
          height: 32px;
          font-size: 0.9rem;
        }

        .status {
          font-size: 0.8rem;
          opacity: 0.9;
          display: flex;
          align-items: center;
          gap: 0.4rem;
        }

        .status-dot {
          width: 8px;
          height: 8px;
          background: #4ade80;
          border-radius: 50%;
        }

        .btn-clear {
          background: rgba(255, 255, 255, 0.2);
          border: none;
          color: white;
          width: 36px;
          height: 36px;
          border-radius: 50%;
          cursor: pointer;
          transition: background 0.2s ease;
        }

        .btn-clear:hover {
          background: rgba(255, 255, 255, 0.3);
        }

        .chat-messages {
          flex: 1;
          overflow-y: auto;
          padding: 1.5rem;
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .chat-welcome {
          text-align: center;
          padding: 2rem 1rem;
        }

        .welcome-icon {
          width: 60px;
          height: 60px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 1rem;
          color: white;
          font-size: 1.5rem;
        }

        .chat-welcome h4 {
          color: #1f2937;
          margin: 0 0 0.5rem 0;
        }

        .chat-welcome p {
          color: #6b7280;
          margin: 0 0 1rem 0;
        }

        .suggestions {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .suggestions button {
          padding: 0.75rem 1rem;
          background: #f3f4f6;
          border: 1px solid #e5e7eb;
          border-radius: 8px;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          color: #4b5563;
          font-size: 0.9rem;
          transition: all 0.2s ease;
        }

        .suggestions button:hover {
          background: #e5e7eb;
          border-color: #d1d5db;
        }

        .suggestions button i {
          color: #667eea;
        }

        .typing-indicator {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }

        .dots {
          display: flex;
          gap: 4px;
          padding: 0.75rem 1rem;
          background: #f3f4f6;
          border-radius: 18px;
        }

        .dots span {
          width: 8px;
          height: 8px;
          background: #9ca3af;
          border-radius: 50%;
          animation: bounce 1.4s infinite ease-in-out both;
        }

        .dots span:nth-child(1) { animation-delay: -0.32s; }
        .dots span:nth-child(2) { animation-delay: -0.16s; }

        @keyframes bounce {
          0%, 80%, 100% { transform: scale(0); }
          40% { transform: scale(1); }
        }

        .chat-error {
          padding: 0.75rem 1rem;
          background: #fef2f2;
          border-top: 1px solid #fecaca;
          color: #dc2626;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.9rem;
        }

        .chat-input-container {
          display: flex;
          gap: 0.5rem;
          padding: 1rem 1.5rem;
          border-top: 1px solid #e5e7eb;
          background: #f9fafb;
        }

        .chat-input {
          flex: 1;
          padding: 0.875rem 1rem;
          border: 2px solid #e5e7eb;
          border-radius: 25px;
          font-size: 0.95rem;
          transition: border-color 0.2s ease;
        }

        .chat-input:focus {
          outline: none;
          border-color: #667eea;
        }

        .chat-input:disabled {
          background: #f3f4f6;
        }

        .btn-send {
          width: 48px;
          height: 48px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          border: none;
          border-radius: 50%;
          color: white;
          cursor: pointer;
          transition: all 0.2s ease;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .btn-send:hover:not(:disabled) {
          transform: scale(1.05);
        }

        .btn-send:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
      `}</style>
    </div>
  );
}

// Componente para cada mensaje
function MessageBubble({ 
  message, 
  formatTime 
}: { 
  message: ChatMessage; 
  formatTime: (date: Date) => string;
}) {
  const isUser = message.role === "user";

  return (
    <div className={`message ${isUser ? "user" : "ai"}`}>
      {!isUser && (
        <div className="avatar ai small">
          <i className="fas fa-robot"></i>
        </div>
      )}
      <div className="message-content">
        <div className="bubble">
          {message.content}
        </div>
        {message.timestamp && (
          <span className="time">{formatTime(message.timestamp)}</span>
        )}
      </div>
      {isUser && (
        <div className="avatar user small">
          <i className="fas fa-user"></i>
        </div>
      )}

      <style jsx>{`
        .message {
          display: flex;
          gap: 0.75rem;
          max-width: 85%;
        }

        .message.user {
          margin-left: auto;
          flex-direction: row-reverse;
        }

        .avatar {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 0.85rem;
          flex-shrink: 0;
        }

        .avatar.ai {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
        }

        .avatar.user {
          background: #e5e7eb;
          color: #6b7280;
        }

        .message-content {
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
        }

        .message.user .message-content {
          align-items: flex-end;
        }

        .bubble {
          padding: 0.875rem 1.25rem;
          border-radius: 18px;
          line-height: 1.5;
          white-space: pre-wrap;
        }

        .message.ai .bubble {
          background: #f3f4f6;
          color: #1f2937;
          border-bottom-left-radius: 4px;
        }

        .message.user .bubble {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          border-bottom-right-radius: 4px;
        }

        .time {
          font-size: 0.7rem;
          color: #9ca3af;
          padding: 0 0.5rem;
        }
      `}</style>
    </div>
  );
}
