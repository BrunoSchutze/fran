// src/components/Topbar.jsx
import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";
import FranLogo from "./FranLogo";
import DataModal from "./DataModal";
import "./topbar.css";

export default function Topbar() {
  const navigate = useNavigate();
  const { code = "" } = useParams();

  const isBranchView = !!code;
  const [isAdminRole, setIsAdminRole] = useState(false);
  const [openData, setOpenData] = useState(false);

  useEffect(() => {
    let mounted = true;
    (async () => {
      const { data: auth } = await supabase.auth.getUser();
      const uid = auth?.user?.id;
      if (!uid) { if (mounted) setIsAdminRole(false); return; }
      const { data } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", uid)
        .maybeSingle();
      if (!mounted) return;
      setIsAdminRole((data?.role || "").toLowerCase() === "admin");
    })();
    return () => { mounted = false; };
  }, []);

  // Nombre fijo de la sucursal
  const branchName = "Piazza";

  const goHome = () =>
    navigate(isBranchView ? `/sucursal/${encodeURIComponent(code)}` : "/dashboard");
  const goAdmin = () => navigate("/dashboard");
  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      navigate("/");
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <>
      <header className="topbar">
        <div className="topbar__inner">
          {/* Izquierda: logo */}
          <div className="topbar__left">
            <div className="topbar__brand" onClick={goHome} role="button" title="Ir al inicio">
              <FranLogo wordmarkHeight={32} compact />
            </div>
          </div>

          {/* Derecha */}
          <div className="topbar__right">
            {isBranchView && isAdminRole && (
              <>
                {/* Volver al panel */}
                <button
                  className="topbar__iconbtn"
                  title="Volver al Panel de control"
                  aria-label="Volver al Panel de control"
                  onClick={goAdmin}
                >
                  <svg
                    width="18" height="18" viewBox="0 0 24 24"
                    fill="none" stroke="currentColor" strokeWidth="1.8"
                    strokeLinecap="round" strokeLinejoin="round"
                  >
                    <rect x="3" y="3" width="7" height="7" rx="1.6"></rect>
                    <rect x="14" y="3" width="7" height="7" rx="1.6"></rect>
                    <rect x="14" y="14" width="7" height="7" rx="1.6"></rect>
                    <rect x="3" y="14" width="7" height="7" rx="1.6"></rect>
                  </svg>
                </button>

                {/* Abrir modal de datos */}
                <button
                  className="topbar__iconbtn"
                  title="Ver datos recientes"
                  aria-label="Ver datos recientes"
                  onClick={() => setOpenData(true)}
                >
                  <svg
                    width="18" height="18" viewBox="0 0 24 24"
                    fill="none" stroke="currentColor" strokeWidth="1.8"
                    strokeLinecap="round" strokeLinejoin="round"
                  >
                    <rect x="3" y="3" width="18" height="18" rx="2"></rect>
                    <line x1="3" y1="9" x2="21" y2="9"></line>
                    <line x1="9" y1="3" x2="9" y2="21"></line>
                    <line x1="15" y1="3" x2="15" y2="21"></line>
                    <line x1="3" y1="15" x2="21" y2="15"></line>
                  </svg>
                </button>
              </>
            )}

            {/* Salir como ícono (pegado a los otros) */}
            <button
              className="topbar__iconbtn"
              title="Salir"
              aria-label="Salir"
              onClick={handleLogout}
            >
              {/* Power icon */}
              <svg
                width="18" height="18" viewBox="0 0 24 24"
                fill="none" stroke="currentColor" strokeWidth="1.8"
                strokeLinecap="round" strokeLinejoin="round"
              >
                <path d="M12 2v10"></path>
                <path d="M5.5 5.5a7.5 7.5 0 1 0 13 0"></path>
              </svg>
            </button>

            {/* Chip sucursal (solo vista sucursal) */}
            {isBranchView && (
              <span className="topbar__chip">
                Sucursal: <strong>{branchName || "—"}</strong>
              </span>
            )}

            
          </div>
        </div>
      </header>

      {/* Modal de datos */}
      <DataModal open={openData} onClose={() => setOpenData(false)} branchCode={code || "belgrano"} />
    </>
  );
}