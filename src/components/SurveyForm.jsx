import { useEffect, useMemo, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import Modal from "./Modal";
import Toast from "./Toast";

/** Extrae el ID de Tally de distintas URLs válidas */
function parseTallyId(url) {
  if (!url) return "";
  try {
    const u = new URL(url);
    // formatos vistos: /r/<id>, /forms/<id>, /form/<id>
    const parts = u.pathname.split("/").filter(Boolean);
    const i = parts.findIndex(p => p === "r" || p === "forms" || p === "form");
    if (i >= 0 && parts[i + 1]) return parts[i + 1];
    // si pegan solo el ID
    if (/^[A-Za-z0-9]+$/.test(url)) return url;
  } catch {}
  return "";
}

/** slug corto para qr_links.token */
function randomToken(n = 6) {
  return Math.random().toString(36).slice(2, 2 + n);
}

export default function SurveyForm({ open, onClose, onSaved, initial }) {
  const editing = !!initial;

  const [branches, setBranches] = useState([]);
  const [branchCode, setBranchCode] = useState(initial?.branch_code || "");
  const [title, setTitle] = useState(initial?.title || "Encuesta de satisfacción");
  const [formUrl, setFormUrl] = useState(initial?.form_url || "");
  const [tallyId, setTallyId] = useState(initial?.tally_form_id || "");
  const [tallySecret, setTallySecret] = useState(initial?.tally_secret || "");
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);
  const [copied, setCopied] = useState(false);

  // Carga sucursales una vez
  useEffect(() => {
    if (!open) return;
    (async () => {
      const { data } = await supabase.from("branches").select("code,name").order("name");
      setBranches(data || []);
    })();
  }, [open]);

  // Reset cuando se abre/cambia initial
  useEffect(() => {
    if (!open) return;
    setBranchCode(initial?.branch_code || "");
    setTitle(initial?.title || "Encuesta de satisfacción");
    setFormUrl(initial?.form_url || "");
    setTallyId(initial?.tally_form_id || "");
    setTallySecret(initial?.tally_secret || "");
    setCopied(false);
    setToast(null);
  }, [open, initial]);

  // Detecta Tally ID cuando se pega la URL
  useEffect(() => {
    const id = parseTallyId(formUrl);
    if (id && !tallyId) setTallyId(id);
  }, [formUrl]); // eslint-disable-line

  const webhookUrl = useMemo(() => {
    // URL de tu Edge Function (ajústalo si el nombre es otro)
    const base = import.meta.env.VITE_FUNCTIONS_BASE || "";
    // ejemplo: https://<project>.functions.supabase.co/tally-webhook
    if (!base) return "";
    const params = new URLSearchParams();
    if (branchCode) params.set("branch_code", branchCode);
    if (tallyId) params.set("form_id", tallyId);
    return `${base.replace(/\/$/, "")}/tally-webhook?${params.toString()}`;
  }, [branchCode, tallyId]);

  const copyWebhook = async () => {
    try {
      await navigator.clipboard.writeText(webhookUrl);
      setCopied(true);
      setToast({ type: "success", msg: "Webhook copiado. Pegalo en Tally → Integraciones → Webhooks." });
      setTimeout(() => setCopied(false), 1500);
    } catch {
      setToast({ type: "error", msg: "No se pudo copiar al portapapeles." });
    }
  };

  const onSave = async () => {
    if (!branchCode) return setToast({ type: "error", msg: "Seleccioná la sucursal." });
    if (!title.trim()) return setToast({ type: "error", msg: "Ingresá el nombre de la encuesta." });
    if (!formUrl.trim()) return setToast({ type: "error", msg: "Pegá la URL de la encuesta." });

    // valida Tally ID si la URL es de Tally
    const id = parseTallyId(formUrl);
    if (!tallyId && id) setTallyId(id);

    setLoading(true);
    try {
      // 1) Upsert survey
      let surveyId = initial?.id || null;
      if (surveyId) {
        const { error } = await supabase
          .from("surveys")
          .update({
            branch_code: branchCode,
            title: title.trim(),
            form_url: formUrl.trim(),
            tally_form_id: tallyId || id || null,
            tally_secret: tallySecret || null
          })
          .eq("id", surveyId);
        if (error) throw error;
      } else {
        const { data, error } = await supabase
          .from("surveys")
          .insert({
            branch_code: branchCode,
            title: title.trim(),
            form_url: formUrl.trim(),
            tally_form_id: tallyId || id || null,
            tally_secret: tallySecret || null
          })
          .select("id")
          .single();
        if (error) throw error;
        surveyId = data.id;
      }

      // 2) Asegurar qr_links (un QR por encuesta)
      // Estructura vista en tu esquema: qr_links(id uuid, survey_id uuid, branch_code text, token text, target_url text, created_at)
      const { data: exists } = await supabase
        .from("qr_links")
        .select("id")
        .eq("survey_id", surveyId)
        .maybeSingle();

      if (!exists) {
        const token = randomToken(7);
        const { error: e2 } = await supabase.from("qr_links").insert({
          survey_id: surveyId,
          branch_code: branchCode,
          token,
          target_url: formUrl.trim()
        });
        if (e2) throw e2;
      }

      setToast({ type: "success", msg: editing ? "Encuesta actualizada." : "Encuesta creada." });
      setTimeout(() => {
        onClose?.();
        onSaved?.();
      }, 700);
    } catch (err) {
      setToast({ type: "error", msg: err?.message || "No se pudo guardar la encuesta." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Modal open={open} title={editing ? "Editar encuesta" : "Nueva encuesta"} onClose={onClose}>
        <div className="form-grid">
          {/* Sucursal */}
          <select className="input select" value={branchCode} onChange={(e) => setBranchCode(e.target.value)}>
            <option value="">Seleccioná sucursal…</option>
            {branches.map((b) => (
              <option key={b.code} value={b.code}>
                {b.name} ({b.code})
              </option>
            ))}
          </select>

          {/* Nombre */}
          <input
            className="input"
            placeholder="Nombre de la encuesta"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />

          {/* URL de la encuesta (renombrado) */}
          <input
            className="input"
            placeholder="URL de la encuesta (Tally u otro)"
            value={formUrl}
            onChange={(e) => setFormUrl(e.target.value)}
          />

          {/* Detalles de Tally (automático) */}
          <div className="field-group" style={{ display: "grid", gap: 8 }}>
            <label className="muted" style={{ fontSize: 12 }}>
              Integración Tally (opcional, se completa sola si pegás un link de Tally)
            </label>
            <div style={{ display: "grid", gap: 8, gridTemplateColumns: "1fr 1fr" }}>
              <input
                className="input"
                placeholder="Tally Form ID (ej: wvQJWQ)"
                value={tallyId}
                onChange={(e) => setTallyId(e.target.value)}
              />
              <input
                className="input"
                placeholder="Tally Secret (opcional, valida webhook)"
                value={tallySecret}
                onChange={(e) => setTallySecret(e.target.value)}
              />
            </div>

            <div style={{ display: "grid", gap: 6 }}>
              <label className="muted" style={{ fontSize: 12 }}>
                Webhook URL para Tally (copiala y pegala en Tally → Integraciones → Webhooks)
              </label>
              <div style={{ display: "grid", gap: 8, gridTemplateColumns: "1fr auto" }}>
                <input className="input" readOnly value={webhookUrl} />
                <button type="button" className="pill" onClick={copyWebhook} disabled={!webhookUrl}>
                  {copied ? "Copiado" : "Copiar"}
                </button>
              </div>
            </div>
          </div>

          <button className="btn" onClick={onSave} disabled={loading}>
            {loading ? "Guardando…" : "Guardar"}
          </button>
        </div>
      </Modal>

      {toast && (
        <Toast type={toast.type} onClose={() => setToast(null)}>
          {toast.msg}
        </Toast>
      )}
    </>
  );
}
