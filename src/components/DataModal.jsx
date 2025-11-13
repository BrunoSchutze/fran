import { useEffect, useRef, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import toast from "react-hot-toast";

function cx(...a) { return a.filter(Boolean).join(" "); }

export default function DataModal({ open, onClose, branchCode }) {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [count, setCount] = useState(0);

  const cardRef = useRef(null);
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const [dragging, setDragging] = useState(false);
  const dragOffset = useRef({ x: 0, y: 0 });

  // Nombre fijo de la sucursal
  const displayName = "Piazza";

  useEffect(() => {
    if (!open) return;
    document.body.classList.add("no-scroll");
    requestAnimationFrame(() => {
      const el = cardRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const x = Math.max((window.innerWidth - rect.width) / 2, 12);
      const y = Math.max((window.innerHeight - rect.height) / 2, 12);
      setPos({ x, y });
    });
    return () => document.body.classList.remove("no-scroll");
  }, [open]);

  const startDrag = e => {
    const el = cardRef.current; if (!el) return;
    const rect = el.getBoundingClientRect();
    const clientX = e.clientX ?? e.touches?.[0]?.clientX ?? 0;
    const clientY = e.clientY ?? e.touches?.[0]?.clientY ?? 0;
    dragOffset.current = { x: clientX - rect.left, y: clientY - rect.top };
    setDragging(true); document.body.style.userSelect = "none";
  };
  const onDrag = e => {
    if (!dragging) return;
    const el = cardRef.current; if (!el) return;
    const clientX = e.clientX ?? e.touches?.[0]?.clientX ?? 0;
    const clientY = e.clientY ?? e.touches?.[0]?.clientY ?? 0;
    const rect = el.getBoundingClientRect(); const w = rect.width, h = rect.height;
    let nx = clientX - dragOffset.current.x; let ny = clientY - dragOffset.current.y;
    const maxX = Math.max(window.innerWidth - w - 12, 12);
    const maxY = Math.max(window.innerHeight - h - 12, 12);
    nx = Math.min(Math.max(nx, 12), maxX); ny = Math.min(Math.max(ny, 12), maxY);
    setPos({ x: nx, y: ny });
  };
  const endDrag = () => { setDragging(false); document.body.style.userSelect = ""; };

  async function loadCount() {
    const r = await supabase
      .from("survey_responses")
      .select("id", { count: "exact", head: true })
      .eq("branch_code", branchCode);

    setCount(r?.count ?? 0);
  }

  async function loadRows() {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("survey_responses")
        .select("id, branch_code, nps_score, csat_score, comment, submitted_at")
        .eq("branch_code", branchCode)
        .order("submitted_at", { ascending: false })
        .range(0, 6);
      if (!error) setRows(data || []);
    } finally {
      setLoading(false);
    }
  }

  async function loadAll() {
    await Promise.all([loadCount(), loadRows()]);
  }

  useEffect(() => { if (open) loadAll(); }, [open, branchCode]);

  useEffect(() => {
    if (!open) return;

    const chResponses = supabase.channel("dm-resp")
      .on("postgres_changes",
        { event: "INSERT", schema: "public", table: "survey_responses", filter: `branch_code=eq.${branchCode}` },
        (p) => {
          toast.success(`✅ Nueva respuesta NPS ${p.new?.nps_score ?? "—"} · CSAT ${p.new?.csat_score ?? "—"}`, {
            style: { borderRadius: 12, border: "1px solid #eee", background: "#fff" },
          });
          loadAll();
        })
      .subscribe();

    return () => { supabase.removeChannel(chResponses); };
  }, [open, branchCode]);

  async function exportCSV() {
    const all = await supabase.from("survey_responses")
      .select("id, branch_code, nps_score, csat_score, comment, submitted_at")
      .eq("branch_code", branchCode)
      .order("submitted_at", { ascending: false });

    const rowsAll = all.data || [];
    const headers = ["ID", "Sucursal", "NPS", "CSAT", "Comentario", "Fecha"];
    const lines = [headers.join(",")];

    rowsAll.forEach(r => {
      const c = (r.comment || "").replaceAll('"', '""');
      lines.push([r.id, r.branch_code || "", r.nps_score ?? "", r.csat_score ?? "", `"${c}"`, new Date(r.submitted_at).toLocaleString()].join(","));
    });

    const blob = new Blob([lines.join("\n")], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url;
    a.download = "respuestas.csv";
    a.click(); URL.revokeObjectURL(url);
  }

  if (!open) return null;

  return (
    <div
      className="modal__backdrop"
      onMouseMove={onDrag} onMouseUp={endDrag} onMouseLeave={endDrag}
      onTouchMove={onDrag} onTouchEnd={endDrag} onClick={onClose}
    >
      <div
        ref={cardRef}
        className={cx("modal__card", "modal__card--fixed", dragging && "is-dragging")}
        style={{ left: pos.x, top: pos.y }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal__header modal__draghandle" onMouseDown={startDrag} onTouchStart={startDrag}>
          <div className="modal__title">
            <strong>Datos recientes - Respuestas ({count})</strong>
            <span className="modal__subtitle">Sucursal: Piazza</span>
          </div>
          <button className="modal__close" onClick={onClose} aria-label="Cerrar">✕</button>
        </div>

        <div style={{ padding: '12px 16px', borderBottom: '1px solid #eef1f6', display: 'flex', justifyContent: 'flex-end' }}>
          <button className="modal__refresh" onClick={loadAll} title="Recargar">⟳</button>
        </div>

        <div className="modal__body">
          {loading ? (
            <div className="modal__loading">Cargando…</div>
          ) : (
            <div className="modal__tablewrap">
              <table className="modal__table">
                <thead>
                  <tr>
                    <th style={{ width: 80 }}>ID</th>
                    <th style={{ width: 120 }}>Sucursal</th>
                    <th style={{ width: 80 }}>NPS</th>
                    <th style={{ width: 80 }}>CSAT</th>
                    <th>Comentario</th>
                    <th style={{ width: 190 }}>Fecha</th>
                  </tr>
                </thead>
                <tbody>
                  {rows?.length ? rows.map(r => (
                    <tr key={`r-${r.id}`}>
                      <td>{r.id}</td>
                      <td>Piazza</td>
                      <td>{r.nps_score ?? "—"}</td>
                      <td>{r.csat_score ?? "—"}</td>
                      <td className="modal__ellipsis" title={r.comment || ""}>{r.comment || "—"}</td>
                      <td>{new Date(r.submitted_at).toLocaleString()}</td>
                    </tr>
                  )) : (
                    <tr><td colSpan={6} className="modal__empty">Sin datos.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="modal__footer" style={{ 
          display: 'flex', 
          justifyContent: 'flex-end', 
          alignItems: 'center',
          padding: '16px',
          width: '100%'
        }}>
          <button 
            className="modal__export" 
            onClick={exportCSV}
            style={{
              background: 'linear-gradient(135deg, #d9caca 0%, #ecdedd 100%)',
              color: '#4a4a4a',
              border: 'none',
              padding: '12px 24px',
              borderRadius: '10px',
              fontWeight: 600,
              fontSize: '14px',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px'
            }}
            onMouseEnter={(e) => {
              e.target.style.transform = 'translateY(-2px)';
              e.target.style.boxShadow = '0 6px 16px rgba(0,0,0,0.15)';
            }}
            onMouseLeave={(e) => {
              e.target.style.transform = 'translateY(0)';
              e.target.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)';
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
              <polyline points="7 10 12 15 17 10"></polyline>
              <line x1="12" y1="15" x2="12" y2="3"></line>
            </svg>
            Exportar datos (CSV)
          </button>
        </div>
      </div>
    </div>
  );
}