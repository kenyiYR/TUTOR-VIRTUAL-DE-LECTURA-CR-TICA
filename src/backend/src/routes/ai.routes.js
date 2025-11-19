import { Router } from "express";
import { generateReadingQuestions } from "../lib/ai.service.js";

const r = Router();

r.post("/preview-questions", async (req, res) => {
  try {
    const { text, title } = req.body || {};

    const questions = await generateReadingQuestions({
      text,
      title
    });

    res.json({
      ok: true,
      questions
    });
  } catch (err) {
    res.status(400).json({
      ok: false,
      message: err?.message || "Error generando preguntas"
    });
  }
});

export default r;
