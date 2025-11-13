// src/data/branches.js
export const branches = [
  { code: "belgrano", name: "Av. Belgrano" },
  { code: "torreon",  name: "Estación Torreón" },
  { code: "piazza",   name: "Galería Piazza" },
  { code: "mendoza",  name: "Mendoza Shopping" },
  { code: "tunuyan",  name: "La bodega Tunuyán" },
];

// Mock para KPIs de demo (podés reemplazar por datos de Supabase cuando quieras)
export const KPI = {
  dailyTargets: branches.map((b) => ({
    code: b.code,
    name: b.name,
    now: Math.round(600_000 + Math.random() * 300_000),
    total: 1_252_635,
    pct: Math.round(40 + Math.random() * 20),
  })),
  weekly:  { collected: 1_467_210, target: 3_467_210, pct: 33 },
  monthly: { collected: 3_467_210, target: 7_467_210, pct: 55 },
  avgTicket: 22_300,
  nps: 72,
  contact: 61,
};
