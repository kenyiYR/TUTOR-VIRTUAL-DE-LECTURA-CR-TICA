// src/frontend/pages/ModuloIA/IA.jsx
import React, { useState } from "react";
import { Container, Card, Button, Form, ListGroup } from "react-bootstrap";

export default function IA() {
  const [text, setText] = useState("");
  const [questions, setQuestions] = useState([]);
  const [bias, setBias] = useState(null);
  const [feedback, setFeedback] = useState(null);

  const genQuestions = () => {
    if (!text) return alert("Pega o sube un texto primero");
    setQuestions(["¿Cuál es la tesis principal?", "¿Qué evidencia usa el autor?", "¿Qué contraargumentos existen?"]);
  };

  const analyzeBias = () => {
    if (!text) return alert("Pega o sube un texto primero");
    setBias(Math.random()>0.6 ? "Sesgo detectado: lenguaje emotivo" : "Sin sesgos significativos");
  };

  const autoEval = () => {
    setFeedback("Evaluación automática: buena respuesta. Recomendación: profundizar en contraargumentos.");
  };

  return (
    <Container className="my-5">
      <h2>Módulo IA</h2>
      <p className="text-muted">Generación de preguntas, análisis de sesgos, evaluación automática y retroalimentación adaptativa.</p>

      <Card className="mb-3">
        <Card.Body>
          <Form.Group className="mb-2">
            <Form.Label>Texto para análisis</Form.Label>
            <Form.Control as="textarea" rows={6} value={text} onChange={e=>setText(e.target.value)} />
          </Form.Group>
          <div className="d-flex gap-2">
            <Button onClick={genQuestions}>Generar preguntas</Button>
            <Button variant="warning" onClick={analyzeBias}>Analizar sesgos</Button>
            <Button variant="success" onClick={autoEval}>Evaluación automática</Button>
          </div>
        </Card.Body>
      </Card>

      {questions.length>0 && <Card className="mb-3"><Card.Body><h5>Preguntas generadas</h5><ListGroup>{questions.map((q,i)=><ListGroup.Item key={i}>{q}</ListGroup.Item>)}</ListGroup></Card.Body></Card>}
      {bias && <Card className="mb-3"><Card.Body><h5>Análisis de sesgos</h5><p>{bias}</p></Card.Body></Card>}
      {feedback && <Card><Card.Body><h5>Retroalimentación adaptativa</h5><p>{feedback}</p></Card.Body></Card>}
    </Container>
  );
}
