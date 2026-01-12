// Tipos para la integración de IA

// Tipos de contenido que puede generar la IA
export type AIContentType = "summary" | "quiz" | "material" | "explanation" | "exercises";

// Dificultad de los quizzes
export type QuizDifficulty = "easy" | "medium" | "hard" | "mixed";

// Tipo de pregunta en quiz
export type QuestionType = "multiple_choice" | "true_false" | "fill_blank";

// Estructura de una pregunta de quiz
export interface QuizQuestion {
  id: number;
  question: string;
  type: QuestionType;
  options?: string[];
  correctAnswer: string | number;
  explanation: string;
  difficulty: "easy" | "medium" | "hard";
}

// Estructura completa de un quiz
export interface Quiz {
  title: string;
  topic: string;
  totalQuestions: number;
  questions: QuizQuestion[];
}

// Request para generar contenido
export interface GenerateContentRequest {
  type: AIContentType;
  topic: string;
  additionalContext?: string;
  language?: string;
}

// Request para generar quiz
export interface GenerateQuizRequest {
  topic: string;
  numQuestions?: number;
  difficulty?: QuizDifficulty;
  language?: string;
}

// Request para chat
export interface ChatRequest {
  message: string;
  context?: string;
  history?: ChatMessage[];
}

// Mensaje de chat
export interface ChatMessage {
  role: "user" | "model";
  content: string;
  timestamp?: Date;
}

// Conversación de chat
export interface ChatConversation {
  id: string;
  title: string;
  messages: ChatMessage[];
  createdAt: Date;
  updatedAt: Date;
}

// Request para análisis de texto
export interface AnalyzeTextRequest {
  text: string;
  analysisType: "key_points" | "difficulty" | "topics" | "questions";
}

// Respuesta genérica de la API de IA
export interface AIResponse<T = string> {
  success: boolean;
  data?: T;
  error?: string;
}

// Estado de generación
export interface GenerationState {
  isLoading: boolean;
  error: string | null;
  result: string | null;
}

// Historial de generaciones
export interface GenerationHistory {
  id: string;
  type: AIContentType;
  topic: string;
  result: string;
  createdAt: Date;
  userId?: string;
}

// Configuración de la IA
export interface AIConfig {
  model: string;
  temperature: number;
  maxTokens: number;
  language: string;
}

// Estadísticas de uso
export interface AIUsageStats {
  totalGenerations: number;
  summariesGenerated: number;
  quizzesGenerated: number;
  materialsGenerated: number;
  chatMessages: number;
  lastUsed: Date;
}
