// src/backend/src/__tests__/lib/ai.service.test.js
import { generateReadingQuestions } from "../../lib/ai.service.js";

describe("AI Service: generateReadingQuestions (mock)", () => {
  const sampleText = `
    Este es un texto de ejemplo lo suficientemente largo como para que
    el servicio pueda generar preguntas sin lanzar error por longitud insuficiente.
    El contenido no importa demasiado en esta fase, solo la estructura.
  `;

  test("lanza error si el texto es muy corto", async () => {
    await expect(
      generateReadingQuestions({ text: "muy corto" })
    ).rejects.toThrow("Texto de lectura insuficiente");
  });

  test("devuelve preguntas separadas por nivel con la estructura esperada", async () => {
    const result = await generateReadingQuestions({
      text: sampleText,
      title: "Texto de prueba"
    });

    expect(result).toHaveProperty("literal");
    expect(result).toHaveProperty("inferential");
    expect(result).toHaveProperty("critical");

    expect(Array.isArray(result.literal)).toBe(true);
    expect(Array.isArray(result.inferential)).toBe(true);
    expect(Array.isArray(result.critical)).toBe(true);

    // Por defecto, 3 / 3 / 6
    expect(result.literal).toHaveLength(3);
    expect(result.inferential).toHaveLength(3);
    expect(result.critical).toHaveLength(6);

    // Chequeo básico de campos
    const sampleQuestion = result.critical[0];
    expect(sampleQuestion).toHaveProperty("id");
    expect(sampleQuestion).toHaveProperty("level", "critical");
    expect(sampleQuestion).toHaveProperty("prompt");
    expect(sampleQuestion).toHaveProperty("expectedAnswer");
  });

  test("permite ajustar la cantidad de preguntas por nivel vía config", async () => {
    const result = await generateReadingQuestions({
      text: sampleText,
      title: "Texto con config",
      config: {
        literal: 1,
        inferential: 2,
        critical: 4
      }
    });

    expect(result.literal).toHaveLength(1);
    expect(result.inferential).toHaveLength(2);
    expect(result.critical).toHaveLength(4);
  });
});
