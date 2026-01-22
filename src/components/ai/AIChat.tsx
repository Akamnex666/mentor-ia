"use client";

import React, { useState, useRef, useEffect } from "react";
import { useAIChat } from "../../features/ai";
import { ChatMessage } from "../../types/ai";
import "../../styles/globals.css";


interface AIChatProps {
  className?: string;
  context?: string;
  placeholder?: string;
  onSaveContent?: (type: string, title: string, content: string) => void;
}

export default function AIChat({ 
  className = "", 
  context,
  placeholder = "Escribe tu pregunta...",
  onSaveContent
}: AIChatProps) {
  const lastSavedId = useRef<string | null>(null);
  const [input, setInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  
  const { isLoading, error, messages, sendMessage, clearChat } = useAIChat();


  // Guardar automáticamente el último mensaje de la IA
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    if (onSaveContent && messages.length > 1) {
      const last = messages[messages.length - 1];
      const prev = messages[messages.length - 2];
      const lastId = last.timestamp?.toString() || last.content.slice(0, 40);
      if (
        last.role === "model" &&
        prev.role === "user" &&
        lastSavedId.current !== lastId
      ) {
        let type = "summary";
        let title = prev.content.slice(0, 40) || "Contenido generado";
        if (/cuestionario|quiz/i.test(prev.content)) type = "quiz";
        if (/ejercicio/i.test(prev.content)) type = "exercises";
        onSaveContent(type, title, last.content);
        lastSavedId.current = lastId;
      }
    }
  }, [messages, onSaveContent]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;
    
    const message = input.trim();
    setInput("");
    await sendMessage(message, context);
    inputRef.current?.focus();
  };

  const formatTime = (date: Date) => {
    return new Date(date).toLocaleTimeString("es-ES", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className={`ai-chat ${className}`}>
      <div className="chat-messages">
        {messages.length === 0 ? (
          <div className="chat-welcome">
            <div className="welcome-icon">
              <i className="fas fa-graduation-cap"></i>
            </div>
            <h4>¡Hola! Soy MentorIA</h4>
            <p>Tu asistente educativo inteligente. Estoy aquí para ayudarte con lo que necesites.</p>
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

      {error && (
        <div className="chat-error">
          <i className="fas fa-exclamation-circle"></i>
          <span>{error}</span>
        </div>
      )}

      <div className="chat-input-section">
        <div className="chat-input-container">
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            placeholder={placeholder}
            disabled={isLoading}
            className="chat-input"
            rows={4}
          />
          <button
            className="btn-send"
            onClick={handleSend}
            disabled={!input.trim() || isLoading}
          >
            <i className="fas fa-arrow-up"></i>
          </button>
        </div>
        <div className="feature-cards">
          <button 
            className="feature-card"
            onClick={() => {
              setInput("Necesito un resumen sobre ");
              inputRef.current?.focus();
            }}
          >
            <div className="feature-icon summary">
              <i className="fas fa-file-alt"></i>
            </div>
            <span>Resúmenes</span>
          </button>
          <button 
            className="feature-card"
            onClick={() => {
              setInput("Créame un cuestionario sobre ");
              inputRef.current?.focus();
            }}
          >
            <div className="feature-icon quiz">
              <i className="fas fa-list-check"></i>
            </div>
            <span>Cuestionarios</span>
          </button>
          <button 
            className="feature-card"
            onClick={() => {
              setInput("Dame ejercicios prácticos sobre ");
              inputRef.current?.focus();
            }}
          >
            <div className="feature-icon exercises">
              <i className="fas fa-pen-to-square"></i>
            </div>
            <span>Ejercicios</span>
          </button>
        </div>
      </div>
    </div>
  );
}

function MessageBubble({ 
  message, 
  formatTime 
}: { 
  message: ChatMessage; 
  formatTime: (date: Date) => string;
}) {
  const isUser = message.role === "user";

  return (
    <div className={`message-wrapper ${isUser ? "user" : "ai"}`}>
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
      </div>
    </div>
  );
}
