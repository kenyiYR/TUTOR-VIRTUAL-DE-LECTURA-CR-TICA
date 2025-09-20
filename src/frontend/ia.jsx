<!doctype html>
<html lang="es">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1" />
  <title>IA</title>
  <style>
    body{margin:0;font-family:Inter,Arial;background:#f0f9ff;}
    header{background:#0284c7;color:#fff;padding:16px;}
    nav{display:flex;gap:8px;justify-content:center;background:#bae6fd;padding:12px;}
    nav a{text-decoration:none;padding:8px 12px;color:#075985;background:#fff;border-radius:8px;}
    .container{max-width:900px;margin:20px auto;padding:16px;}
    .card{background:#fff;padding:20px;border-radius:12px;box-shadow:0 4px 10px rgba(0,0,0,0.08);margin-bottom:16px;}
    textarea{width:100%;padding:8px;border-radius:6px;border:1px solid #ccc;}
    button{margin-top:8px;padding:8px 12px;border-radius:6px;background:#0284c7;color:#fff;border:none;}
  </style>
</head>
<body>
  <header><h1>🤖 Inteligencia Artificial</h1></header>
  <nav>
    <a href="index.html">Inicio</a>
  </nav>
  <main class="container">
    <div class="card">
      <h2>Chat con IA</h2>
      <textarea rows="3" placeholder="Escribe tu pregunta..."></textarea>
      <button onclick="alert('Enviando a IA...')">Enviar</button>
    </div>
  </main>
</body>
</html>
