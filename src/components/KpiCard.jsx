// src/components/KpiCard.jsx
export default function KpiCard({ title, value, subtitle }) {
  return (
    <div style={{
      background:"#fff", borderRadius:16, boxShadow:"0 8px 30px rgba(0,0,0,.08)", padding:16
    }}>
      <div style={{fontSize:14, color:"#567"}}>{title}</div>
      <div style={{fontSize:26, fontWeight:800, marginTop:6}}>{value}</div>
      {subtitle && <div style={{fontSize:13, color:"#678", marginTop:2}}>{subtitle}</div>}
    </div>
  );
}
