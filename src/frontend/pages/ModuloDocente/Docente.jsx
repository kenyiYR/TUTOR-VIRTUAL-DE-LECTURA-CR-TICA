// src/frontend/pages/ModuloDocente/Docente.jsx
import React, { useState, useEffect } from "react";
import { Container, Card, Table, Button, Form } from "react-bootstrap";

export default function Docente() {
  const [students, setStudents] = useState([]);
  const [contentTitle, setContentTitle] = useState("");
  const [questionText, setQuestionText] = useState("");
  const [comparative, setComparative] = useState(null);

  useEffect(() => {
    const users = JSON.parse(localStorage.getItem("users") || "[]");
    setStudents(users.filter(u => u.role === "estudiante"));
  }, []);

  const downloadReport = (email) => {
    const prog = JSON.parse(localStorage.getItem(`progress_${email}`) || "[]");
    const csv = "fecha,score\n" + (prog.map(p => `${p.date},${p.score}`).join("\n") || "");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${email}-report.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleUpload = (e) => {
    e.preventDefault();
    alert(`Contenido "${contentTitle}" cargado (simulado)`);
    setContentTitle("");
  };

  const handleCreateQuestion = (e) => {
    e.preventDefault();
    alert(`Pregunta creada: "${questionText}" (simulado)`);
    setQuestionText("");
  };

  const runComparative = () => {
    setComparative([{ name: "Grupo A", avg: 78 }, { name: "Grupo B", avg: 65 }, { name: "Grupo C", avg: 85 }]);
  };

  return (
    <Container className="my-5">
      <h2>Módulo Docente</h2>
      <p className="text-muted">Panel de control, gestión de contenidos y análisis comparativo.</p>

      <Card className="mb-3">
        <Card.Body>
          <h5>Panel de control — lista de estudiantes</h5>
          <Table striped bordered hover size="sm">
            <thead><tr><th>Email</th><th>Nombre</th><th>Progreso</th><th>Acciones</th></tr></thead>
            <tbody>
              {students.length === 0 && <tr><td colSpan="4">No hay estudiantes registrados</td></tr>}
              {students.map((s,i)=>(<tr key={i}><td>{s.email}</td><td>{s.name || "-"}</td><td>{Math.floor(40+Math.random()*60)}%</td><td><Button size="sm" onClick={()=>downloadReport(s.email)}>Descargar reporte</Button></td></tr>))}
            </tbody>
          </Table>
        </Card.Body>
      </Card>

      <Card className="mb-3">
        <Card.Body>
          <h5>Gestión de contenido</h5>
          <Form onSubmit={handleUpload}><Form.Group className="mb-2"><Form.Label>Título</Form.Label><Form.Control value={contentTitle} onChange={e=>setContentTitle(e.target.value)} /></Form.Group><Button type="submit">Cargar texto</Button></Form>
          <hr />
          <Form onSubmit={handleCreateQuestion}><Form.Group className="mb-2"><Form.Label>Pregunta manual</Form.Label><Form.Control as="textarea" rows={3} value={questionText} onChange={e=>setQuestionText(e.target.value)} /></Form.Group><Button type="submit" variant="success">Crear pregunta</Button></Form>
        </Card.Body>
      </Card>

      <Card>
        <Card.Body>
          <h5>Análisis comparativo</h5>
          <Button onClick={runComparative}>Ejecutar análisis</Button>
          {comparative && comparative.map((g,i)=>(<div key={i}><strong>{g.name}</strong>: promedio {g.avg}%</div>))}
        </Card.Body>
      </Card>
    </Container>
  );
}
