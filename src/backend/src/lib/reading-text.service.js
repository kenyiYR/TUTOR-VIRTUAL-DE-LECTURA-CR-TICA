// src/backend/src/lib/reading-text.service.js

/**
 * Servicio para obtener el texto "base" de una lectura.
 *
 * Versión simplificada:
 * - NO usa pdf-parse ni descarga el PDF.
 * - Construye un texto sintético a partir de:
 *    - título
 *    - descripción
 *    - metadatos (bucket, path)
 *
 * Con esto:
 * - Evitamos problemas de bindings nativos en Docker.
 * - La IA puede generar preguntas igual (literal / inferencial / crítico)
 *   basadas en el tema de la lectura.
 */

/**
 * @param {import("../models/Reading.js").default | any} reading
 * @returns {Promise<string>}
 */
export async function getReadingText(reading) {
  if (!reading) {
    throw new Error("Lectura requerida para extraer texto.");
  }

  const titulo = reading.titulo || "Lectura sin título";
  const descripcion = reading.descripcion || "";
  const bucket = reading.bucket || "lecturas";
  const path = reading.objectPath || "(sin ruta)";

  const parts = [
    `Texto de trabajo para el tutor virtual basado en la lectura titulada "${titulo}".`,
    descripcion
      ? `Descripción proporcionada por el docente: ${descripcion}.`
      : "El docente no proporcionó una descripción detallada, por lo que se asume que la lectura desarrolla esta temática de forma general.",
    `El archivo original asociado a esta lectura está almacenado en el bucket "${bucket}" con la ruta "${path}".`,
    "Este texto sirve como base para que la IA genere preguntas de comprensión lectora en niveles literal, inferencial y crítico sobre el contenido y la temática principal de la lectura."
  ].filter(Boolean);

  let text = parts.join(" ");

  // Aseguramos que tenga algo de cuerpo para que la IA no se queje
  if (text.length < 200) {
    text = text.padEnd(200, " contenido adicional de contexto.");
  }

  return text;
}
