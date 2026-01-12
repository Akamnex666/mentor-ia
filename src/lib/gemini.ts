import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from "@google/generative-ai";

// Configuración del cliente de Gemini
const apiKey = process.env.GEMINI_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY;

if (!apiKey && process.env.NODE_ENV === "development") {
  console.warn(
    "⚠️ GEMINI_API_KEY no está configurada. " +
    "Añade GEMINI_API_KEY a tu archivo .env para usar las funciones de IA."
  );
}

// Inicializar cliente de Gemini
const genAI = apiKey ? new GoogleGenerativeAI(apiKey) : null;

// Configuración de seguridad
const safetySettings = [
  {
    category: HarmCategory.HARM_CATEGORY_HARASSMENT,
    threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
  },
  {
    category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
    threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
  },
  {
    category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
    threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
  },
  {
    category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
    threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
  },
];

// Configuración de generación
const generationConfig = {
  temperature: 0.7,
  topK: 40,
  topP: 0.95,
  maxOutputTokens: 8192,
};

// Modelo principal - usar gemini-2.5-flash que es el modelo actual
export const getGeminiModel = (modelName: string = "gemini-2.5-flash") => {
  if (!genAI) {
    throw new Error("Gemini API no está configurada. Añade GEMINI_API_KEY a tu archivo .env");
  }
  
  return genAI.getGenerativeModel({
    model: modelName,
    safetySettings,
    generationConfig,
  });
};

// Modelo para chat/conversaciones
export const getGeminiChat = (modelName: string = "gemini-pro") => {
  const model = getGeminiModel(modelName);
  return model.startChat({
    history: [],
    generationConfig,
  });
};

// Tipos de contenido educativo
export type ContentType = "summary" | "quiz" | "material" | "explanation" | "exercises";

// Prompts del sistema para diferentes tipos de contenido
export const systemPrompts: Record<ContentType, string> = {
  summary: `Eres un experto educador especializado en crear resúmenes claros y concisos. 
Tu objetivo es:
- Extraer los puntos clave del tema
- Organizar la información de forma lógica
- Usar lenguaje claro y accesible
- Incluir ejemplos cuando sea apropiado
- Formato: usar títulos, subtítulos y viñetas
Responde siempre en español a menos que se indique lo contrario.`,

  quiz: `Eres un experto en evaluación educativa. Crea cuestionarios efectivos con:
- Preguntas variadas (opción múltiple, verdadero/falso, completar)
- Diferentes niveles de dificultad
- Retroalimentación para cada respuesta
- Formato JSON estructurado para fácil procesamiento
Responde siempre en español a menos que se indique lo contrario.`,

  material: `Eres un diseñador instruccional experto. Crea material didáctico que incluya:
- Objetivos de aprendizaje claros
- Contenido estructurado y progresivo
- Actividades prácticas
- Recursos adicionales sugeridos
- Consejos para el docente
Responde siempre en español a menos que se indique lo contrario.`,

  explanation: `Eres un tutor paciente y experto. Tu objetivo es:
- Explicar conceptos de forma clara y detallada
- Usar analogías y ejemplos del mundo real
- Anticipar preguntas comunes
- Adaptar el nivel de complejidad según el contexto
- Incluir pasos para conceptos complejos
Responde siempre en español a menos que se indique lo contrario.`,

  exercises: `Eres un experto en crear ejercicios prácticos educativos. Genera:
- Ejercicios de diferentes niveles de dificultad
- Problemas con contexto del mundo real
- Pasos de solución cuando sea apropiado
- Variaciones para práctica adicional
Responde siempre en español a menos que se indique lo contrario.`,
};

// Función para generar contenido
export async function generateContent(
  type: ContentType,
  topic: string,
  additionalContext?: string,
  language: string = "es"
): Promise<string> {
  const model = getGeminiModel();
  
  const languageInstruction = language === "es" 
    ? "Responde en español." 
    : language === "en" 
    ? "Respond in English." 
    : `Respond in ${language}.`;

  const prompt = `${systemPrompts[type]}

${languageInstruction}

Tema: ${topic}
${additionalContext ? `\nContexto adicional: ${additionalContext}` : ""}

Por favor, genera el contenido solicitado:`;

  const result = await model.generateContent(prompt);
  const response = await result.response;
  return response.text();
}

// Función para generar quiz estructurado
export interface QuizQuestion {
  id: number;
  question: string;
  type: "multiple_choice" | "true_false" | "fill_blank";
  options?: string[];
  correctAnswer: string | number;
  explanation: string;
  difficulty: "easy" | "medium" | "hard";
}

export interface Quiz {
  title: string;
  topic: string;
  totalQuestions: number;
  questions: QuizQuestion[];
}

export async function generateQuiz(
  topic: string,
  numQuestions: number = 5,
  difficulty: "easy" | "medium" | "hard" | "mixed" = "mixed",
  language: string = "es"
): Promise<Quiz> {
  const model = getGeminiModel();
  
  const prompt = `${systemPrompts.quiz}

Genera un cuestionario sobre: "${topic}"
Número de preguntas: ${numQuestions}
Dificultad: ${difficulty === "mixed" ? "variada (fácil, media, difícil)" : difficulty}
Idioma: ${language === "es" ? "Español" : language === "en" ? "English" : language}

IMPORTANTE: Responde ÚNICAMENTE con un JSON válido siguiendo este formato exacto:
{
  "title": "Título del Quiz",
  "topic": "${topic}",
  "totalQuestions": ${numQuestions},
  "questions": [
    {
      "id": 1,
      "question": "Texto de la pregunta",
      "type": "multiple_choice",
      "options": ["Opción A", "Opción B", "Opción C", "Opción D"],
      "correctAnswer": 0,
      "explanation": "Explicación de por qué es correcta",
      "difficulty": "easy"
    }
  ]
}

Para preguntas true_false, correctAnswer debe ser "true" o "false".
Para multiple_choice, correctAnswer es el índice (0-3) de la opción correcta.
Para fill_blank, correctAnswer es el texto que completa el espacio.`;

  const result = await model.generateContent(prompt);
  const response = await result.response;
  const text = response.text();
  
  // Extraer JSON de la respuesta
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new Error("No se pudo generar el quiz en formato correcto");
  }
  
  return JSON.parse(jsonMatch[0]) as Quiz;
}

// Función para chat educativo
export async function chatWithAI(
  message: string,
  context?: string,
  history?: { role: "user" | "model"; content: string }[]
): Promise<string> {
  const model = getGeminiModel();
  
  const systemContext = `Eres MentorIA, un asistente educativo inteligente y amigable. 
Tu objetivo es ayudar a estudiantes y educadores con:
- Explicaciones claras de conceptos
- Respuestas a dudas académicas
- Sugerencias de recursos de estudio
- Motivación y apoyo al aprendizaje

Sé amigable, paciente y adapta tu lenguaje al nivel del estudiante.
${context ? `\nContexto de la conversación: ${context}` : ""}`;

  const fullPrompt = history && history.length > 0
    ? `${systemContext}\n\nHistorial de conversación:\n${history.map(h => `${h.role === "user" ? "Usuario" : "MentorIA"}: ${h.content}`).join("\n")}\n\nUsuario: ${message}\n\nMentorIA:`
    : `${systemContext}\n\nUsuario: ${message}\n\nMentorIA:`;

  const result = await model.generateContent(fullPrompt);
  const response = await result.response;
  return response.text();
}

// Función para analizar texto/documento
export async function analyzeText(
  text: string,
  analysisType: "key_points" | "difficulty" | "topics" | "questions"
): Promise<string> {
  const model = getGeminiModel();
  
  const analysisPrompts: Record<string, string> = {
    key_points: "Extrae los puntos clave más importantes de este texto, organizados en una lista clara.",
    difficulty: "Analiza el nivel de dificultad de este texto (básico, intermedio, avanzado) y explica por qué.",
    topics: "Identifica los temas principales y subtemas tratados en este texto.",
    questions: "Genera 5 preguntas de comprensión que un estudiante debería poder responder después de leer este texto."
  };
  
  const prompt = `${analysisPrompts[analysisType]}

Texto a analizar:
"""
${text}
"""

Responde en español de forma clara y estructurada:`;

  const result = await model.generateContent(prompt);
  const response = await result.response;
  return response.text();
}

// Exportar cliente para uso avanzado
export { genAI };
