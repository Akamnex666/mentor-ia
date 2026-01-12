import { NextRequest, NextResponse } from "next/server";
import { analyzeText } from "../../../../lib/gemini";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { text, analysisType } = body;

    // Validaciones
    if (!text || typeof text !== "string") {
      return NextResponse.json(
        { success: false, error: "Se requiere texto para analizar" },
        { status: 400 }
      );
    }

    if (text.length > 50000) {
      return NextResponse.json(
        { success: false, error: "El texto es demasiado largo (máximo 50000 caracteres)" },
        { status: 400 }
      );
    }

    const validTypes = ["key_points", "difficulty", "topics", "questions"];
    if (!validTypes.includes(analysisType)) {
      return NextResponse.json(
        { success: false, error: `Tipo de análisis inválido. Tipos válidos: ${validTypes.join(", ")}` },
        { status: 400 }
      );
    }

    // Analizar texto
    const analysis = await analyzeText(text, analysisType);

    return NextResponse.json({
      success: true,
      data: {
        analysis,
        analysisType,
        textLength: text.length,
      },
    });

  } catch (error) {
    console.error("Error analizando texto:", error);
    
    const errorMessage = error instanceof Error ? error.message : "Error desconocido";
    
    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: 500 }
    );
  }
}
