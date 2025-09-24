// src/frontend/pages/Gamificacion/Gamificacion.jsx
import React, { useState } from "react";
import { Container, Card, Button, ListGroup, Form } from "react-bootstrap";

export default function Gamificacion() {
  const [badges, setBadges] = useState([{ id:1, name:"Iniciador", desc:"Completa tu primer análisis" }]);
  const [newBadge, setNewBadge] = useState("");
  const [ranking] = useState([{ user:"ana@correo.com", score:980 }, { user:"luis@correo.com", score:920 }]);

  const addBadge = (e) => { e.preventDefault(); if(!newBadge) return; setBadges(b=>[...b, { id:Date.now(), name:newBadge, desc:"Insignia nueva" }]); setNewBadge(""); };

  return (
    <Container className="my-5">
      <h2>Gamificación</h2>
      <Card className="mb-3"><Card.Body><h5>Insignias</h5><ListGroup>{badges.map(b=> <ListGroup.Item key={b.id}><strong>{b.name}</strong> — {b.desc}</ListGroup.Item>)}</ListGroup>
      <Form onSubmit={addBadge} className="d-flex gap-2 mt-3"><Form.Control placeholder="Nombre insignia" value={newBadge} onChange={e=>setNewBadge(e.target.value)} /><Button type="submit">Add</Button></Form></Card.Body></Card>

      <Card><Card.Body><h5>Ranking General</h5><ListGroup>{ranking.map((r,i)=><ListGroup.Item key={i}>{i+1}. {r.user} — {r.score} pts</ListGroup.Item>)}</ListGroup></Card.Body></Card>
    </Container>
  );
}
