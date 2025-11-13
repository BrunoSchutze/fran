// src/lib/encuestaApi.js
export async function fetchEncuesta() {
  const url = import.meta.env.VITE_ENCUESTA_API
  const r = await fetch(url, { mode: 'cors', cache: 'no-store' })
  if (!r.ok) throw new Error(await r.text())
  return r.json()
}
