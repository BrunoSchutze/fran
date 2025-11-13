import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";
import FranLogo from "../components/FranLogo";
import "./Login.css";

const ICON_COLOR = "#E9CDCB";

export default function Login() {
  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const redirected = useRef(false);

  // Redirige según perfil
  const routeAccordingToProfile = async () => {
    try {
      const { data: userData, error: userErr } = await supabase.auth.getUser();
      if (userErr || !userData?.user) {
        navigate("/", { replace: true });
        return;
      }
      const uid = userData.user.id;

      const { data: profile, error: profErr } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", uid)
        .single();

      if (profErr || !profile) {
        navigate("/", { replace: true });
        return;
      }

      const role = String(profile.role || "").toLowerCase();
      const branchCode =
        profile.code ||
        profile.branch_code ||
        profile.sucursal_code ||
        profile.store_code ||
        profile.codigo ||
        profile.slug ||
        "";

      if (role === "admin" || role === "superadmin") {
        navigate("/dashboard", { replace: true });
        return;
      }

      if (role === "branch" && branchCode) {
        navigate(`/sucursal/${encodeURIComponent(branchCode)}/experience`, {
          replace: true,
        });
        return;
      }

      navigate("/", { replace: true });
    } catch (err) {
      console.error("Error routing:", err);
      navigate("/", { replace: true });
    }
  };

  // Si ya hay sesión, redirige
  useEffect(() => {
    let mounted = true;
    supabase.auth.getSession().then(({ data }) => {
      if (!mounted) return;
      if (data.session && !redirected.current) {
        redirected.current = true;
        routeAccordingToProfile();
      }
    });
    return () => {
      mounted = false;
    };
  }, []);

  // Login
  const onSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password: pass,
    });

    setLoading(false);

    if (error) {
      setError(error.message || "No se pudo iniciar sesión");
      return;
    }

    routeAccordingToProfile();
  };

  return (
    <div className="auth-page">{/* 👈 Wrapper para el fondo con mosaico */}
      <div className="login-wrap login-center">
        <div className="login-card">
          <div className="login-brand login-logo">
            <FranLogo wordmarkHeight={64} compact />
          </div>

          <h1 className="login-title">INICIAR SESIÓN</h1>

          <form className="login-form" onSubmit={onSubmit} noValidate>
            {/* EMAIL */}
            <label className="input field">
              <span
                className="input__icon field__icon"
                aria-hidden="true"
                style={{ color: ICON_COLOR }}
              >
                <svg
                  width="22"
                  height="22"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <circle cx="12" cy="7" r="4" />
                  <path d="M20 21a8 8 0 1 0-16 0" />
                </svg>
              </span>
              <input
                type="email"
                autoComplete="username"
                placeholder="tu@fran.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="input__control field__input"
              />
            </label>

            {/* PASSWORD */}
            <label className="input field">
              <span
                className="input__icon field__icon"
                aria-hidden="true"
                style={{ color: ICON_COLOR }}
              >
                <svg
                  width="22"
                  height="22"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                  <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                </svg>
              </span>
              <input
                type="password"
                autoComplete="current-password"
                placeholder="Contraseña"
                value={pass}
                onChange={(e) => setPass(e.target.value)}
                required
                className="input__control field__input"
              />
            </label>

            {error && <div className="login-error">{error}</div>}

            <button type="submit" className="btn" disabled={loading}>
              {loading ? "Entrando…" : "Log in"}
            </button>

            <p className="login-legal login-disclaimer">
              Acceso exclusivo para personal autorizado de{" "}
              <strong>Fran Coffee Makers</strong>.
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
