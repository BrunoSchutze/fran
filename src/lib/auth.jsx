// src/lib/auth.jsx
import { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "./supabaseClient";

const AuthCtx = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    async function load() {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!mounted) return;
      setUser(user || null);

      if (user) {
        const { data } = await supabase
          .from("profiles")
          .select("email, role, branch_code")
          .eq("id", user.id)
          .maybeSingle();
        setProfile(data || null);
      } else {
        setProfile(null);
      }
      setLoading(false);
    }

    load();
    const { data: sub } = supabase.auth.onAuthStateChange(() => load());
    return () => { mounted = false; sub?.subscription?.unsubscribe?.(); };
  }, []);

  return (
    <AuthCtx.Provider value={{
      user,
      role: profile?.role || null,
      branch_code: profile?.branch_code || null,
      loading
    }}>
      {children}
    </AuthCtx.Provider>
  );
}

export function useAuth() {
  return useContext(AuthCtx);
}
