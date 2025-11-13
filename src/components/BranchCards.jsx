// src/components/BranchCards.jsx
import React from 'react';

export default function BranchCards({ branches = [], onOpen = () => {}, Logo = null }) {
  return (
    <aside className="admin-aside">
      <div className="aside-title">
        <h2>Sucursales</h2>
        <p>Acceso Rápido</p>
      </div>

      {branches.length === 0 ? (
        <div className="empty-aside">
          Aún no hay sucursales agregadas.
        </div>
      ) : (
        <div className="quick-stack">
          {branches.map((b) => (
            <button
              key={b.id ?? b.code}
              className="quick-tile"
              onClick={() => onOpen(b)}
              title={`${b.name} • ${b.code}`}
            >
              <div className="qt-text">
                <div className="qt-line1">Suc</div>
                <div className="qt-line2">{b.name}</div>
              </div>

              <div className="qt-logoBox">
                {Logo ? <Logo /> : <div className="qt-logoFallback">Fran Analytics</div>}
              </div>
            </button>
          ))}
        </div>
      )}
    </aside>
  );
}
