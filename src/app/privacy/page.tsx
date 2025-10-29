import React from "react";

export default function PrivacyPage() {
    return (
        <main className="max-w-3xl mx-auto p-6">
            <h1 className="text-2xl font-semibold mb-4">Política de privacidad</h1>
            <p className="mb-4">En MentorIA nos tomamos la privacidad en serio. Esta es una plantilla de política de privacidad; adáptala y completa según tus prácticas y la legislación aplicable.</p>

            <section className="mb-4">
                <h2 className="font-semibold">1. Datos que recopilamos</h2>
                <p>Recopilamos información que nos proporcionas al registrarte (correo, nombre, rol) y datos de uso para mejorar el servicio.</p>
            </section>

            <section className="mb-4">
                <h2 className="font-semibold">2. Uso de los datos</h2>
                <p>Usamos los datos para autenticarte, personalizar contenidos y enviar notificaciones relacionadas con el servicio.</p>
            </section>

            <section className="mb-4">
                <h2 className="font-semibold">3. Seguridad</h2>
                <p>Adoptamos medidas razonables para proteger tus datos, pero recuerda no compartir credenciales con terceros.</p>
            </section>

            <p className="text-sm text-gray-600 mt-6">(Plantilla no vinculante. Consulta con un abogado o experto en protección de datos para una política completa y conforme a la ley.)</p>
        </main>
    );
}
