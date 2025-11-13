import './daily-goals.css'


export default function DailyGoalsByBranch({ items=[] }){
return (
<div className="card card-pad">
<div className="dg-header">
<strong>Metas diarias por sucursal</strong>
</div>
<div className="dg-list">
{items.map((it)=>{
const pct = Math.min(100, Math.round((it.actual/it.goal)*100))
return (
<div className="dg-row" key={it.code}>
<div className="dg-name">{it.name}</div>
<div className="dg-bar">
<div className="dg-fill" style={{width:`${pct}%`}} />
</div>
<div className="dg-val">{pct}%</div>
</div>
)
})}
</div>
</div>
)
}