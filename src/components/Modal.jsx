// src/components/Modal.jsx
export default function Modal({ open, title, onClose, children }) {
  if (!open) return null;

  // Backdrop oscuro
  const backdrop = {
    position: 'fixed',
    inset: 0,
    background: 'rgba(0,0,0,.45)',
    display: 'grid',
    placeItems: 'center',
    zIndex: 40,
    padding: '18px',
  };

  // Marco externo que genera el “contorno” blanco
  // (un aro blanco + sombra profunda)
  const frame = {
    width: '100%',
    maxWidth: 520,
    borderRadius: 18,
    background: '#fff',
    boxShadow: '0 0 0 8px #fff, 0 26px 64px rgba(0,0,0,.35)',
  };

  // Tarjeta interna (contenido del modal)
  const card = {
    borderRadius: 14,
    border: '1px solid #eef1f6',
    background: '#fff',
    overflow: 'hidden',
  };

  const head = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '14px 16px',
    borderBottom: '1px solid #f0f2f6',
  };

  const titleStyle = { fontWeight: 800 };

  const closeBtn = {
    border: 'none',
    width: 36,
    height: 36,
    borderRadius: '50%',
    background: '#fff',
    color: '#333',
    fontSize: 18,
    cursor: 'pointer',
    boxShadow: '0 6px 16px rgba(0,0,0,.15)',
  };

  const body = { padding: 16 };

  return (
    <div style={backdrop} onClick={onClose} role="dialog" aria-modal="true" aria-label={title}>
      <div style={frame} onClick={(e) => e.stopPropagation()}>
        <div style={card}>
          <div style={head}>
            <strong style={titleStyle}>{title}</strong>
            <button style={closeBtn} onClick={onClose} aria-label="Cerrar">✕</button>
          </div>
          <div style={body}>{children}</div>
        </div>
      </div>
    </div>
  );
}
