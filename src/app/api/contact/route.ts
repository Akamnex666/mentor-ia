import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
    try {
        const { name, email, message } = await request.json();

        // Validación básica
        if (!name || !email || !message) {
            return NextResponse.json(
                { error: 'Todos los campos son requeridos' },
                { status: 400 }
            );
        }

        // Validar formato de email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return NextResponse.json(
                { error: 'Email inválido' },
                { status: 400 }
            );
        }

        // Aquí puedes:
        // 1. Guardar en base de datos
        // 2. Enviar email
        // 3. Guardar en archivo
        // Por ahora, simplemente guardamos en consola y respondemos exitosamente

        console.log('Nuevo mensaje de contacto:', {
            nombre: name,
            email: email,
            mensaje: message,
            timestamp: new Date().toISOString()
        });

        // Opción: Guardar en base de datos Supabase
        // const { createClient } = require('@supabase/supabase-js');
        // const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
        // const { error } = await supabase.from('contact_messages').insert([{ name, email, message }]);
        // if (error) throw error;

        // Opción: Enviar email (usando Resend, SendGrid, etc.)
        // await fetch('https://api.resend.com/emails', {
        //   method: 'POST',
        //   headers: {
        //     'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
        //     'Content-Type': 'application/json'
        //   },
        //   body: JSON.stringify({
        //     from: 'contacto@mentoria.com',
        //     to: email,
        //     subject: 'Hemos recibido tu mensaje',
        //     html: `<p>Hola ${name}, hemos recibido tu mensaje. Nos pondremos en contacto pronto.</p>`
        //   })
        // });

        return NextResponse.json(
            {
                success: true,
                message: 'Mensaje recibido correctamente. Nos pondremos en contacto pronto.'
            },
            { status: 200 }
        );

    } catch (error) {
        console.error('Error en contacto:', error);
        return NextResponse.json(
            { error: 'Error al procesar tu solicitud' },
            { status: 500 }
        );
    }
}
