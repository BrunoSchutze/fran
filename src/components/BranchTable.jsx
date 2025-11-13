// src/components/BranchTable.jsx
import { Link } from "react-router-dom";

export default function BranchTable({ rows }) {
  return (
    <table style={{
      width:"100%", borderCollapse:"collapse", background:"#fff",
      borderRadius:16, boxShadow:"0 8px 30px rgba(0,0,0,.08)", overflow:"hidden"
    }}>
      <thead><tr><th style={thtd}>Sucursal</th><th style={thtd}>Hoy</th><th style={thtd}>%</th><th style={thtd}></th></tr></thead>
      <tbody>
        {rows.map(r => (
          <tr key={r.code}>
            <td style={thtd}>{r.name}</td>
            <td style={thtd}>${r.now.toLocaleString()}</td>
            <td style={thtd}>{r.pct}%</td>
            <td style={thtd}><Link to={`/sucursal/${r.code}`} style={btn}>Ver</Link></td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

const thtd = { padding:"12px", borderBottom:"1px solid #eee", textAlign:"left" };
const btn = { padding:"6px 10px", borderRadius:10, background:"#023025", color:"#fff", textDecoration:"none" };
