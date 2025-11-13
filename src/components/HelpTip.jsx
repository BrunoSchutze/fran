import { useState, useRef, useEffect } from "react";

export default function HelpTip({ title="¿Qué mide este gráfico?", children }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(()=>{
    function onDoc(e){ if(open && ref.current && !ref.current.contains(e.target)) setOpen(false) }
    document.addEventListener('click', onDoc);
    return ()=>document.removeEventListener('click', onDoc);
  },[open]);

  return (
    <div ref={ref} style={{ position:"relative" }}>
      <button
        aria-label="Ayuda"
        onClick={()=>setOpen(o=>!o)}
        style={{
          border:"1px solid #e5e7eb", background:"#fff", borderRadius:999,
          width:28, height:28, lineHeight:"26px", textAlign:"center", cursor:"pointer"
        }}
        title="¿Qué mide?"
      >?</button>

      {open && (
        <div
          role="dialog"
          aria-label={title}
          style={{
            position:"absolute", right:0, top:"calc(100% + 8px)", zIndex:30,
            width:320, background:"#fff", border:"1px solid #eef1f6",
            boxShadow:"0 18px 44px rgba(0,0,0,.18)", borderRadius:12, padding:12
          }}
        >
          <strong style={{display:"block", marginBottom:6}}>{title}</strong>
          <div style={{fontSize:13, color:"#374151"}}>{children}</div>
        </div>
      )}
    </div>
  );
}
