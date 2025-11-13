import { useState } from 'react'

export default function BranchForm({ onSubmit }) {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const handle = (e) => {
    e.preventDefault()
    onSubmit({ name, email, password })
  }

  return (
    <form onSubmit={handle} className="grid" style={{ gap: 10 }}>
      <input className="input" placeholder="Nombre de la sucursal" value={name} onChange={e=>setName(e.target.value)} required />
      <input className="input" placeholder="Usuario / Email" type="email" value={email} onChange={e=>setEmail(e.target.value)} required />
      <input className="input" placeholder="Contraseña" type="password" value={password} onChange={e=>setPassword(e.target.value)} required />
      <button className="btn">Guardar</button>
    </form>
  )
}
