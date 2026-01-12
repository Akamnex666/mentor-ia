import { NextRequest, NextResponse } from "next/server";
import { generateQuiz } from "../../../../lib/gemini";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { topic, numQuestions, difficulty, language } = body;

    // Validaciones
    if (!topic) {
      return NextResponse.json(
        { success: false, error: "Se requiere un tema para el quiz" },
        { status: 400 }
      );
    }

    const questionsCount = Math.min(Math.max(numQuestions || 5, 1), 20);
    const validDifficulties = ["easy", "medium", "hard", "mixed"];
    const quizDifficulty = validDifficulties.includes(difficulty) ? difficulty : "mixed";

    // Generar quiz
    const quiz = await generateQuiz(
      topic,
      questionsCount,
      quizDifficulty,
      language || "es"
    );

    return NextResponse.json({
      success: true,
      data: quiz,
    });

  } catch (error) {
    console.error("Error generando quiz:", error);
    
    const errorMessage = error instanceof Error ? error.message : "Error desconocido";
    
    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: 500 }
    );
  }
}
