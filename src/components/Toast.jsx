import { useEffect } from "react";

/** Props: type: 'success' | 'error' | 'info', onClose, children */
export default function Toast({ type = "info", onClose, children }) {
  useEffect(() => {
    const id = setTimeout(() => onClose?.(), 2500);
    return () => clearTimeout(id);
  }, [onClose]);

  return (
    <div className={`toast toast--${type}`}>
      <span className="toast__dot" />
      <span className="toast__msg">{children}</span>
      <button className="toast__x" onClick={onClose}>✕</button>
    </div>
  );
}
