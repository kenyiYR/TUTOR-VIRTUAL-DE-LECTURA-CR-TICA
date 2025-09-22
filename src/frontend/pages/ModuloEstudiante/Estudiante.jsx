import React from "react";

function Estudiante() {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-blue-700">Módulo Estudiante</h2>
      <ul className="list-disc list-inside text-gray-700 space-y-2">
        <li>📘 Textos sugeridos</li>
        <li>✍️ Subida de texto propio</li>
        <li>🤖 Análisis crítico con IA (preguntas y detección de sesgos)</li>
        <li>📊 Resultados y retroalimentación (puntajes y progreso histórico)</li>
        <li>🏆 Gamificación: insignias y ranking</li>
      </ul>
    </div>
  );
}

export default Estudiante;
