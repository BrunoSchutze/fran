import { BRANCHES } from "./branches.js";

const rnd = (min, max) => Math.round(min + Math.random() * (max - min));

export const KPI = {
  dailyTargets: BRANCHES.map((b) => ({
    code: b.code,
    name: b.name,
    now: rnd(600000, 950000),
    total: 1252635,
    pct: rnd(35, 65),
  })),
  weekly:  { collected: 1467210, target: 3467210, pct: 33,  avgTicket: 22300 },
  monthly: { collected: 3467210, target: 7467210, pct: 55 },
  nps: 72,
  contact: 61,
};

export default KPI;
