import { 
  AIContentType, 
  Quiz, 
  GenerateContentRequest, 
  GenerateQuizRequest,
  ChatRequest,
  AnalyzeTextRequest,
  AIResponse 
} from "../../../types/ai";

const API_BASE = "/api/ai";

/**
 * Servicio para interactuar con la API de Gemini AI
 */
export const aiService = {
  /**
   * Genera contenido educativo (resúmenes, materiales, explicaciones, ejercicios)
   */
  async generateContent(request: GenerateContentRequest): Promise<AIResponse<string>> {
    try {
      const response = await fetch(`${API_BASE}/generate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(request),
      });

      const data = await response.json();
      
      if (!response.ok) {
        return { success: false, error: data.error || "Error al generar contenido" };
      }

      return { success: true, data: data.data };
    } catch (error) {
      console.error("Error en generateContent:", error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : "Error de conexión" 
      };
    }
  },

  /**
   * Genera un quiz/cuestionario estructurado
   */
  async generateQuiz(request: GenerateQuizRequest): Promise<AIResponse<Quiz>> {
    try {
      const response = await fetch(`${API_BASE}/quiz`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(request),
      });

      const data = await response.json();
      
      if (!response.ok) {
        return { success: false, error: data.error || "Error al generar quiz" };
      }

      return { success: true, data: data.data };
    } catch (error) {
      console.error("Error en generateQuiz:", error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : "Error de conexión" 
      };
    }
  },

  /**
   * Chat con el asistente de IA
   */
  async chat(request: ChatRequest): Promise<AIResponse<{ message: string; timestamp: string }>> {
    try {
      const response = await fetch(`${API_BASE}/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(request),
      });

      const data = await response.json();
      
      if (!response.ok) {
        return { success: false, error: data.error || "Error en el chat" };
      }

      return { success: true, data: data.data };
    } catch (error) {
      console.error("Error en chat:", error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : "Error de conexión" 
      };
    }
  },

  /**
   * Analiza un texto (puntos clave, dificultad, temas, preguntas)
   */
  async analyzeText(request: AnalyzeTextRequest): Promise<AIResponse<{ analysis: string; analysisType: string }>> {
    try {
      const response = await fetch(`${API_BASE}/analyze`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(request),
      });

      const data = await response.json();
      
      if (!response.ok) {
        return { success: false, error: data.error || "Error al analizar texto" };
      }

      return { success: true, data: data.data };
    } catch (error) {
      console.error("Error en analyzeText:", error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : "Error de conexión" 
      };
    }
  },

  /**
   * Genera un resumen de un tema
   */
  async generateSummary(topic: string, additionalContext?: string, language?: string): Promise<AIResponse<string>> {
    return this.generateContent({
      type: "summary",
      topic,
      additionalContext,
      language,
    });
  },

  /**
   * Genera material didáctico
   */
  async generateMaterial(topic: string, additionalContext?: string, language?: string): Promise<AIResponse<string>> {
    return this.generateContent({
      type: "material",
      topic,
      additionalContext,
      language,
    });
  },

  /**
   * Genera una explicación detallada
   */
  async generateExplanation(topic: string, additionalContext?: string, language?: string): Promise<AIResponse<string>> {
    return this.generateContent({
      type: "explanation",
      topic,
      additionalContext,
      language,
    });
  },

  /**
   * Genera ejercicios prácticos
   */
  async generateExercises(topic: string, additionalContext?: string, language?: string): Promise<AIResponse<string>> {
    return this.generateContent({
      type: "exercises",
      topic,
      additionalContext,
      language,
    });
  },
};

export default aiService;
