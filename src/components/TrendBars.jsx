// src/components/TrendBars.jsx  


export default function TrendBars({ items }) {
  const max = Math.max(...items.map(i => i.now), 1);
  return (
    <div style={{display:"flex", flexDirection:"column", gap:10, margin:"10px 0 16px"}}>
      {items.map(i => {
        const pct = Math.round((i.now / max) * 100);
        return (
          <div key={i.code} style={{display:"grid", gridTemplateColumns:"1fr 3fr auto", gap:10, alignItems:"center"}}>
            <div style={{fontSize:14}}>{i.name}</div>
            <div style={{height:12, background:"#f0f2f1", borderRadius:999, overflow:"hidden"}}>
              <div style={{height:"100%", width:`${pct}%`, background:"linear-gradient(90deg,#023025,#03614b)"}} />
            </div>
            <div style={{fontWeight:700}}>${i.now.toLocaleString()}</div>
          </div>
        );
      })}
    </div>
  );
}
