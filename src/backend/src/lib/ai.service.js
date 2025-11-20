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
  const safeSnippet = (text || "").slice(0, 220).replace(/\s+/g, " ").trim();

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
      }, explica una idea o conclusión que no está dicha literalmente, pero que se puede deducir. Si es posible, señala también qué supuestos del autor permiten esa inferencia. (Pregunta inferencial ${
        i + 1
      })`
    ),
    critical: makeQuestions("critical", config.critical, (i) => {
      // Mezclamos preguntas críticas "clásicas" y preguntas centradas en sesgos/falacias
      if (i % 2 === 0) {
        return `Tomando como base el texto "${safeTitle}", emite una opinión crítica y argumentada sobre una postura o conclusión del autor. Evalúa su coherencia, los argumentos que usa y el posible impacto que podría tener en la realidad. (Pregunta crítica ${
          i + 1
        })`;
      }

      return `Revisa el texto "${safeTitle}"${
        safeSnippet ? ` (por ejemplo: "${safeSnippet}...")` : ""
      } e identifica si existe algún posible SESGO (por ejemplo, sesgo de confirmación, generalización apresurada) o alguna FALACIA argumentativa (ad hominem, apelación a la emoción, falsa causa, etc.). Describe el fragmento problemático y justifica por qué podría considerarse un sesgo o falacia, o explica si el argumento te parece sólido. (Pregunta crítica centrada en sesgos/falacias ${
        i + 1
      })`;
    })
  };
}

function buildMockFeedback({ level, questionPrompt, expectedAnswer, studentAnswer, title }) {
  const trimmed = (studentAnswer || "").trim();

  if (!trimmed) {
    return {
      score: 0,
      verdict: "sin_respuesta",
      feedback:
        "No escribiste una respuesta. Intenta responder con tus propias palabras, aunque no estés seguro, para poder darte una retroalimentación útil."
    };
  }

  let score = 60;
  let verdict = "parcial";
  let extra = "";

  if (trimmed.length < 25) {
    score = 40;
    verdict = "muy_breve";
    extra = "Tu respuesta es muy corta. Intenta desarrollar un poco más tus ideas y justificar por qué piensas eso.";
  } else if (trimmed.length > 300) {
    score = 70;
    verdict = "extensa";
    extra = "Tu respuesta es detallada, pero podrías organizar mejor tus ideas y centrarte en lo que pide la pregunta.";
  } else {
    score = 75;
    verdict = "aceptable";
    extra = "Tu respuesta va en la línea correcta. Aún así, podrías precisar mejor tus argumentos y relacionarlos más directamente con el texto.";
  }

  if (level === "critical") {
    extra +=
      " Recuerda que en las preguntas críticas es importante analizar la postura del autor, detectar posibles sesgos o falacias y justificar tu opinión con argumentos claros.";
  }

  return {
    score,
    verdict,
    feedback: extra
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
Eres un tutor experto en comprensión lectora, pensamiento crítico y argumentación en español.

Recibirás el texto de una lectura y deberás generar preguntas de comprensión en tres niveles:
1) Literal
2) Inferencial
3) Crítico

Además, antes de formular las preguntas, realiza internamente un ANÁLISIS de:
- Posibles SESGOS del autor (cognitivos, ideológicos, de selección de datos, etc.).
- Posibles FALACIAS argumentativas (ad hominem, falsa causa, generalización apresurada, apelación a la emoción, etc.).
No devuelvas este análisis como texto separado, pero ÚSALO para diseñar especialmente las preguntas críticas.

REQUERIMIENTOS POR NIVEL:

- Nivel LITERAL:
  * Preguntas basadas en información explícita del texto.
  * El estudiante debe poder responder localizando datos directamente en el contenido.
  * NO pidas opiniones; solo verificación de hechos, personajes, datos, definiciones, etc.

- Nivel INFERENCIAL:
  * Preguntas que exijan deducir o interpretar ideas que no están dichas de forma explícita.
  * Relacionar partes del texto, leer entre líneas, identificar supuestos no declarados.
  * Puedes incluir alguna pregunta que invite a inferir qué tipo de supuestos o perspectiva tiene el autor (por ejemplo, su visión política, económica, social), sin afirmar nada como verdad absoluta.

- Nivel CRÍTICO:
  * Preguntas que inviten a valorar, argumentar, cuestionar y opinar de forma fundamentada sobre el texto.
  * Considerar coherencia, intenciones del autor, impacto social, posibles sesgos, calidad de las fuentes, generalizaciones, etc.
  * DA ESPECIAL ÉNFASIS A ESTE NIVEL (más preguntas críticas que de los otros niveles).

  Dentro del nivel CRÍTICO:
  * AL MENOS LA MITAD de las preguntas deben centrarse en SESGOS y FALACIAS, por ejemplo:
    - Identificar un posible sesgo en el modo en que se presenta la información.
    - Revisar si alguna conclusión se basa en una generalización apresurada.
    - Detectar si se apela solo a la emoción sin sustento.
    - Ver si se ataca a la persona y no al argumento (ad hominem), etc.
  * Si el texto parece razonablemente equilibrado y no encuentras sesgos evidentes, formula preguntas que ayuden a verificar si podría haber sesgos ocultos (por ejemplo, qué datos faltan, qué voces no se escuchan, qué supuestos se dan por hechos).

CANTIDAD DE PREGUNTAS (máximos):
- Literal: hasta ${config.literal} preguntas.
- Inferencial: hasta ${config.inferential} preguntas.
- Crítico: hasta ${config.critical} preguntas.

RESPUESTAS ESPERADAS:
- En "expectedAnswer", resume la respuesta correcta o razonable de forma breve.
- En las preguntas críticas sobre sesgos/falacias, si es posible:
  * Nombra el tipo de sesgo o falacia (por ejemplo: "sesgo de confirmación", "falacia de falsa causa").
  * Explica brevemente por qué podría considerarse así, o indica que no hay evidencia clara de sesgo si corresponde.

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

async function callGeminiForFeedback({
  level,
  questionPrompt,
  expectedAnswer,
  studentAnswer,
  title
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

Tu tarea es EVALUAR la respuesta de un estudiante a una pregunta sobre un texto.

Debes:
- Comparar la respuesta del estudiante con la pregunta y, si sirve, con la respuesta esperada de referencia.
- Valorar comprensión literal, inferencial o crítica según el nivel indicado.
- Dar retroalimentación HONESTA pero constructiva: señalar aciertos, errores y cómo mejorar.
- En preguntas críticas, presta especial atención a:
  - Capacidad de análisis de argumentos.
  - Identificación (o ausencia) de sesgos y falacias.
  - Claridad y coherencia del razonamiento.

Niveles:
- literal: verificar si comprende datos concretos del texto.
- inferential: verificar si sabe deducir ideas implícitas.
- critical: verificar si sabe analizar, cuestionar y argumentar sobre el texto (incluyendo sesgos y falacias).

RESPUESTA:
Devuelve ÚNICAMENTE un JSON con esta estructura:

{
  "score": 0-100,
  "verdict": "texto breve que resuma el nivel de logro",
  "feedback": "retroalimentación en 3-6 frases, específica y orientada a mejorar"
}

- "score": número entero entre 0 y 100.
- "verdict": algo como "incorrecto", "parcialmente correcto", "bueno", "muy bueno", etc.
- "feedback": sin elogios vacíos; señala qué hizo bien, qué falta y cómo mejorar.

NO incluyas comentarios fuera del JSON.

DATOS:
- Título de la lectura: "${safeTitle}"
- Nivel de la pregunta: "${level}"

PREGUNTA:
"${q}"

RESPUESTA ESPERADA (referencia, puede estar vacía):
"${exp}"

RESPUESTA DEL ESTUDIANTE:
"${ans}"
`;

  const result = await geminiModel.generateContent({
    contents: [
      {
        role: "user",
        parts: [{ text: prompt }]
      }
    ]
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

/**
 * Evalúa la respuesta de un estudiante a una pregunta.
 *
 * @param {Object} params
 * @param {string} params.level            Nivel de la pregunta (literal | inferential | critical)
 * @param {string} params.questionPrompt   Enunciado de la pregunta
 * @param {string} [params.expectedAnswer] Respuesta esperada de referencia
 * @param {string} params.studentAnswer    Respuesta del estudiante
 * @param {string} [params.title]          Título de la lectura (opcional)
 * @returns {Promise<{score:number, verdict:string, feedback:string}>}
 */
export async function evaluateAnswer({
  level,
  questionPrompt,
  expectedAnswer,
  studentAnswer,
  title
}) {
  const student = (studentAnswer || "").trim();
  if (!student) {
    return buildMockFeedback({
      level,
      questionPrompt,
      expectedAnswer,
      studentAnswer,
      title
    });
  }

  // Si no hay API key, usamos mock directo
  if (!GEMINI_API_KEY || !geminiModel) {
    return buildMockFeedback({
      level,
      questionPrompt,
      expectedAnswer,
      studentAnswer,
      title
    });
  }

  try {
    return await callGeminiForFeedback({
      level,
      questionPrompt,
      expectedAnswer,
      studentAnswer,
      title
    });
  } catch (err) {
    console.error("[AI Service] Error llamando a Gemini para feedback. Usando mock.", err?.message || err);
    return buildMockFeedback({
      level,
      questionPrompt,
      expectedAnswer,
      studentAnswer,
      title
    });
  }
}

