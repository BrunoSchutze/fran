import { useEffect, useRef, useState } from "react";

/**
 * Hace draggable un elemento con position:fixed, limitado al viewport.
 * - Centra el elemento al montar (midiento su tamaño real).
 * - Permite arrastrar desde cualquier parte del card.
 * - Evita arrastrar cuando el target es interactivo (button, input, a, select, textarea)
 *   o cuando tiene el atributo data-nodrag.
 * - Bloquea el user-select mientras se arrastra.
 */
export function useDraggable({ enabled = true, margin = 12 } = {}) {
  const ref = useRef(null);
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const [dragging, setDragging] = useState(false);
  const offset = useRef({ x: 0, y: 0 });

  // Centrar al montar
  useEffect(() => {
    if (!enabled) return;
    const el = ref.current;
    if (!el) return;
    // Esperar a layout real
    requestAnimationFrame(() => {
      const rect = el.getBoundingClientRect();
      const x = Math.max((window.innerWidth - rect.width) / 2, margin);
      const y = Math.max((window.innerHeight - rect.height) / 2, margin);
      setPos({ x, y });
    });
  }, [enabled, margin]);

  // Mantener dentro del viewport al redimensionar
  useEffect(() => {
    if (!enabled) return;
    function onResize() {
      const el = ref.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const maxX = Math.max(window.innerWidth - rect.width - margin, margin);
      const maxY = Math.max(window.innerHeight - rect.height - margin, margin);
      setPos(p => ({
        x: Math.min(Math.max(p.x, margin), maxX),
        y: Math.min(Math.max(p.y, margin), maxY),
      }));
    }
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [enabled, margin]);

  const start = (e) => {
    if (!enabled) return;
    const el = ref.current;
    if (!el) return;

    // Evitar arrastrar si el target es interactivo
    const tag = (e.target.tagName || "").toLowerCase();
    const isInteractive = /(button|a|input|select|textarea|label)$/i.test(tag) || e.target.closest("[data-nodrag]");
    if (isInteractive) return;

    const clientX = e.clientX ?? (e.touches && e.touches[0]?.clientX) ?? 0;
    const clientY = e.clientY ?? (e.touches && e.touches[0]?.clientY) ?? 0;
    const rect = el.getBoundingClientRect();
    offset.current = { x: clientX - rect.left, y: clientY - rect.top };
    setDragging(true);
    document.body.style.userSelect = "none";
  };

  const move = (e) => {
    if (!enabled || !dragging) return;
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const w = rect.width;
    const h = rect.height;

    const clientX = e.clientX ?? (e.touches && e.touches[0]?.clientX) ?? 0;
    const clientY = e.clientY ?? (e.touches && e.touches[0]?.clientY) ?? 0;

    let nx = clientX - offset.current.x;
    let ny = clientY - offset.current.y;

    const minX = margin, minY = margin;
    const maxX = Math.max(window.innerWidth - w - margin, margin);
    const maxY = Math.max(window.innerHeight - h - margin, margin);

    nx = Math.min(Math.max(nx, minX), maxX);
    ny = Math.min(Math.max(ny, minY), maxY);

    setPos({ x: nx, y: ny });
  };

  const end = () => {
    if (!dragging) return;
    setDragging(false);
    document.body.style.userSelect = "";
  };

  return { ref, pos, dragging, start, move, end };
}
