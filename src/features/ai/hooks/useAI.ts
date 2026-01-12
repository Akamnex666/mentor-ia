"use client";

import { useState, useCallback } from "react";
import { aiService } from "../services/aiService";
import { 
  AIContentType, 
  Quiz, 
  QuizDifficulty,
  ChatMessage,
  GenerationState 
} from "../../../types/ai";

/**
 * Hook para generar contenido educativo con IA
 */
export function useAIGenerate() {
  const [state, setState] = useState<GenerationState>({
    isLoading: false,
    error: null,
    result: null,
  });

  const generate = useCallback(async (
    type: AIContentType,
    topic: string,
    additionalContext?: string,
    language?: string
  ) => {
    setState({ isLoading: true, error: null, result: null });

    try {
      const response = await aiService.generateContent({
        type,
        topic,
        additionalContext,
        language,
      });

      if (response.success && response.data) {
        setState({ isLoading: false, error: null, result: response.data });
        return response.data;
      } else {
        setState({ isLoading: false, error: response.error || "Error desconocido", result: null });
        return null;
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Error al generar contenido";
      setState({ isLoading: false, error: errorMessage, result: null });
      return null;
    }
  }, []);

  const reset = useCallback(() => {
    setState({ isLoading: false, error: null, result: null });
  }, []);

  return {
    ...state,
    generate,
    reset,
    generateSummary: (topic: string, context?: string, lang?: string) => 
      generate("summary", topic, context, lang),
    generateMaterial: (topic: string, context?: string, lang?: string) => 
      generate("material", topic, context, lang),
    generateExplanation: (topic: string, context?: string, lang?: string) => 
      generate("explanation", topic, context, lang),
    generateExercises: (topic: string, context?: string, lang?: string) => 
      generate("exercises", topic, context, lang),
  };
}

/**
 * Hook para generar quizzes
 */
export function useAIQuiz() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [quiz, setQuiz] = useState<Quiz | null>(null);

  const generateQuiz = useCallback(async (
    topic: string,
    numQuestions?: number,
    difficulty?: QuizDifficulty,
    language?: string
  ) => {
    setIsLoading(true);
    setError(null);
    setQuiz(null);

    try {
      const response = await aiService.generateQuiz({
        topic,
        numQuestions,
        difficulty,
        language,
      });

      if (response.success && response.data) {
        setQuiz(response.data);
        setIsLoading(false);
        return response.data;
      } else {
        setError(response.error || "Error al generar quiz");
        setIsLoading(false);
        return null;
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Error al generar quiz";
      setError(errorMessage);
      setIsLoading(false);
      return null;
    }
  }, []);

  const reset = useCallback(() => {
    setIsLoading(false);
    setError(null);
    setQuiz(null);
  }, []);

  return {
    isLoading,
    error,
    quiz,
    generateQuiz,
    reset,
  };
}

/**
 * Hook para chat con IA
 */
export function useAIChat() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);

  const sendMessage = useCallback(async (
    message: string,
    context?: string
  ) => {
    setIsLoading(true);
    setError(null);

    // Agregar mensaje del usuario
    const userMessage: ChatMessage = {
      role: "user",
      content: message,
      timestamp: new Date(),
    };
    
    setMessages(prev => [...prev, userMessage]);

    try {
      const response = await aiService.chat({
        message,
        context,
        history: messages.map(m => ({ role: m.role, content: m.content })),
      });

      if (response.success && response.data) {
        const aiMessage: ChatMessage = {
          role: "model",
          content: response.data.message,
          timestamp: new Date(response.data.timestamp),
        };
        setMessages(prev => [...prev, aiMessage]);
        setIsLoading(false);
        return aiMessage;
      } else {
        setError(response.error || "Error en el chat");
        setIsLoading(false);
        return null;
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Error en el chat";
      setError(errorMessage);
      setIsLoading(false);
      return null;
    }
  }, [messages]);

  const clearChat = useCallback(() => {
    setMessages([]);
    setError(null);
  }, []);

  return {
    isLoading,
    error,
    messages,
    sendMessage,
    clearChat,
  };
}

/**
 * Hook para analizar texto
 */
export function useAIAnalyze() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<string | null>(null);

  const analyze = useCallback(async (
    text: string,
    analysisType: "key_points" | "difficulty" | "topics" | "questions"
  ) => {
    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await aiService.analyzeText({
        text,
        analysisType,
      });

      if (response.success && response.data) {
        setResult(response.data.analysis);
        setIsLoading(false);
        return response.data.analysis;
      } else {
        setError(response.error || "Error al analizar");
        setIsLoading(false);
        return null;
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Error al analizar";
      setError(errorMessage);
      setIsLoading(false);
      return null;
    }
  }, []);

  const reset = useCallback(() => {
    setIsLoading(false);
    setError(null);
    setResult(null);
  }, []);

  return {
    isLoading,
    error,
    result,
    analyze,
    analyzeKeyPoints: (text: string) => analyze(text, "key_points"),
    analyzeDifficulty: (text: string) => analyze(text, "difficulty"),
    analyzeTopics: (text: string) => analyze(text, "topics"),
    generateQuestions: (text: string) => analyze(text, "questions"),
    reset,
  };
}
