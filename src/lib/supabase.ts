import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
    // Proporcionar un error claro en tiempo de ejecución para desarrollo
    // Esto evita silencios cuando las variables de entorno no están definidas.
    if (process.env.NODE_ENV === "development") {
        // Lanzar para que Next muestre el error en la consola/terminal
        throw new Error(
            "Faltan variables de entorno de Supabase: NEXT_PUBLIC_SUPABASE_URL y/o NEXT_PUBLIC_SUPABASE_ANON_KEY.\n" +
            "Comprueba tu archivo .env y reinicia el servidor."
        );
    }
}

export const supabase = createClient(supabaseUrl ?? "", supabaseAnonKey ?? "");