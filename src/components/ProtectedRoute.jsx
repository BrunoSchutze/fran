import { useEffect, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";

export default function ProtectedRoute({ children, allowedRoles = [] }) {
  const [state, setState] = useState({
    loading: true,
    allow: false,
    reason: "",
    profile: null,
  });
  const location = useLocation();

  useEffect(() => {
    let mounted = true;
    (async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        if (mounted) setState({ loading: false, allow: false, reason: "no-session", profile: null });
        return;
      }
      const { data: profile, error } = await supabase
        .from("profiles")
        .select("role, branch_code")
        .eq("id", session.user.id)
        .maybeSingle();

      if (error) {
        if (mounted) setState({ loading: false, allow: false, reason: "profile-error", profile: null });
        return;
      }
      const ok = allowedRoles.length === 0 || (profile && allowedRoles.includes(profile.role));
      if (mounted) setState({ loading: false, allow: ok, reason: profile ? "" : "no-profile", profile });
    })();
    return () => { mounted = false; };
  }, [allowedRoles]);

  if (state.loading) {
    return (
      <div style={{ minHeight: "60vh", display: "grid", placeItems: "center" }}>
        Cargando…
      </div>
    );
  }

  if (!state.allow) {
    if (state.reason === "no-profile" || state.reason === "profile-error") {
      return (
        <div style={{ padding: 24, maxWidth: 560, margin: "40px auto", textAlign: "center" }}>
          <h2>Tu perfil no está configurado</h2>
          <p>
            Falta tu fila en <code>profiles</code> o el rol no es válido.
            Pedile al admin que te asigne <b>role</b> y, si sos branch, <b>branch_code</b>.
          </p>
          <button
            onClick={() => supabase.auth.signOut()}
            style={{ padding: "10px 14px", borderRadius: 10, border: "1px solid #ddd", cursor: "pointer" }}
          >
            Cerrar sesión
          </button>
        </div>
      );
    }
    return <Navigate to="/" replace state={{ from: location }} />;
  }

  return children;
}
