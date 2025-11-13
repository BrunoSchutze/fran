import { useEffect, useMemo, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import Topbar from "../components/Topbar";
import Modal from "../components/Modal";
import SurveyForm from "../components/SurveyForm";
import Toast from "../components/Toast";
import QRCode from "react-qr-code";
import "./AdminDashboard.css";

/* ==== ICONOS ==== */
function IconQR() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="8" height="8" />
      <rect x="13" y="3" width="8" height="8" />
      <rect x="3" y="13" width="8" height="8" />
      <path d="M17 13h4v4h-4v4" />
    </svg>
  );
}
function IconEdit() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 20h9" />
      <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5z" />
    </svg>
  );
}
function IconTrash() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="3 6 5 6 21 6" />
      <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
      <path d="M10 11v6M14 11v6" />
      <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
    </svg>
  );
}

/* ============== Helpers UI ============== */
function EmptyRow({ colSpan = 1, children }) {
  return (
    <tr>
      <td colSpan={colSpan} style={{ padding: 16, color: "#70737a" }}>
        {children}
      </td>
    </tr>
  );
}
function PrettyCode({ children }) {
  return (
    <span
      style={{
        display: "inline-block",
        padding: "2px 8px",
        borderRadius: 8,
        background: "#f5f7fb",
        border: "1px solid #eaeef5",
        fontFamily: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas",
      }}
    >
      {children}
    </span>
  );
}

/* ============== Confirm Dialog ============== */
function ConfirmDialog({ open, title = "Confirmar", message, onCancel, onConfirm }) {
  if (!open) return null;
  return (
    <div className="modal-backdrop" onClick={onCancel}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="modal-head">
          <strong className="modal-title">{title}</strong>
          <button className="modal-x" onClick={onCancel}>✕</button>
        </div>
        <div className="modal-body" style={{ gap: 8 }}>
          <p style={{ margin: 0, color: "#374151" }}>{message}</p>
          <div style={{ display: "flex", gap: 8, marginTop: 14, justifyContent: "flex-end" }}>
            <button className="pill" onClick={onCancel}>Cancelar</button>
            <button className="btn" onClick={onConfirm}>Confirmar</button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ============== Modal QR (con botón Descargar) ============== */
function QRModal({ open, url, onClose }) {
  const [downloading, setDownloading] = useState(false);
  if (!open) return null;

  const handleDownload = async () => {
    try {
      setDownloading(true);
      const svg = document.querySelector("#qr-svg");
      if (!svg) return;
      const xml = new XMLSerializer().serializeToString(svg);
      const svg64 = "data:image/svg+xml;charset=utf-8," + encodeURIComponent(xml);
      const img = new Image();
      img.onload = () => {
        const size = 1024; // alta resolución para imprimir
        const canvas = document.createElement("canvas");
        canvas.width = size; canvas.height = size;
        const ctx = canvas.getContext("2d");
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, size, size);
        ctx.drawImage(img, 0, 0, size, size);
        const pngUrl = canvas.toDataURL("image/png");
        const a = document.createElement("a");
        a.href = pngUrl;
        a.download = "qr.png";
        a.click();
        setDownloading(false);
      };
      img.onerror = () => setDownloading(false);
      img.src = svg64;
    } catch {
      setDownloading(false);
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="modal-head">
          <strong className="modal-title">Código QR</strong>
          <button className="modal-x" onClick={onClose}>✕</button>
        </div>
        <div className="modal-body" style={{ display: "grid", placeItems: "center", gap: 10 }}>
          <div style={{ background: "#fff", padding: 12, borderRadius: 12 }}>
            <QRCode id="qr-svg" value={url || ""} size={220} />
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <a href={url} target="_blank" rel="noreferrer" className="pill" style={{ textDecoration: "none" }}>
              Abrir enlace
            </a>
            <button className="pill" onClick={handleDownload} disabled={downloading}>
              {downloading ? "Descargando…" : "Descargar"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ============== Modal NUEVA/EDITAR SUCURSAL ============== */
function BranchForm({ open, onClose, onSaved, initial }) {
  const editing = !!initial;
  const [name, setName] = useState(initial?.name || "");
  const [email, setEmail] = useState(initial?.email || "");
  const [pwd, setPwd] = useState("");
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    if (!open) return;
    setName(initial?.name || "");
    setEmail(initial?.email || "");
    setPwd("");
    setToast(null);
  }, [open, initial]);

  const codeFromName = (txt) =>
    (txt || "")
      .normalize("NFD")
      .replace(/\p{Diacritic}/gu, "")
      .replace(/[^a-zA-Z0-9]/g, "")
      .slice(0, 12)
      .toLowerCase();

  const onSave = async () => {
    if (!name.trim()) return setToast({ type: "error", msg: "Ingresá el nombre." });
    if (!email.trim()) return setToast({ type: "error", msg: "Ingresá el email." });

    setLoading(true);
    try {
      const code = initial?.code || codeFromName(name);

      const { error: e1 } = await supabase.from("branches").upsert(
        { code, name: name.trim() },
        { onConflict: "code" }
      );
      if (e1) throw e1;

      const { data: prof } = await supabase
        .from("profiles")
        .select("id")
        .eq("branch_code", code)
        .maybeSingle();

      if (prof) {
        const upd = { email: email.trim(), role: "branch", branch_code: code };
        if (pwd) upd.temp_password = pwd;
        const { error: eUpd } = await supabase.from("profiles").update(upd).eq("id", prof.id);
        if (eUpd) throw eUpd;
      } else {
        const ins = { email: email.trim(), role: "branch", branch_code: code };
        if (pwd) ins.temp_password = pwd;
        const { error: eIns } = await supabase.from("profiles").insert(ins);
        if (eIns) throw eIns;
      }

      setToast({ type: "success", msg: editing ? "Sucursal actualizada." : "Sucursal creada." });
      setTimeout(() => { onClose?.(); onSaved?.(); }, 700);
    } catch (err) {
      setToast({ type: "error", msg: err.message || "No se pudo guardar." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Modal open={open} title={editing ? "Editar sucursal" : "Nueva sucursal"} onClose={onClose}>
        <div className="form-grid">
          <input className="input" placeholder="Nombre de la sucursal" value={name} onChange={(e) => setName(e.target.value)} />
          <input className="input" placeholder="usuario@sucursal.com" value={email} onChange={(e) => setEmail(e.target.value)} />
          <input className="input" type="password" placeholder="Contraseña" value={pwd} onChange={(e) => setPwd(e.target.value)} />
          <button className="btn" disabled={loading} onClick={onSave}>{loading ? "Guardando…" : "Guardar"}</button>
        </div>
      </Modal>
      {toast && <Toast type={toast.type} onClose={() => setToast(null)}>{toast.msg}</Toast>}
    </>
  );
}

/* ============== Cards Acceso Rápido ============== */
function QuickCards({ branches }) {
  if (!branches?.length) {
    return <div className="empty-aside">Aún no hay sucursales agregadas.</div>;
  }
  return (
    <div className="quick-stack">
      {branches.map((b) => (
        <a
          key={b.code}
          className="quick-tile"
          href={`/sucursal/${encodeURIComponent(b.code)}/experience`}  /* 👉 ahora va al panel de métricas */
          title={`Ir a ${b.name}`}
        >
          <div className="qt-text">
            <div className="qt-line1">Suc</div>
            <div className="qt-line2">{b.name}</div>
          </div>
          <div className="qt-logoBox">
            <img src="/logo-corto.png" alt="logo" style={{ width: 120, height: "auto" }} />
          </div>
        </a>
      ))}
    </div>
  );
}

/* ============== Página principal ============== */
export default function AdminDashboard() {
  const [surveys, setSurveys] = useState([]);
  const [branches, setBranches] = useState([]);
  const [profiles, setProfiles] = useState([]);

  const [qSurvey, setQSurvey] = useState("");
  const [qBranch, setQBranch] = useState("");

  const [openNewSurvey, setOpenNewSurvey] = useState(false);
  const [editSurvey, setEditSurvey] = useState(null);

  const [newBranchOpen, setNewBranchOpen] = useState(false);
  const [editBranch, setEditBranch] = useState(null);

  const [toast, setToast] = useState(null);
  const [confirm, setConfirm] = useState({ open: false });

  const [qr, setQr] = useState({ open: false, url: "" });

  const filteredSurveys = useMemo(() => {
    const q = qSurvey.trim().toLowerCase();
    if (!q) return surveys;
    return surveys.filter(
      (s) =>
        (s.title || "").toLowerCase().includes(q) ||
        (s.form_url || "").toLowerCase().includes(q) ||
        (s.branch_code || "").toLowerCase().includes(q)
    );
  }, [qSurvey, surveys]);

  const branchesWithProfile = useMemo(() => {
    return branches.map((b) => {
      const p = profiles.find((x) => x.branch_code === b.code);
      return { ...b, email: p?.email || "—", temp_password: p?.temp_password || "" };
    });
  }, [branches, profiles]);

  const filteredBranches = useMemo(() => {
    const q = qBranch.trim().toLowerCase();
    if (!q) return branchesWithProfile;
    return branchesWithProfile.filter(
      (b) =>
        (b.name || "").toLowerCase().includes(q) ||
        (b.code || "").toLowerCase().includes(q) ||
        (b.email || "").toLowerCase().includes(q)
    );
  }, [qBranch, branchesWithProfile]);

  const load = async () => {
    const [{ data: s }, { data: b }, { data: p }] = await Promise.all([
      supabase.from("surveys").select("*").order("created_at", { ascending: false }),
      supabase.from("branches").select("code,name").order("name", { ascending: true }),
      supabase.from("profiles").select("email,branch_code,temp_password"),
    ]);
    setSurveys(s || []);
    setBranches(b || []);
    setProfiles(p || []);
  };

  useEffect(() => {
    document.body.classList.add("skin-admin");
    load();
    return () => document.body.classList.remove("skin-admin");
  }, []);

  /* ====== Encuestas: Acciones ====== */
  const askDeleteSurvey = (id) =>
    setConfirm({
      open: true,
      title: "Eliminar encuesta",
      message: "¿Seguro que querés eliminar esta encuesta?",
      onConfirm: async () => {
        setConfirm({ open: false });
        const { error } = await supabase.from("surveys").delete().eq("id", id);
        if (error) setToast({ type: "error", msg: error.message });
        else {
          setToast({ type: "success", msg: "Encuesta eliminada." });
          load();
        }
      },
      onCancel: () => setConfirm({ open: false }),
    });

  /* ====== Sucursales: Acciones ====== */
  const askDeleteBranch = (b) =>
    setConfirm({
      open: true,
      title: `Eliminar ${b.name}`,
      message:
        "Si la sucursal tiene usuarios o encuestas vinculadas no se podrá eliminar. ¿Querés continuar?",
      onConfirm: async () => {
        setConfirm({ open: false });
        const { error } = await supabase.from("branches").delete().eq("code", b.code);
        if (error) {
          if (String(error.message).includes("foreign key"))
            setToast({
              type: "error",
              msg:
                "No se puede eliminar: hay datos relacionados (perfiles/encuestas). Eliminalos primero.",
            });
          else setToast({ type: "error", msg: error.message });
        } else {
          setToast({ type: "success", msg: "Sucursal eliminada." });
          load();
        }
      },
      onCancel: () => setConfirm({ open: false }),
    });

  return (
    <>
      <Topbar />

      <main className="container" style={{ maxWidth: 1260, margin: "0 auto", padding: "18px 12px 64px" }}>
        <div className="admin-grid">
          {/* ===== Columna izquierda ===== */}
          <div className="admin-main">
            {/* ENCUESTAS */}
            <h2 className="survey-title" style={{ marginTop: 8 }}>Encuesta</h2>

            <div className="section-header">
              <div />
              <div className="actions-header">
                <input
                  className="input search"
                  placeholder="Buscar encuesta…"
                  value={qSurvey}
                  onChange={(e) => setQSurvey(e.target.value)}
                />
                <button className="btn-chip pink" onClick={() => { setEditSurvey(null); setOpenNewSurvey(true); }}>
                  +
                </button>
              </div>
            </div>

            <div className="table-wrap">
              <table className="table table-surveys">
                <thead>
                  <tr>
                    <th>Descripción</th>
                    <th className="centered">Link</th>       {/* 👉 centrado */}
                    <th className="centered">Acciones</th>   {/* 👉 centrado */}
                  </tr>
                </thead>
                <tbody>
                  {filteredSurveys.length === 0 && (
                    <EmptyRow colSpan={3}>No hay encuestas cargadas.</EmptyRow>
                  )}
                  {filteredSurveys.map((s) => (
                    <tr key={s.id}>
                      <td>
                        <div style={{ fontWeight: 700 }}>{s.title}</div>
                        {/* (eliminado subtítulo "Sucursal ...") */}
                      </td>
                      <td className="centered">
                        <a href={s.form_url} target="_blank" rel="noreferrer">
                          {s.form_url}
                        </a>
                      </td>
                      <td className="centered">
                        <div className="actions">
                          <button
                            className="iconbtn"
                            title="QR"
                            aria-label="QR"
                            onClick={() => setQr({ open: true, url: s.form_url })}
                          >
                            <IconQR />
                          </button>
                          <button
                            className="iconbtn"
                            title="Editar"
                            aria-label="Editar"
                            onClick={() => { setEditSurvey(s); setOpenNewSurvey(true); }}
                          >
                            <IconEdit />
                          </button>
                          <button
                            className="iconbtn danger"
                            title="Eliminar"
                            aria-label="Eliminar"
                            onClick={() => askDeleteSurvey(s.id)}
                          >
                            <IconTrash />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* SUCURSALES */}
            <h2 className="survey-title" style={{ marginTop: 34 }}>Sucursales</h2>

            <div className="section-header">
              <div />
              <div className="actions-header">
                <input
                  className="input search"
                  placeholder="Buscar sucursal…"
                  value={qBranch}
                  onChange={(e) => setQBranch(e.target.value)}
                />
                <button className="btn-chip pink" onClick={() => { setEditBranch(null); setNewBranchOpen(true); }}>
                  +
                </button>
              </div>
            </div>

            <div className="table-wrap">
              <table className="table">
                <thead>
                  <tr>
                    <th>Sucursal</th>
                    <th>Usuario</th>
                    <th>Contraseña</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredBranches.length === 0 && <EmptyRow colSpan={4}>Aún sin sucursales registradas.</EmptyRow>}

                  {filteredBranches.map((b) => (
                    <tr key={b.code}>
                      <td>
                        <a href={`/sucursal/${encodeURIComponent(b.code)}/experience`} className="link">
                          {b.name}
                        </a>
                      </td>
                      <td>{b.email}</td>
                      <td>
                        {b.temp_password ? (
                          <Masked value={b.temp_password} />
                        ) : (
                          <span className="muted">—</span>
                        )}
                      </td>
                      <td>
                        <div className="actions">
                          <button className="pill" onClick={() => { setEditBranch(b); setNewBranchOpen(true); }}>
                            Editar
                          </button>
                          <button className="pill" onClick={() => askDeleteBranch(b)}>
                            Eliminar
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* ===== Columna derecha ===== */}
          <aside className="admin-aside">
            <div className="aside-title">
              <h2>Sucursales</h2>
              <p>Acceso Rápido</p>
            </div>
            <QuickCards branches={branches} />
          </aside>
        </div>
      </main>

      {/* ===== Modales ===== */}
      <SurveyForm
        open={openNewSurvey}
        onClose={() => setOpenNewSurvey(false)}
        onSaved={load}
        initial={editSurvey || undefined}
      />

      <BranchForm
        open={newBranchOpen}
        onClose={() => setNewBranchOpen(false)}
        onSaved={load}
        initial={editBranch || undefined}
      />

      <QRModal open={qr.open} url={qr.url} onClose={() => setQr({ open: false, url: "" })} />

      <ConfirmDialog
        open={confirm.open}
        title={confirm.title}
        message={confirm.message}
        onCancel={confirm.onCancel}
        onConfirm={confirm.onConfirm}
      />

      {toast && <Toast type={toast.type} onClose={() => setToast(null)}>{toast.msg}</Toast>}
    </>
  );
}

/* ============== Componente pequeño para ver/ocultar contraseñas ============== */
function Masked({ value }) {
  const [show, setShow] = useState(false);
  return (
    <div style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
      <PrettyCode>{show ? value : "•".repeat(Math.min(value.length, 8))}</PrettyCode>
      <button className="pill" onClick={() => setShow((s) => !s)}>{show ? "Ocultar" : "Ver"}</button>
    </div>
  );
}
