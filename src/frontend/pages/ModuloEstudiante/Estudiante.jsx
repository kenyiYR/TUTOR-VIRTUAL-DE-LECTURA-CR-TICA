// src/frontend/pages/ModuloEstudiante/Estudiante.jsx
import React, { useState, useEffect } from "react";
import { Container, Card, Button, ListGroup, Form, ProgressBar } from "react-bootstrap";
import { useAuth } from "../../../context/AuthContext";
import { Link } from "react-router-dom";

export default function Estudiante() {
  const { user } = useAuth();
  const [suggested] = useState([
    { id: 1, title: "La importancia del pensamiento crítico" },
    { id: 2, title: "Ética y tecnología" },
    { id: 3, title: "IA y educación" },
  ]);
  const [text, setText] = useState("");
  const [questions, setQuestions] = useState([]);
  const [biasResult, setBiasResult] = useState(null);
  const [score, setScore] = useState(null);

  const historyKey = `history_${user?.email || "anon"}`;
  const [history, setHistory] = useState(() => JSON.parse(localStorage.getItem(historyKey) || "[]"));

  useEffect(() => {
    localStorage.setItem(historyKey, JSON.stringify(history));
  }, [history, historyKey]);

  const handleUpload = (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    const reader = new FileReader();
    reader.onload = (ev) => setText(ev.target.result);
    reader.readAsText(f);
  };

  const handleAnalyze = () => {
    if (!text) return alert("Sube o pega un texto");
    // Simular IA
    const gen = [
      "¿Cuál es la idea principal?",
      "Menciona dos argumentos del autor.",
      "¿Qué contraargumentos existen?"
    ];
    setQuestions(gen);
    setBiasResult(Math.random() > 0.7 ? "Posible sesgo detectado (tono parcial)" : "Sin sesgos relevantes");
    const newScore = Math.floor(60 + Math.random()*40);
    setScore(newScore);
    setHistory((h) => [{ date: new Date().toISOString(), score: newScore }, ...h].slice(0,20));
  };

  return (

<div className="panel-wrap">
  <div className="card" style={{marginBottom:12, display:'flex', justifyContent:'space-between', alignItems:'center'}}>
    <h3 style={{margin:0}}>Módulo de estudiante</h3>
    <Link className="btn" to="/estudiante/lecturas">Ver lecturas asignadas</Link>
  </div>

    <Container className="my-5">
      <h2>Módulo Estudiante</h2>
      <p className="text-muted">Textos sugeridos, subida de texto, análisis crítico y gamificación.</p>

      <Card className="mb-3">
        <Card.Body>
          <h5>Textos sugeridos</h5>
          <ListGroup>
            {suggested.map(s => <ListGroup.Item key={s.id}>{s.title} <Button variant="link" size="sm" className="float-end" onClick={() => setText("Contenido del texto: " + s.title)}>Seleccionar</Button></ListGroup.Item>)}
          </ListGroup>
        </Card.Body>
      </Card>

      <Card className="mb-3">
        <Card.Body>
          <h5>Subida de texto propio</h5>
          <Form.Group className="mb-2">
            <Form.Control type="file" accept=".txt" onChange={handleUpload} />
          </Form.Group>
          <Form.Group className="mb-2">
            <Form.Control as="textarea" rows={6} value={text} onChange={(e) => setText(e.target.value)} placeholder="Pega o escribe tu texto aquí" />
          </Form.Group>
          <Button onClick={handleAnalyze} disabled={!text}>Analizar (IA)</Button>
        </Card.Body>
      </Card>

      {questions.length > 0 && (
        <Card className="mb-3">
          <Card.Body>
            <h5>Preguntas generadas por IA</h5>
            <ListGroup>{questions.map((q,i)=><ListGroup.Item key={i}>{q}</ListGroup.Item>)}</ListGroup>
            <div className="mt-3"><strong>Detección de sesgos:</strong> {biasResult}</div>
          </Card.Body>
        </Card>
      )}

      {score !== null && (
        <Card className="mb-3">
          <Card.Body>
            <h5>Resultado y retroalimentación</h5>
            <p>Puntaje: <strong>{score}</strong> / 100</p>
            <ProgressBar now={score} label={`${score}%`} />
            <div className="mt-3">
              <h6>Progreso histórico</h6>
              <ListGroup>
                {history.map((h,i)=>(<ListGroup.Item key={i}>{new Date(h.date).toLocaleString()} — {h.score}</ListGroup.Item>))}
              </ListGroup>
              <div className="mt-3"><Link to="/gamificacion"><Button>Ir a Gamificación</Button></Link></div>
            </div>
          </Card.Body>
        </Card>
      )}
    </Container>
    </div>
  );
}
