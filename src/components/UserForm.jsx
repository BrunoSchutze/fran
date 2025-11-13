import { useState } from 'react'


export default function UserForm({ onSubmit, initial }){
const [email,setEmail]=useState(initial?.email||'')
const [full_name,setFullName]=useState(initial?.full_name||'')
const [role,setRole]=useState(initial?.role||'branch')
const [branch_code,setBranch]=useState(initial?.branch_code||'')
const [password,setPassword]=useState('')


return (
<form onSubmit={(e)=>{e.preventDefault(); onSubmit({email,full_name,role,branch_code,password})}} className="grid" style={{gap:10}}>
<input className="input" placeholder="Email" value={email} onChange={e=>setEmail(e.target.value)} required/>
<input className="input" placeholder="Nombre completo" value={full_name} onChange={e=>setFullName(e.target.value)}/>
<div className="grid grid-2">
<select className="input" value={role} onChange={e=>setRole(e.target.value)}>
<option value="admin">Admin</option>
<option value="branch">Branch</option>
</select>
<input className="input" placeholder="Código sucursal (opcional)" value={branch_code} onChange={e=>setBranch(e.target.value)} />
</div>
<input className="input" placeholder="Contraseña (para crear auth)" type="password" value={password} onChange={e=>setPassword(e.target.value)} />
<button className="btn" type="submit">Guardar</button>
</form>
)
}