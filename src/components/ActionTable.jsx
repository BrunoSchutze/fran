import './ActionTable.css'


const actions = [
{ key:'wa', label:'WhatsApp' },
{ key:'mail', label:'Email' },
{ key:'call', label:'Llamar' },
{ key:'task', label:'Agendar' },
]


export default function ActionTable({ rows=[] }){
return (
<div className="card card-pad">
<div style={{fontWeight:700, marginBottom:8}}>Gestión</div>
<table className="table">
<thead>
<tr>
<th>Cliente</th>
<th>Fecha</th>
<th>Etiqueta</th>
<th>Dueño</th>
<th style={{width:250}}>Acciones</th>
</tr>
</thead>
<tbody>
{rows.map((r)=> (
<tr key={r.id}>
<td>{r.user}</td>
<td>{r.date}</td>
<td><span className="badge">{r.tag||'—'}</span></td>
<td>{r.owner||'—'}</td>
<td>
<div className="actions">
{actions.map(a=> (
<button key={a.key} className={`pill pill-${a.key}`} onClick={()=>alert(`${a.label} → ${r.user}`)}>
{a.label}
</button>
))}
</div>
</td>
</tr>
))}
</tbody>
</table>
</div>
)
}