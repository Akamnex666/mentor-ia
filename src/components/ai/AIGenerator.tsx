"use client";

import React, { useState, useEffect } from "react";
import { useAIGenerate, useAIQuiz } from "../../features/ai";
import { AIContentType, QuizDifficulty, Quiz, QuizQuestion } from "../../types/ai";

interface AIGeneratorProps {
  onContentGenerated?: (content: string, type: AIContentType) => void;
  onQuizGenerated?: (quiz: Quiz) => void;
  className?: string;
  defaultType?: "summary" | "quiz" | "material" | "explanation" | "exercises";
}

export default function AIGenerator({ 
  onContentGenerated, 
  onQuizGenerated,
  className = "",
  defaultType = "summary"
}: AIGeneratorProps) {
  const [activeType, setActiveType] = useState<AIContentType | "quiz">(defaultType);
  const [topic, setTopic] = useState("");
  const [additionalContext, setAdditionalContext] = useState("");
  const [numQuestions, setNumQuestions] = useState(5);
  const [difficulty, setDifficulty] = useState<QuizDifficulty>("mixed");
  
  const { isLoading: isGenerating, error: generateError, result, generate, reset } = useAIGenerate();
  const { isLoading: isQuizLoading, error: quizError, quiz, generateQuiz, reset: resetQuiz } = useAIQuiz();

  useEffect(() => {
    setActiveType(defaultType);
  }, [defaultType]);

  const isLoading = isGenerating || isQuizLoading;
  const error = generateError || quizError;

  const contentTypes = [
    { id: "summary" as const, label: "Resumen", icon: "fa-file-alt" },
    { id: "quiz" as const, label: "Cuestionario", icon: "fa-question-circle" },
    { id: "material" as const, label: "Material", icon: "fa-book" },
    { id: "explanation" as const, label: "Explicación", icon: "fa-lightbulb" },
    { id: "exercises" as const, label: "Ejercicios", icon: "fa-tasks" },
  ];

  const handleGenerate = async () => {
    if (!topic.trim()) return;

    if (activeType === "quiz") {
      const generatedQuiz = await generateQuiz(topic, numQuestions, difficulty);
      if (generatedQuiz && onQuizGenerated) {
        onQuizGenerated(generatedQuiz);
      }
    } else {
      const content = await generate(activeType, topic, additionalContext || undefined);
      if (content && onContentGenerated) {
        onContentGenerated(content, activeType);
      }
    }
  };

  const handleReset = () => {
    setTopic("");
    setAdditionalContext("");
    reset();
    resetQuiz();
  };

  return (
    <div className={className}>
      {/* Selector de tipo */}
      <div style={{
        display: "flex",
        gap: "0.75rem",
        flexWrap: "wrap",
        marginBottom: "1.5rem"
      }}>
        {contentTypes.map((type) => (
          <button
            key={type.id}
            onClick={() => setActiveType(type.id)}
            disabled={isLoading}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
              padding: "0.75rem 1.25rem",
              border: activeType === type.id ? "none" : "2px solid #e2e8f0",
              borderRadius: "12px",
              background: activeType === type.id 
                ? "linear-gradient(135deg, #667eea 0%, #764ba2 100%)" 
                : "white",
              color: activeType === type.id ? "white" : "#64748b",
              fontWeight: 600,
              fontSize: "0.9rem",
              cursor: isLoading ? "not-allowed" : "pointer",
              opacity: isLoading ? 0.6 : 1,
              transition: "all 0.2s ease",
              boxShadow: activeType === type.id 
                ? "0 4px 15px rgba(102, 126, 234, 0.3)" 
                : "none"
            }}
          >
            <i className={`fas ${type.icon}`}></i>
            <span>{type.label}</span>
          </button>
        ))}
      </div>

      {/* Formulario */}
      <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
        {/* Campo Tema */}
        <div>
          <label style={{
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
            marginBottom: "0.5rem",
            fontWeight: 600,
            color: "#374151",
            fontSize: "0.95rem"
          }}>
            <i className="fas fa-tag" style={{ color: "#667eea" }}></i>
            Tema o contenido
          </label>
          <input
            type="text"
            placeholder="Ej: La fotosíntesis, Ecuaciones de segundo grado, Historia de Roma..."
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            disabled={isLoading}
            style={{
              width: "100%",
              padding: "1rem 1.25rem",
              border: "2px solid #e2e8f0",
              borderRadius: "12px",
              fontSize: "1rem",
              transition: "all 0.2s ease",
              outline: "none",
              boxSizing: "border-box"
            }}
            onFocus={(e) => e.target.style.borderColor = "#667eea"}
            onBlur={(e) => e.target.style.borderColor = "#e2e8f0"}
          />
        </div>

        {/* Opciones de Quiz */}
        {activeType === "quiz" && (
          <div style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "1rem",
            padding: "1.25rem",
            background: "#f8fafc",
            borderRadius: "12px",
            border: "1px solid #e2e8f0"
          }}>
            <div>
              <label style={{
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
                marginBottom: "0.5rem",
                fontWeight: 600,
                color: "#374151",
                fontSize: "0.9rem"
              }}>
                <i className="fas fa-list-ol" style={{ color: "#8b5cf6" }}></i>
                Número de preguntas
              </label>
              <input
                type="number"
                min={1}
                max={20}
                value={numQuestions}
                onChange={(e) => setNumQuestions(Number(e.target.value))}
                disabled={isLoading}
                style={{
                  width: "100%",
                  padding: "0.75rem 1rem",
                  border: "2px solid #e2e8f0",
                  borderRadius: "10px",
                  fontSize: "1rem",
                  background: "white",
                  boxSizing: "border-box"
                }}
              />
            </div>
            <div>
              <label style={{
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
                marginBottom: "0.5rem",
                fontWeight: 600,
                color: "#374151",
                fontSize: "0.9rem"
              }}>
                <i className="fas fa-signal" style={{ color: "#8b5cf6" }}></i>
                Dificultad
              </label>
              <select
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value as QuizDifficulty)}
                disabled={isLoading}
                style={{
                  width: "100%",
                  padding: "0.75rem 1rem",
                  border: "2px solid #e2e8f0",
                  borderRadius: "10px",
                  fontSize: "1rem",
                  background: "white",
                  cursor: "pointer",
                  boxSizing: "border-box"
                }}
              >
                <option value="mixed">Variada</option>
                <option value="easy">Fácil</option>
                <option value="medium">Media</option>
                <option value="hard">Difícil</option>
              </select>
            </div>
          </div>
        )}

        {/* Contexto adicional (no para quiz) */}
        {activeType !== "quiz" && (
          <div>
            <label style={{
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
              marginBottom: "0.5rem",
              fontWeight: 600,
              color: "#374151",
              fontSize: "0.95rem"
            }}>
              <i className="fas fa-info-circle" style={{ color: "#06b6d4" }}></i>
              Contexto adicional (opcional)
            </label>
            <textarea
              placeholder="Nivel educativo, enfoque específico, extensión deseada..."
              value={additionalContext}
              onChange={(e) => setAdditionalContext(e.target.value)}
              disabled={isLoading}
              rows={3}
              style={{
                width: "100%",
                padding: "1rem 1.25rem",
                border: "2px solid #e2e8f0",
                borderRadius: "12px",
                fontSize: "1rem",
                resize: "vertical",
                fontFamily: "inherit",
                boxSizing: "border-box"
              }}
            />
          </div>
        )}

        {/* Botón Generar */}
        <button
          onClick={handleGenerate}
          disabled={isLoading || !topic.trim()}
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "0.75rem",
            padding: "1rem 2rem",
            background: isLoading || !topic.trim() 
              ? "#cbd5e1" 
              : "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
            border: "none",
            borderRadius: "12px",
            color: "white",
            fontSize: "1.1rem",
            fontWeight: 700,
            cursor: isLoading || !topic.trim() ? "not-allowed" : "pointer",
            transition: "all 0.3s ease",
            boxShadow: isLoading || !topic.trim() 
              ? "none" 
              : "0 4px 20px rgba(102, 126, 234, 0.4)"
          }}
        >
          {isLoading ? (
            <>
              <i className="fas fa-spinner fa-spin"></i>
              Generando con IA...
            </>
          ) : (
            <>
              <i className="fas fa-magic"></i>
              Generar {contentTypes.find(t => t.id === activeType)?.label}
            </>
          )}
        </button>
      </div>

      {/* Error */}
      {error && (
        <div style={{
          marginTop: "1.5rem",
          padding: "1rem 1.25rem",
          background: "linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%)",
          border: "1px solid #fecaca",
          borderRadius: "12px",
          display: "flex",
          alignItems: "flex-start",
          gap: "0.75rem"
        }}>
          <i className="fas fa-exclamation-triangle" style={{ color: "#dc2626", marginTop: "2px" }}></i>
          <div>
            <p style={{ margin: 0, color: "#dc2626", fontWeight: 600 }}>Error al generar</p>
            <p style={{ margin: "0.25rem 0 0 0", color: "#7f1d1d", fontSize: "0.9rem" }}>{error}</p>
          </div>
        </div>
      )}

      {/* Resultado */}
      {(result || quiz) && (
        <div style={{
          marginTop: "1.5rem",
          border: "1px solid #e2e8f0",
          borderRadius: "16px",
          overflow: "hidden",
          boxShadow: "0 4px 20px rgba(0, 0, 0, 0.05)"
        }}>
          {/* Header del resultado */}
          <div style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            padding: "1rem 1.5rem",
            background: "linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%)",
            borderBottom: "1px solid #a7f3d0",
            flexWrap: "wrap",
            gap: "1rem"
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
              <div style={{
                width: "36px",
                height: "36px",
                background: "#10b981",
                borderRadius: "10px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center"
              }}>
                <i className="fas fa-check" style={{ color: "white" }}></i>
              </div>
              <div>
                <h3 style={{ margin: 0, color: "#065f46", fontSize: "1rem", fontWeight: 700 }}>
                  ¡Contenido Generado!
                </h3>
                <p style={{ margin: 0, color: "#047857", fontSize: "0.85rem" }}>
                  {activeType === "quiz" ? `${quiz?.totalQuestions} preguntas creadas` : "Listo para usar"}
                </p>
              </div>
            </div>
            <div style={{ display: "flex", gap: "0.5rem" }}>
              <button
                onClick={() => {
                  const textToCopy = result || JSON.stringify(quiz, null, 2);
                  navigator.clipboard.writeText(textToCopy);
                }}
                title="Copiar"
                style={{
                  padding: "0.5rem 0.75rem",
                  background: "white",
                  border: "1px solid #d1d5db",
                  borderRadius: "8px",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: "0.4rem",
                  color: "#374151",
                  fontSize: "0.85rem"
                }}
              >
                <i className="fas fa-copy"></i>
                Copiar
              </button>
              <button
                onClick={handleReset}
                title="Nueva generación"
                style={{
                  padding: "0.5rem 0.75rem",
                  background: "#667eea",
                  border: "none",
                  borderRadius: "8px",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: "0.4rem",
                  color: "white",
                  fontSize: "0.85rem"
                }}
              >
                <i className="fas fa-redo"></i>
                Nuevo
              </button>
            </div>
          </div>

          {/* Contenido del resultado */}
          <div style={{
            padding: "1.5rem",
            maxHeight: "500px",
            overflowY: "auto",
            background: "white"
          }}>
            {activeType === "quiz" && quiz ? (
              <QuizResult quiz={quiz} />
            ) : (
              <div 
                style={{ 
                  lineHeight: 1.8, 
                  color: "#374151",
                  fontSize: "1rem"
                }}
                dangerouslySetInnerHTML={{ __html: formatMarkdown(result || "") }} 
              />
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// Componente para mostrar el resultado del quiz
function QuizResult({ quiz }: { quiz: Quiz }) {
  return (
    <div>
      <div style={{
        textAlign: "center",
        paddingBottom: "1.5rem",
        marginBottom: "1.5rem",
        borderBottom: "2px solid #f1f5f9"
      }}>
        <h3 style={{ margin: "0 0 0.5rem 0", color: "#1f2937", fontSize: "1.25rem" }}>
          {quiz.title}
        </h3>
        <p style={{ margin: 0, color: "#6b7280" }}>
          {quiz.totalQuestions} preguntas sobre {quiz.topic}
        </p>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
        {quiz.questions.map((question, index) => (
          <QuizQuestionCard key={question.id} question={question} index={index} />
        ))}
      </div>
    </div>
  );
}

// Componente para cada pregunta
function QuizQuestionCard({ question, index }: { question: QuizQuestion; index: number }) {
  const [showAnswer, setShowAnswer] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState<number | string | null>(null);

  const difficultyConfig = {
    easy: { bg: "#dcfce7", text: "#166534", label: "Fácil" },
    medium: { bg: "#fef3c7", text: "#92400e", label: "Media" },
    hard: { bg: "#fecaca", text: "#dc2626", label: "Difícil" },
  };

  const config = difficultyConfig[question.difficulty];
  const isCorrect = selectedAnswer === question.correctAnswer;

  return (
    <div style={{
      background: "#f8fafc",
      borderRadius: "12px",
      padding: "1.25rem",
      border: "1px solid #e2e8f0"
    }}>
      {/* Header de pregunta */}
      <div style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: "1rem"
      }}>
        <span style={{ fontWeight: 700, color: "#667eea", fontSize: "0.9rem" }}>
          Pregunta {index + 1}
        </span>
        <span style={{
          padding: "0.25rem 0.75rem",
          background: config.bg,
          color: config.text,
          borderRadius: "20px",
          fontSize: "0.75rem",
          fontWeight: 600
        }}>
          {config.label}
        </span>
      </div>

      {/* Texto de la pregunta */}
      <p style={{
        margin: "0 0 1rem 0",
        color: "#1f2937",
        fontSize: "1rem",
        lineHeight: 1.5,
        fontWeight: 500
      }}>
        {question.question}
      </p>

      {/* Opciones */}
      {question.type === "multiple_choice" && question.options && (
        <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", marginBottom: "1rem" }}>
          {question.options.map((option, optIndex) => {
            const isSelected = selectedAnswer === optIndex;
            const isCorrectOption = optIndex === question.correctAnswer;
            
            let bg = "white";
            let border = "2px solid #e2e8f0";
            
            if (showAnswer && isCorrectOption) {
              bg = "#f0fdf4";
              border = "2px solid #22c55e";
            } else if (showAnswer && isSelected && !isCorrectOption) {
              bg = "#fef2f2";
              border = "2px solid #ef4444";
            } else if (isSelected) {
              bg = "#f0f4ff";
              border = "2px solid #667eea";
            }

            return (
              <button
                key={optIndex}
                onClick={() => !showAnswer && setSelectedAnswer(optIndex)}
                disabled={showAnswer}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.75rem",
                  padding: "0.875rem 1rem",
                  background: bg,
                  border: border,
                  borderRadius: "10px",
                  cursor: showAnswer ? "default" : "pointer",
                  textAlign: "left",
                  fontSize: "0.95rem",
                  transition: "all 0.2s ease"
                }}
              >
                <span style={{
                  width: "28px",
                  height: "28px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  background: isSelected ? "#667eea" : "#e2e8f0",
                  color: isSelected ? "white" : "#64748b",
                  borderRadius: "50%",
                  fontWeight: 700,
                  fontSize: "0.85rem",
                  flexShrink: 0
                }}>
                  {String.fromCharCode(65 + optIndex)}
                </span>
                <span style={{ color: "#374151" }}>{option}</span>
              </button>
            );
          })}
        </div>
      )}

      {/* Botón verificar */}
      {!showAnswer && (
        <button
          onClick={() => setShowAnswer(true)}
          disabled={selectedAnswer === null}
          style={{
            padding: "0.625rem 1.25rem",
            background: selectedAnswer === null ? "#cbd5e1" : "#667eea",
            color: "white",
            border: "none",
            borderRadius: "8px",
            cursor: selectedAnswer === null ? "not-allowed" : "pointer",
            fontWeight: 600,
            fontSize: "0.9rem",
            display: "flex",
            alignItems: "center",
            gap: "0.5rem"
          }}
        >
          <i className="fas fa-check"></i>
          Verificar respuesta
        </button>
      )}

      {/* Feedback */}
      {showAnswer && (
        <div style={{
          marginTop: "1rem",
          padding: "1rem",
          background: isCorrect ? "#f0fdf4" : "#fef2f2",
          border: `1px solid ${isCorrect ? "#bbf7d0" : "#fecaca"}`,
          borderRadius: "10px"
        }}>
          <div style={{
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
            marginBottom: "0.5rem"
          }}>
            <i 
              className={`fas ${isCorrect ? "fa-check-circle" : "fa-times-circle"}`}
              style={{ color: isCorrect ? "#22c55e" : "#ef4444" }}
            ></i>
            <span style={{ fontWeight: 700, color: isCorrect ? "#166534" : "#dc2626" }}>
              {isCorrect ? "¡Correcto!" : "Incorrecto"}
            </span>
          </div>
          <p style={{ margin: 0, color: "#4b5563", fontSize: "0.9rem", lineHeight: 1.5 }}>
            {question.explanation}
          </p>
        </div>
      )}
    </div>
  );
}

// Formatear markdown a HTML
function formatMarkdown(text: string): string {
  return text
    .replace(/^### (.*$)/gim, '<h3 style="margin: 1.5rem 0 0.75rem; color: #1f2937; font-size: 1.1rem; font-weight: 700;">$1</h3>')
    .replace(/^## (.*$)/gim, '<h2 style="margin: 1.5rem 0 0.75rem; color: #1f2937; font-size: 1.25rem; font-weight: 700;">$1</h2>')
    .replace(/^# (.*$)/gim, '<h1 style="margin: 1.5rem 0 0.75rem; color: #1f2937; font-size: 1.4rem; font-weight: 700;">$1</h1>')
    .replace(/\*\*(.*?)\*\*/gim, '<strong style="color: #1f2937;">$1</strong>')
    .replace(/\*(.*?)\*/gim, '<em>$1</em>')
    .replace(/^\- (.*$)/gim, '<li style="margin: 0.25rem 0; margin-left: 1.5rem;">$1</li>')
    .replace(/^\* (.*$)/gim, '<li style="margin: 0.25rem 0; margin-left: 1.5rem;">$1</li>')
    .replace(/^\d+\. (.*$)/gim, '<li style="margin: 0.25rem 0; margin-left: 1.5rem;">$1</li>')
    .replace(/\n/gim, '<br>');
}
