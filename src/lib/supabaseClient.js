import { createClient } from "@supabase/supabase-js";

const url  = import.meta.env.VITE_SUPABASE_URL;
const anon = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Singleton para evitar "Multiple GoTrueClient instances" con Vite/HMR
if (!globalThis.__supabase) {
  console.log("SUPABASE URL:", url);
  console.log("SUPABASE ANON (inicio):", anon?.slice(0, 12));

  globalThis.__supabase = createClient(url, anon, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      // storageKey único para que no se pisen sesiones entre builds
      storageKey: "sb-francafe-auth",
    },
  });
}

export const supabase = globalThis.__supabase;
