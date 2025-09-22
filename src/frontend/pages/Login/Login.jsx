import React, { useState } from 'react'

function Login() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")

  const handleSubmit = (e) => {
    e.preventDefault()
    alert(`Intentando iniciar sesión con: ${email}`)
  }

  return (
    <div>
      <h1>Iniciar Sesión 🔑</h1>
      <form onSubmit={handleSubmit}>
        <input 
          type="email" 
          placeholder="Correo electrónico" 
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required 
        /><br />
        <input 
          type="password" 
          placeholder="Contraseña"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required 
        /><br />
        <button type="submit">Entrar</button>
      </form>
    </div>
  )
}

export default Login
