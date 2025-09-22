import React from 'react'

function Contacto() {
  return (
    <div>
      <h1>Contacto 📩</h1>
      <p>Si tienes dudas o comentarios, completa el formulario de contacto.</p>
      <form>
        <input type="text" placeholder="Tu nombre" required /><br />
        <input type="email" placeholder="Tu correo" required /><br />
        <textarea placeholder="Escribe tu mensaje..." required></textarea><br />
        <button type="submit">Enviar</button>
      </form>
    </div>
  )
}

export default Contacto
