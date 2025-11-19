import dotenv from "dotenv";
import { GoogleGenerativeAI } from "@google/generative-ai";

dotenv.config();

/**
 * Servicio de generación de preguntas para lecturas.
 *
 * Diseño:
 * - Si hay GEMINI_API_KEY configurada, usa Gemini para generar preguntas reales.
 * - Si NO hay clave o hay un error en la llamada, usa un MOCK interno.
 *
 * La firma pública y la estructura de retorno se mantienen estables:
 *   generateReadingQuestions({ text, title, config? }) => {
 *     literal: Question[],
 *     inferential: Question[],
 *     critical: Question[]
 *   }
 */

/**
 * @typedef {"literal" | "inferential" | "critical"} QuestionLevel
 */

/**
 * @typedef {Object} Question
 * @property {string} id             Identificador interno de la pregunta
 * @property {QuestionLevel} level   Nivel de comprensión (literal, inferencial, crítico)
 * @property {string} prompt         Enunciado de la pregunta
 * @property {string} expectedAnswer Respuesta esperada (para revisión del docente / IA)
 */

/**
 * @typedef {Object} QuestionsByLevel
 * @property {Question[]} literal
 * @property {Question[]} inferential
 * @property {Question[]} critical
 */

/**
 * Config por defecto: cuántas preguntas generamos por nivel.
 */
const DEFAULT_CONFIG = Object.freeze({
  literal: 3,
  inferential: 3,
  critical: 6
});

const GEMINI_API_KEY = process.env.GEMINI_API_KEY || "";
const GEMINI_MODEL_NAME = process.env.GEMINI_MODEL_NAME || "gemini-2.0-flash";

let geminiClient = null;
let geminiModel = null;

if (GEMINI_API_KEY) {
  try {
    geminiClient = new GoogleGenerativeAI(GEMINI_API_KEY);
    geminiModel = geminiClient.getGenerativeModel({
      model: GEMINI_MODEL_NAME
    });
  } catch (err) {
    // Si algo falla en la inicialización, no matamos el proceso.
    // Simplemente dejamos geminiModel en null para que se use el mock.
    console.error("[AI Service] Error inicializando Gemini:", err?.message || err);
    geminiClient = null;
    geminiModel = null;
  }
}

/**
 * Genera ids simples.
 */
function buildQuestionId(level, index) {
  return `${level}-${index + 1}`;
}

/**
 * Genera preguntas MOCK a partir del título y un snippet del texto.
 */
function buildMockQuestions({ text, title = "Lectura", config = DEFAULT_CONFIG }) {
  const safeTitle = title || "Lectura";
  const safeSnippet = (text || "").slice(0, 160).replace(/\s+/g, " ").trim();

  const makeQuestions = (level, count, templateFn) => {
    return Array.from({ length: count }, (_, i) => ({
      id: buildQuestionId(level, i),
      level,
      prompt: templateFn(i),
      expectedAnswer: `Respuesta esperada de ejemplo para la pregunta ${
        i + 1
      } (${level}) sobre "${safeTitle}".`
    }));
  };

  return {
    literal: makeQuestions("literal", config.literal, (i) =>
      `Según el texto "${safeTitle}", identifica y describe un dato concreto o un hecho específico mencionado de forma explícita. (Pregunta literal ${
        i + 1
      })`
    ),
    inferential: makeQuestions("inferential", config.inferential, (i) =>
      `A partir de la información del texto "${safeTitle}"${
        safeSnippet ? ` (por ejemplo: "${safeSnippet}...")` : ""
      }, explica una idea o conclusión que no está dicha literalmente, pero que se puede deducir. (Pregunta inferencial ${
        i + 1
      })`
    ),
    critical: makeQuestions("critical", config.critical, (i) =>
      `Tomando como base el texto "${safeTitle}", formula una opinión crítica y argumentada sobre una postura, decisión o consecuencia presente en el contenido. Considera coherencia, impacto y posibles alternativas. (Pregunta crítica ${
        i + 1
      })`
    )
  };
}

/**
 * Parsea la respuesta de Gemini a nuestra estructura QuestionsByLevel.
 *
 * Aquí controlamos el FORMATO DE SALIDA que pediremos al modelo en el prompt.
 * Para simplificar y robustecer, le pedimos JSON directamente.
 */
function parseGeminiResponseToQuestions({ json, config }) {
  const { literal = [], inferential = [], critical = [] } = json || {};

  const normalizeLevelArray = (arr, levelKey, maxCount) => {
    if (!Array.isArray(arr)) return [];

    return arr
      .slice(0, maxCount)
      .map((q, index) => ({
        id: buildQuestionId(levelKey, index),
        level: levelKey,
        prompt: String(q.prompt || q.question || "").trim(),
        expectedAnswer: String(q.expectedAnswer || q.answer || "").trim()
      }))
      .filter((q) => q.prompt.length > 0);
  };

  return {
    literal: normalizeLevelArray(literal, "literal", config.literal),
    inferential: normalizeLevelArray(inferential, "inferential", config.inferential),
    critical: normalizeLevelArray(critical, "critical", config.critical)
  };
}

/**
 * Llama a Gemini para generar preguntas en formato JSON estructurado.
 *
 * IMPORTANTE:
 * - Aquí definimos el prompt en español.
 * - Obligamos al modelo a responder en JSON con campos claros.
 */
async function callGeminiForQuestions({ text, title, config }) {
  if (!geminiModel) {
    throw new Error("Gemini no está disponible (modelo no inicializado).");
  }

  const safeTitle = title || "Lectura";
  const trimmedText = text.slice(0, 8000); // Para no pasarnos de tokens a lo bestia

  const prompt = `
Eres un tutor experto en comprensión lectora y pensamiento crítico en español.

Recibirás el texto de una lectura y deberás generar preguntas de comprensión en tres niveles:
1) Literal
2) Inferencial
3) Crítico

REQUERIMIENTOS:

- Nivel LITERAL: 
  * Preguntas basadas en información explícita del texto.
  * El estudiante debe poder responder localizando datos directamente en el contenido.

- Nivel INFERENCIAL:
  * Preguntas que exijan deducir o interpretar ideas que no están dichas de forma explícita.
  * Relacionar partes del texto, leer entre líneas.

- Nivel CRÍTICO:
  * Preguntas que inviten a valorar, argumentar, cuestionar y opinar de forma fundamentada sobre el texto.
  * Considerar coherencia, intenciones del autor, impacto social, posibles sesgos, etc.
  * DA ESPECIAL ÉNFASIS A ESTE NIVEL (más preguntas críticas que de los otros niveles).

CANTIDAD DE PREGUNTAS (máximos):
- Literal: hasta ${config.literal} preguntas.
- Inferencial: hasta ${config.inferential} preguntas.
- Crítico: hasta ${config.critical} preguntas.

FORMATO DE RESPUESTA (MUY IMPORTANTE):
Responde ÚNICAMENTE en formato JSON válido, sin texto adicional, con la siguiente estructura:

{
  "literal": [
    { "prompt": "pregunta literal 1", "expectedAnswer": "respuesta esperada 1" }
  ],
  "inferential": [
    { "prompt": "pregunta inferencial 1", "expectedAnswer": "respuesta esperada 1" }
  ],
  "critical": [
    { "prompt": "pregunta crítica 1", "expectedAnswer": "respuesta esperada 1" }
  ]
}

NO incluyas comentarios, explicaciones, ni texto fuera del JSON.

TÍTULO DE LA LECTURA: "${safeTitle}"

TEXTO DE LA LECTURA (puede estar recortado si es muy largo):
"""${trimmedText}"""
`;

  const result = await geminiModel.generateContent({
    contents: [
      {
        role: "user",
        parts: [{ text: prompt }]
      }
    ]
  });

  const responseText = result?.response?.candidates?.[0]?.content?.parts?.[0]?.text || "";

  if (!responseText) {
    throw new Error("Respuesta vacía desde Gemini.");
  }

  let parsed;
  try {
    parsed = JSON.parse(responseText);
  } catch (err) {
    // A veces los modelos agregan texto extra. Intento de rescate mínimo:
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error("No se pudo parsear JSON desde la respuesta de Gemini.");
    }
    parsed = JSON.parse(jsonMatch[0]);
  }

  return parseGeminiResponseToQuestions({ json: parsed, config });
}

/**
 * Punto de entrada público del servicio de IA.
 *
 * @param {Object} params
 * @param {string} params.text  Texto plano de la lectura (ya extraído del PDF)
 * @param {string} [params.title] Título de la lectura (opcional, pero recomendado)
 * @param {Partial<typeof DEFAULT_CONFIG>} [params.config] Para ajustar cantidad de preguntas por nivel
 * @returns {Promise<QuestionsByLevel>}
 */
export async function generateReadingQuestions({ text, title, config } = {}) {
  const finalText = (text || "").trim();

  if (!finalText || finalText.length < 50) {
    throw new Error("Texto de lectura insuficiente para generar preguntas.");
  }

  const mergedConfig = {
    ...DEFAULT_CONFIG,
    ...(config || {})
  };

  // Si no hay API key, ni lo intentamos: usamos mock directo.
  if (!GEMINI_API_KEY) {
    console.warn("[AI Service] GEMINI_API_KEY no configurada. Usando preguntas MOCK.");
    return buildMockQuestions({ text: finalText, title, config: mergedConfig });
  }

  // Intentamos con Gemini. Si falla, fallback a mock.
  try {
    const questions = await callGeminiForQuestions({
      text: finalText,
      title,
      config: mergedConfig
    });

    // Si por algún motivo el modelo devolvió algo vacío, usamos mock.
    const totalQuestions =
      questions.literal.length + questions.inferential.length + questions.critical.length;

    if (totalQuestions === 0) {
      console.warn("[AI Service] Gemini devolvió 0 preguntas. Usando preguntas MOCK.");
      return buildMockQuestions({ text: finalText, title, config: mergedConfig });
    }

    return questions;
  } catch (err) {
    console.error("[AI Service] Error llamando a Gemini. Usando preguntas MOCK.", err?.message || err);
    return buildMockQuestions({ text: finalText, title, config: mergedConfig });
  }
}
