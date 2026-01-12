import { NextRequest, NextResponse } from "next/server";
import { chatWithAI } from "../../../../lib/gemini";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { message, context, history } = body;

    // Validaciones
    if (!message || typeof message !== "string") {
      return NextResponse.json(
        { success: false, error: "Se requiere un mensaje" },
        { status: 400 }
      );
    }

    if (message.length > 10000) {
      return NextResponse.json(
        { success: false, error: "El mensaje es demasiado largo (máximo 10000 caracteres)" },
        { status: 400 }
      );
    }

    // Validar historial si existe
    const validHistory = Array.isArray(history) 
      ? history.filter(h => 
          h && 
          typeof h.role === "string" && 
          typeof h.content === "string" &&
          ["user", "model"].includes(h.role)
        ).slice(-10) // Limitar a últimos 10 mensajes
      : [];

    // Obtener respuesta del chat
    const response = await chatWithAI(message, context, validHistory);

    return NextResponse.json({
      success: true,
      data: {
        message: response,
        timestamp: new Date().toISOString(),
      },
    });

  } catch (error) {
    console.error("Error en chat:", error);
    
    const errorMessage = error instanceof Error ? error.message : "Error desconocido";
    
    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: 500 }
    );
  }
}
