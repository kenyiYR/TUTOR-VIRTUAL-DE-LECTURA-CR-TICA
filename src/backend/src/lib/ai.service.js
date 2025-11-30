import dotenv from "dotenv";
import { GoogleGenerativeAI } from "@google/generative-ai";

dotenv.config();

/**
 * Tipos y estructuras
 *
 * @typedef {"literal" | "inferential" | "critical"} QuestionLevel
 *
 * @typedef {Object} Question
 * @property {string} id
 * @property {QuestionLevel} level
 * @property {string} prompt
 * @property {string} expectedAnswer
 *
 * @typedef {Object} QuestionsByLevel
 * @property {Question[]} literal
 * @property {Question[]} inferential
 * @property {Question[]} critical
 */

/**
 * Config por defecto: los tests esperan 3 / 3 / 6.
 */
const DEFAULT_CONFIG = Object.freeze({
  literal: 3,
  inferential: 3,
  critical: 6,
});

const GEMINI_API_KEY = process.env.GEMINI_API_KEY || "";
const GEMINI_MODEL_NAME = process.env.GEMINI_MODEL_NAME || "gemini-2.0-flash";
const IS_TEST_ENV = process.env.NODE_ENV === "test";

let geminiClient = null;
let geminiModel = null;

if (GEMINI_API_KEY) {
  try {
    geminiClient = new GoogleGenerativeAI(GEMINI_API_KEY);
    geminiModel = geminiClient.getGenerativeModel({
      model: GEMINI_MODEL_NAME,
    });
  } catch (err) {
    // Si algo falla en la inicialización, no rompemos todo.
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
 * MOCK de preguntas: respeta siempre los tamaños de `config`.
 */
function buildMockQuestions({ text, title = "Lectura", config = DEFAULT_CONFIG }) {
  const safeTitle = title || "Lectura";
  const safeSnippet = (text || "").slice(0, 220).replace(/\s+/g, " ").trim();

  const makeQuestions = (level, count, templateFn) =>
    Array.from({ length: count }, (_, i) => ({
      id: buildQuestionId(level, i),
      level,
      prompt: templateFn(i),
      expectedAnswer: `Respuesta esperada de ejemplo para la pregunta ${
        i + 1
      } (${level}) sobre "${safeTitle}".`,
    }));

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
    critical: makeQuestions("critical", config.critical, (i) => {
      if (i % 2 === 0) {
        return `Tomando como base el texto "${safeTitle}", emite una opinión crítica y argumentada sobre una postura o conclusión del autor. Evalúa su coherencia y los argumentos que usa. (Pregunta crítica ${
          i + 1
        })`;
      }
      return `Revisa el texto "${safeTitle}"${
        safeSnippet ? ` (por ejemplo: "${safeSnippet}...")` : ""
      } e identifica si existe algún posible SESGO o FALACIA argumentativa. Describe el fragmento problemático y justifica por qué podría considerarse un sesgo o falacia. (Pregunta crítica centrada en sesgos/falacias ${
        i + 1
      })`;
    }),
  };
}

/**
 * Feedback MOCK para respuestas de estudiantes.
 */
function buildMockFeedback({ level, studentAnswer }) {
  const trimmed = (studentAnswer || "").trim();

  if (!trimmed) {
    return {
      score: 0,
      verdict: "sin_respuesta",
      feedback:
        "No escribiste una respuesta. Intenta responder con tus propias palabras para poder darte retroalimentación.",
    };
  }

  let score = 60;
  let verdict = "parcial";
  let extra = "";

  if (trimmed.length < 25) {
    score = 40;
    verdict = "muy_breve";
    extra = "Tu respuesta es muy corta. Desarrolla un poco más tus ideas.";
  } else if (trimmed.length > 300) {
    score = 70;
    verdict = "extensa";
    extra = "Tu respuesta es detallada, pero podrías organizar mejor tus ideas.";
  } else {
    score = 75;
    verdict = "aceptable";
    extra =
      "Tu respuesta va en la línea correcta. Podrías precisar mejor tus argumentos.";
  }

  if (level === "critical") {
    extra +=
      " En preguntas críticas es importante analizar la postura del autor, posibles sesgos y la solidez de los argumentos.";
  }

  return { score, verdict, feedback: extra };
}

/**
 * Parsea la respuesta JSON de Gemini a nuestra estructura QuestionsByLevel.
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
        expectedAnswer: String(q.expectedAnswer || q.answer || "").trim(),
      }))
      .filter((q) => q.prompt.length > 0);
  };

  return {
    literal: normalizeLevelArray(literal, "literal", config.literal),
    inferential: normalizeLevelArray(inferential, "inferential", config.inferential),
    critical: normalizeLevelArray(critical, "critical", config.critical),
  };
}

/**
 * Llama a Gemini para generar preguntas en formato JSON estructurado.
 */
async function callGeminiForQuestions({ text, title, config }) {
  if (!geminiModel) {
    throw new Error("Gemini no está disponible (modelo no inicializado).");
  }

  const safeTitle = title || "Lectura";
  const trimmedText = text.slice(0, 8000); // recorte por sanidad

  const prompt = `
Eres un tutor experto en comprensión lectora, pensamiento crítico y argumentación en español.

Genera preguntas de comprensión en tres niveles: literal, inferencial y crítico.
Responde SOLO con un JSON con esta estructura:

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

Máximos:
- Literal: ${config.literal}
- Inferencial: ${config.inferential}
- Crítico: ${config.critical}

TÍTULO: "${safeTitle}"
TEXTO:
"""${trimmedText}"""
`;

  const result = await geminiModel.generateContent({
    contents: [
      {
        role: "user",
        parts: [{ text: prompt }],
      },
    ],
  });

  const responseText = result?.response?.candidates?.[0]?.content?.parts?.[0]?.text || "";

  if (!responseText) {
    throw new Error("Respuesta vacía desde Gemini.");
  }

  let parsed;
  try {
    parsed = JSON.parse(responseText);
  } catch (err) {
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error("No se pudo parsear JSON desde la respuesta de Gemini.");
    }
    parsed = JSON.parse(jsonMatch[0]);
  }

  return parseGeminiResponseToQuestions({ json: parsed, config });
}

/**
 * Llama a Gemini para evaluar una respuesta de estudiante.
 */
async function callGeminiForFeedback({
  level,
  questionPrompt,
  expectedAnswer,
  studentAnswer,
  title,
}) {
  if (!geminiModel) {
    throw new Error("Gemini no está disponible (modelo no inicializado).");
  }

  const safeTitle = title || "Lectura";
  const q = (questionPrompt || "").slice(0, 600);
  const exp = (expectedAnswer || "").slice(0, 600);
  const ans = (studentAnswer || "").slice(0, 1000);

  const prompt = `
Eres un tutor experto en comprensión lectora y pensamiento crítico en español.

Evalúa la respuesta de un estudiante a una pregunta sobre un texto.

Devuelve SOLO este JSON:

{
  "score": 0-100,
  "verdict": "texto breve que resuma el nivel de logro",
  "feedback": "retroalimentación en 3-6 frases, específica y orientada a mejorar"
}

DATOS:
- Título de la lectura: "${safeTitle}"
- Nivel de la pregunta: "${level}"

PREGUNTA:
"${q}"

RESPUESTA ESPERADA (puede estar vacía):
"${exp}"

RESPUESTA DEL ESTUDIANTE:
"${ans}"
`;

  const result = await geminiModel.generateContent({
    contents: [
      {
        role: "user",
        parts: [{ text: prompt }],
      },
    ],
  });

  const responseText =
    result?.response?.candidates?.[0]?.content?.parts?.[0]?.text || "";

  if (!responseText) {
    throw new Error("Respuesta vacía desde Gemini (feedback).");
  }

  let parsed;
  try {
    parsed = JSON.parse(responseText);
  } catch (err) {
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error("No se pudo parsear JSON desde la respuesta de Gemini (feedback).");
    }
    parsed = JSON.parse(jsonMatch[0]);
  }

  const score = Number.isFinite(parsed.score) ? Math.max(0, Math.min(100, parsed.score)) : 0;
  const verdict = String(parsed.verdict || "").trim() || "sin_veredicto";
  const feedback = String(parsed.feedback || "").trim() || "Sin feedback generado.";

  return { score, verdict, feedback };
}

/**
 * Punto de entrada público: generación de preguntas.
 */
export async function generateReadingQuestions({ text, title, config } = {}) {
  const finalText = (text || "").trim();

  if (!finalText || finalText.length < 50) {
    throw new Error("Texto de lectura insuficiente para generar preguntas.");
  }

  const mergedConfig = {
    ...DEFAULT_CONFIG,
    ...(config || {}),
  };

  // En tests o sin API key → mock determinista
  if (IS_TEST_ENV || !GEMINI_API_KEY) {
    console.warn("[AI Service] GEMINI_API_KEY no configurada o entorno de test. Usando preguntas MOCK.");
    return buildMockQuestions({ text: finalText, title, config: mergedConfig });
  }

  // Intentamos Gemini; si falla, mock.
  try {
    const questions = await callGeminiForQuestions({
      text: finalText,
      title,
      config: mergedConfig,
    });

    const total =
      questions.literal.length +
      questions.inferential.length +
      questions.critical.length;

    if (total === 0) {
      console.warn("[AI Service] Gemini devolvió 0 preguntas. Usando preguntas MOCK.");
      return buildMockQuestions({ text: finalText, title, config: mergedConfig });
    }

    return questions;
  } catch (err) {
    console.error(
      "[AI Service] Error llamando a Gemini. Usando preguntas MOCK.",
      err?.message || err
    );
    return buildMockQuestions({ text: finalText, title, config: mergedConfig });
  }
}

/**
 * Punto de entrada público: evaluación de respuesta.
 */
export async function evaluateAnswer({
  level,
  questionPrompt,
  expectedAnswer,
  studentAnswer,
  title,
}) {
  const student = (studentAnswer || "").trim();

  // Sin respuesta → feedback mock directo
  if (!student) {
    return buildMockFeedback({ level, studentAnswer });
  }

  // En tests o sin API key / modelo → mock (para no romper ni los tests ni dev sin clave)
  if (IS_TEST_ENV || !GEMINI_API_KEY || !geminiModel) {
    return buildMockFeedback({ level, studentAnswer });
  }

  // Intentamos Gemini; si falla, mock
  try {
    return await callGeminiForFeedback({
      level,
      questionPrompt,
      expectedAnswer,
      studentAnswer,
      title,
    });
  } catch (err) {
    console.error(
      "[AI Service] Error llamando a Gemini para feedback. Usando mock.",
      err?.message || err
    );
    return buildMockFeedback({ level, studentAnswer });
  }
}
