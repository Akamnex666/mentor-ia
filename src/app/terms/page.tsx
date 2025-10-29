import React from "react";

export default function TermsPage() {
  return (
    <main className="max-w-3xl mx-auto p-6">
      <h1 className="text-2xl font-semibold mb-4">Términos de uso</h1>
      <p className="mb-4">Estos son los términos de uso de la plataforma MentorIA. A continuación encontrarás una plantilla que debes adaptar a tu caso legal y local.</p>

      <section className="mb-4">
        <h2 className="font-semibold">1. Aceptación de los términos</h2>
        <p>Al usar la plataforma aceptas estos términos y las políticas aplicables.</p>
      </section>

      <section className="mb-4">
        <h2 className="font-semibold">2. Servicios</h2>
        <p>La plataforma ofrece generación de contenidos educativos con IA y herramientas asociadas.</p>
      </section>

      <section className="mb-4">
        <h2 className="font-semibold">3. Limitaciones y responsabilidad</h2>
        <p>La información y contenidos generados por IA deben revisarse por un profesional; no nos hacemos responsables por decisiones basadas únicamente en el contenido generado.</p>
      </section>

      <p className="text-sm text-gray-600 mt-6">(Esta es una plantilla. Consulta con un abogado para un texto legal completo y aplicable a tu jurisdicción.)</p>
    </main>
  );
}
