export function calculateMetrics(responses = [], totalInvitations = 0) {
  const total = responses.length;
  const openedCount = responses.filter(r => r.opened).length;
  const startedCount = responses.filter(r => r.started).length;
  const completedCount = responses.filter(r => r.completed).length;

  const openRate =
    totalInvitations > 0 ? (openedCount / totalInvitations) * 100 : null;
  const responseRate = total > 0 ? (completedCount / total) * 100 : 0;
  const abandonmentRate =
    startedCount > 0
      ? ((startedCount - completedCount) / startedCount) * 100
      : 0;

  const npsValid = responses.filter(r => typeof r.nps_score === "number");
  const promoters = npsValid.filter(r => r.nps_score >= 4).length;
  const detractors = npsValid.filter(r => r.nps_score <= 2).length;
  const nps =
    npsValid.length > 0
      ? ((promoters / npsValid.length) - (detractors / npsValid.length)) * 100
      : null;

  const csatValid = responses.filter(r => typeof r.csat_score === "number");
  const csatAvg =
    csatValid.length > 0
      ? csatValid.reduce((s, r) => s + r.csat_score, 0) / csatValid.length
      : null;
  const csat = csatAvg !== null ? (csatAvg / 5) * 100 : null;

  return {
    totalResponses: total,
    openedCount,
    startedCount,
    completedCount,
    openRate,
    responseRate,
    abandonmentRate,
    nps,
    csat
  };
}
