import { NextRequest, NextResponse } from "next/server";
import { generateContent, ContentType } from "../../../../lib/gemini";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { type, topic, additionalContext, language } = body;

    // Validaciones
    if (!type || !topic) {
      return NextResponse.json(
        { success: false, error: "Se requiere tipo y tema" },
        { status: 400 }
      );
    }

    const validTypes: ContentType[] = ["summary", "quiz", "material", "explanation", "exercises"];
    if (!validTypes.includes(type)) {
      return NextResponse.json(
        { success: false, error: `Tipo inválido. Tipos válidos: ${validTypes.join(", ")}` },
        { status: 400 }
      );
    }

    // Generar contenido
    const content = await generateContent(
      type as ContentType,
      topic,
      additionalContext,
      language || "es"
    );

    return NextResponse.json({
      success: true,
      data: content,
      type,
      topic,
    });

  } catch (error) {
    console.error("Error generando contenido:", error);
    
    const errorMessage = error instanceof Error ? error.message : "Error desconocido";
    
    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: 500 }
    );
  }
}
