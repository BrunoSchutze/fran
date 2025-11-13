import { useEffect } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";

export default function QrRedirect(){
  const { surveyId } = useParams();

  useEffect(() => {
    (async () => {
      // 1) Busca el link actual del formulario
      const { data, error } = await supabase
        .from("surveys").select("form_url, branch_code")
        .eq("id", surveyId).maybeSingle();

      // 2) Log del escaneo (opcional pero recomendado)
      await supabase.from("qr_scans").insert({
        survey_id: surveyId,
        referer: document.referrer || null,
        user_agent: navigator.userAgent || null,
      });

      // 3) Redirige
      const url = data?.form_url || "/";
      window.location.replace(url);
    })();
  }, [surveyId]);

  return <div style={{padding:24}}>Redirigiendo…</div>;
}
