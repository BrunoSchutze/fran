import { useMemo, useState } from "react";
import "./sales-panel.css";

const fmt = (n) =>
  new Intl.NumberFormat("es-AR", { style: "currency", currency: "ARS", maximumFractionDigits: 2 }).format(n);

export default function SalesPanel({
  modeDefault = "rango",                                  // "turno" | "rango"
  periodDefault = "semana_anterior",                      // opciones del select
  data = {
    // Datos por defecto (podés pasarlos desde tu fetch)
    rango: { label: "Semana Anterior", bruto: 4196900, descuentos: -153125, total: 4043775 },
    mes_anterior: { label: "Mes anterior", bruto: 18574850, descuentos: -707237.32, total: 17867612.68 },
    turno_pm: { label: "sábado, 27 de septiembre de 2025 - TURNO PM", bruto: 413250, descuentos: -8220, total: 405030 },
  },
  onRefresh,
  onPrint,
}) {
  const [mode, setMode] = useState(modeDefault);          // "turno" | "rango"
  const [period, setPeriod] = useState(periodDefault);    // clave del objeto data

  const current = useMemo(() => {
    // Mapping simple para ejemplo
    if (mode === "turno") return data.turno_pm;
    if (period === "mes_anterior") return data.mes_anterior;
    return data.rango;
  }, [mode, period, data]);

  return (
    <section className="sp-wrap">
      {/* Head: Toggle & Select & Refresh */}
      <div className="sp-toolbar">
        <div className="sp-toggle" role="tablist" aria-label="Modo de consulta">
          <button
            role="tab"
            aria-selected={mode === "turno"}
            className={`sp-toggle__btn ${mode === "turno" ? "is-active" : ""}`}
            onClick={() => setMode("turno")}
          >
            Turno
          </button>
          <button
            role="tab"
            aria-selected={mode === "rango"}
            className={`sp-toggle__btn ${mode === "rango" ? "is-active" : ""}`}
            onClick={() => setMode("rango")}
          >
            Rango
          </button>
        </div>

        {mode === "rango" ? (
          <select
            className="sp-select"
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
            aria-label="Período"
          >
            <option value="semana_anterior">Semana Anterior</option>
            <option value="mes_anterior">Mes anterior</option>
          </select>
        ) : (
          <select className="sp-select" value="turno_pm" readOnly aria-label="Turno">
            <option value="turno_pm">{data.turno_pm?.label || "Turno"}</option>
          </select>
        )}

        <button className="sp-iconbtn" onClick={onRefresh} aria-label="Actualizar">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
               strokeLinecap="round" strokeLinejoin="round" width="22" height="22">
            <polyline points="23 4 23 10 17 10"></polyline>
            <polyline points="1 20 1 14 7 14"></polyline>
            <path d="M3.51 9a9 9 0 0 1 14.13-3.36L23 10"></path>
            <path d="M20.49 15A9 9 0 0 1 6.36 18.36L1 14"></path>
          </svg>
        </button>
      </div>

      {/* Title + Comanda */}
      <div className="sp-header">
        <h2 className="sp-title">
          Resumen de ventas del {mode === "rango" ? "Rango" : "Turno"}
        </h2>
        <button className="sp-cta" onClick={onPrint}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
               strokeLinecap="round" strokeLinejoin="round" width="20" height="20" aria-hidden="true">
            <path d="M6 9V2h12v7"></path>
            <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path>
            <path d="M6 14h12v8H6z"></path>
          </svg>
          <span>Comanda</span>
        </button>
      </div>

      {/* Tabla/Resumen */}
      <div className="sp-card">
        <div className="sp-row">
          <div className="sp-key">Total Venta Bruta:</div>
          <div className="sp-val">{fmt(current.bruto)}</div>
        </div>
        <div className="sp-row sp-row--muted">
          <div className="sp-key">Total Descuentos:</div>
          <div className="sp-val">{fmt(current.descuentos)}</div>
        </div>
        <div className="sp-row sp-row--total">
          <div className="sp-key">Total Venta Bruta:</div>
          <div className="sp-val">{fmt(current.total)}</div>
        </div>
      </div>
    </section>
  );
}
