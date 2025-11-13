import React from "react";

/* Barras horizontales minimalistas */
export default function MiniBars({ title = "Resumen", data = [] }) {
  const safe = data.map(d => ({ label: d.label, pct: Math.max(0, Math.min(100, Number(d.pct) || 0)) }));
  return (
    <section className="cx-card">
      <h3 className="cx-card__title">{title}</h3>
      <ul className="cx-bars">
        {safe.length === 0 ? (
          <li className="cx-bars__empty">Sin datos para graficar aún.</li>
        ) : (
          safe.map((d) => (
            <li className="cx-bar" key={d.label}>
              <span className="cx-bar__label">{d.label}</span>
              <div className="cx-bar__track">
                <div className="cx-bar__fill" style={{ width: `${d.pct}%` }} />
              </div>
              <span className="cx-bar__pct">{d.pct}%</span>
            </li>
          ))
        )}
      </ul>
    </section>
  );
}
