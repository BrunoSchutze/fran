import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";
import toast, { Toaster } from "react-hot-toast";
import {
  Chart as ChartJS,
  CategoryScale, LinearScale, PointElement, LineElement,
  ArcElement, BarElement, Tooltip, Legend, Filler,
} from "chart.js";
import { Line, Doughnut, Bar } from "react-chartjs-2";
import Topbar from "../components/Topbar";
import DataModal from "../components/DataModal";
import "./CustomerExperience.css";

ChartJS.register(
  CategoryScale, LinearScale, PointElement, LineElement,
  ArcElement, BarElement, Tooltip, Legend, Filler
);
ChartJS.defaults.animation.duration = 900;
ChartJS.defaults.animation.easing = "easeOutQuart";

const PINK = "#ecdedd";
const PINK_DARK = "#d9caca";
const TXT = "#6b7280";

function HelpTip({ title, children }) {
  const [open, setOpen] = useState(false);
  return (
    <div style={{ position: "relative" }}>
      <button
        onClick={() => setOpen(o => !o)}
        title="¿Qué mide?"
        className="btn-help"
        style={{
          position: "relative", top: -6, border: "1px solid #e5e7eb",
          background: "#fff", borderRadius: 999, width: 28, height: 28,
          lineHeight: "26px", textAlign: "center", cursor: "pointer", fontWeight: 700,
        }}
      >?</button>
      {open && (
        <div
          onMouseLeave={() => setOpen(false)}
          style={{
            position: "absolute", right: 0, top: "calc(100% + 8px)", zIndex: 30, width: 320,
            background: "#fff", border: "1px solid #eef1f6", boxShadow: "0 18px 44px rgba(0,0,0,.18)",
            borderRadius: 12, padding: 12,
          }}
        >
          <strong style={{ display: "block", marginBottom: 6 }}>{title}</strong>
          <div style={{ fontSize: 13, color: "#374151" }}>{children}</div>
        </div>
      )}
    </div>
  );
}

function Star() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" style={{ verticalAlign: "-3px" }}>
      <path d="M12 2l2.9 6.1 6.7.6-5 4.4 1.5 6.6L12 16.9 5.9 19.7 7.4 13 2.4 8.7l6.7-.6L12 2z"
        fill="#fbbf24" stroke="#d39c15" strokeWidth="1" />
    </svg>
  );
}

export default function CustomerExperience() {
  const { code } = useParams();

  const [series, setSeries] = useState([]);
  const [stars, setStars] = useState(0);
  const [totResp, setTotResp] = useState(0);
  
  // Estados para las 3 métricas de marketing
  const [openRate, setOpenRate] = useState(0);
  const [responseRate, setResponseRate] = useState(0);
  const [abandonmentRate, setAbandonmentRate] = useState(0);

  const [showModal, setShowModal] = useState(false);

  async function load() {
    const from = new Date(); 
    from.setDate(from.getDate() - 6);
    const fromDate = from.toISOString().slice(0, 10);

    // Cargar métricas principales
    const { data: metricsData } = await supabase
      .from("v_experience_metrics")
      .select("*")
      .gte("day", fromDate)
      .eq("branch_code", code)
      .order("day");

    if (metricsData) {
      setSeries(metricsData);
      const agg = metricsData.reduce(
        (a, d) => ({
          total: a.total + (d.total || 0),
          sum: a.sum + (Number(d.avg_csat || 0) * (d.total || 0)),
        }),
        { total: 0, sum: 0 }
      );
      setStars(agg.total ? Number(agg.sum / agg.total).toFixed(1) : 0);
      setTotResp(metricsData.reduce((a, d) => a + (d.total || 0), 0));
    }

    // 📊 MÉTRICA 1: Tasa de Apertura
    // Rango realista: 75-88% (alta visibilidad del QR)
    const mockOpenRate = Math.floor(75 + Math.random() * 13);
    setOpenRate(mockOpenRate);

    // 📊 MÉTRICA 2: Tasa de Respuesta
    // Rango realista: 62-78% (buen engagement)
    const mockResponseRate = Math.floor(62 + Math.random() * 16);
    setResponseRate(mockResponseRate);

    // 📊 MÉTRICA 3: Tasa de Abandono
    // Rango realista: 2-7% MÁXIMO (formulario corto = poco abandono)
    const mockAbandonmentRate = Math.floor(2 + Math.random() * 5);
    setAbandonmentRate(mockAbandonmentRate);
  }

  // Realtime + alerta grande centrada
  useEffect(() => {
    load();

    const chResponses = supabase.channel("cx-resp")
      .on("postgres_changes",
        { event: "INSERT", schema: "public", table: "survey_responses", filter: `branch_code=eq.${code}` },
        ({ new: row }) => {
          const nps = row?.nps_score ?? "—";
          const csat = row?.csat_score ?? "—";
          toast.custom(
            () => (
              <div style={{
                position: "fixed", inset: 0, display: "grid", placeItems: "center",
                zIndex: 60, pointerEvents: "none"
              }}>
                <div style={{
                  pointerEvents: "auto",
                  background: "#fff", border: "1px solid #e5e7eb",
                  borderRadius: 16, boxShadow: "0 30px 80px rgba(0,0,0,.25)",
                  padding: 24, minWidth: 420, textAlign: "center"
                }}>
                  <div style={{ fontSize: 22, fontWeight: 700, marginBottom: 6 }}>🎉 ¡Nueva encuesta completada!</div>
                  <div style={{ color: "#374151", marginBottom: 10 }}>NPS <b>{nps}</b> · CSAT <b>{csat}</b></div>
                  <div style={{ fontSize: 12, color: "#6b7280" }}>Se actualizaron tus métricas.</div>
                </div>
              </div>
            ),
            { duration: 2500 }
          );
          load();
        })
      .subscribe();

    return () => {
      supabase.removeChannel(chResponses);
    };
  }, [code]);

  const labels = useMemo(() => series.map(d => new Date(d.day).toLocaleDateString()), [series]);

  const lineData = useMemo(() => ({
    labels,
    datasets: [{ 
      label: "Respuestas", 
      data: series.map(d => d.total), 
      borderColor: PINK_DARK, 
      backgroundColor: PINK, 
      fill: true, 
      tension: 0.35 
    }],
  }), [labels, series]);

  const totals = useMemo(() => {
    const t = series.reduce(
      (a, d) => ({
        promoters: a.promoters + (d.promoters || 0),
        neutrals: a.neutrals + (d.neutrals || 0),
        detractors: a.detractors + (d.detractors || 0),
      }),
      { promoters: 0, neutrals: 0, detractors: 0 }
    );
    const total = Math.max(1, t.promoters + t.neutrals + t.detractors);
    const score = Math.round(((t.promoters - t.detractors) / total) * 100);
    return { ...t, total, score };
  }, [series]);

  const npsData = useMemo(() => ({
    labels: ["Detractores", "Neutros", "Promotores"],
    datasets: [{ 
      data: [totals.detractors, totals.neutrals, totals.promoters], 
      backgroundColor: ["#e7d3d3", "#efdfdf", PINK] 
    }],
  }), [totals]);

  const csatData = useMemo(() => ({
    labels,
    datasets: [{ 
      label: "CSAT (1–5)", 
      data: series.map(d => Number(d.avg_csat || 0)), 
      backgroundColor: PINK, 
      borderColor: PINK_DARK, 
      borderWidth: 1.5 
    }],
  }), [labels, series]);

  // Datos para gráficos de las 3 métricas de marketing
  const openRateGauge = useMemo(() => ({
    labels: ['Apertura'],
    datasets: [{
      data: [openRate, 100 - openRate],
      backgroundColor: ['#a7f3d0', '#f5f5f5'],
      circumference: 180,
      rotation: 270
    }]
  }), [openRate]);

  const responseRateGauge = useMemo(() => ({
    labels: ['Respuesta'],
    datasets: [{
      data: [responseRate, 100 - responseRate],
      backgroundColor: [PINK, '#f5f5f5'],
      circumference: 180,
      rotation: 270
    }]
  }), [responseRate]);

  const abandonmentRateGauge = useMemo(() => ({
    labels: ['Abandono'],
    datasets: [{
      data: [abandonmentRate, 100 - abandonmentRate],
      backgroundColor: ['#fecaca', '#f5f5f5'],
      circumference: 180,
      rotation: 270
    }]
  }), [abandonmentRate]);

  const chartOpts = { plugins: { legend: { display: false } }, maintainAspectRatio: false };

  return (
    <>
      <Topbar />
      <Toaster />

      <div className="container" style={{ background: "#fff" }}>
        <div className="grid grid-2">
          <div className="card card-pad">
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <div>
                <div style={{ fontSize: 14, color: TXT }}>NPS (neto)</div>
                <div style={{ fontSize: 28, fontWeight: 600 }}>{totals.score}%</div>
                <div style={{ fontSize: 12, color: TXT }}>Promotores — Detractores</div>
              </div>
              <HelpTip title="¿Qué es NPS (neto)?">NPS = %Promotores (9–10) − %Detractores (0–6).</HelpTip>
            </div>
          </div>

          <div className="card card-pad">
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <div>
                <div style={{ fontSize: 14, color: TXT }}>Calificación</div>
                <div style={{ fontSize: 28, fontWeight: 600, display: "flex", alignItems: "center", gap: 6 }}>
                  {stars} <Star />
                </div>
                <div style={{ fontSize: 12, color: TXT }}>Promedio de 1 a 5</div>
              </div>
              <HelpTip title="CSAT">Satisfacción inmediata (1–5).</HelpTip>
            </div>
          </div>
        </div>

        <div className="card card-pad" style={{ marginTop: 12 }}>
          <div style={{ display: "flex", gap: 16, alignItems: "center", flexWrap: "wrap" }}>
            <div><b>Últimos 7 días</b></div>
            <div style={{ color: TXT }}>Respuestas: <b>{totResp}</b></div>
            <div style={{ marginLeft: "auto" }}>
              <button 
                className="btn-primary" 
                onClick={() => setShowModal(true)}
                style={{
                  background: PINK_DARK,
                  color: '#4a4a4a',
                  border: 'none',
                  padding: '10px 20px',
                  borderRadius: '10px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                }}
                onMouseEnter={(e) => {
                  e.target.style.background = PINK;
                  e.target.style.transform = 'translateY(-2px)';
                  e.target.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.background = PINK_DARK;
                  e.target.style.transform = 'translateY(0)';
                  e.target.style.boxShadow = '0 2px 8px rgba(0,0,0,0.1)';
                }}
              >
                Ver datos recientes
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-3" style={{ marginTop: 18 }}>
          <div className="card card-pad">
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <div className="cx-title">Respuestas por día</div>
              <HelpTip title="Respuestas diarias">Encuestas completadas por día.</HelpTip>
            </div>
            <div className="chart-wrap" style={{ height: 220 }}>
              <Line data={lineData} options={chartOpts} />
            </div>
          </div>

          <div className="card card-pad">
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <div className="cx-title">NPS (distribución)</div>
              <HelpTip title="Distribución NPS">Detractores / Neutros / Promotores.</HelpTip>
            </div>
            <div className="chart-wrap" style={{ height: 220 }}>
              <Doughnut data={npsData} options={{ maintainAspectRatio: false }} />
            </div>
          </div>

          <div className="card card-pad">
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <div className="cx-title">CSAT promedio</div>
              <HelpTip title="CSAT promedio">Promedio diario.</HelpTip>
            </div>
            <div className="chart-wrap" style={{ height: 220 }}>
              <Bar data={csatData} options={chartOpts} />
            </div>
          </div>
        </div>

        {/* 🆕 MÉTRICAS DE MARKETING (DATOS SIMULADOS) */}
        <div className="grid grid-3" style={{ marginTop: 18 }}>
          {/* MÉTRICA 1: Tasa de Apertura */}
          <div className="card card-pad">
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <div className="cx-title">Tasa de Apertura</div>
              <HelpTip title="Tasa de Apertura">
                Porcentaje de personas que escanearon el QR o abrieron el link de la encuesta. Indica el interés inicial del cliente.
              </HelpTip>
            </div>
            <div style={{ height: 220, position: 'relative' }}>
              <Doughnut 
                data={openRateGauge} 
                options={{ 
                  maintainAspectRatio: false,
                  plugins: {
                    legend: { display: false },
                    tooltip: { enabled: false }
                  },
                  cutout: '75%'
                }} 
              />
              <div style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -25%)',
                textAlign: 'center'
              }}>
                <div style={{ fontSize: 42, fontWeight: 700, color: '#059669' }}>{openRate}%</div>
                <div style={{ fontSize: 14, color: TXT }}>abrieron</div>
              </div>
            </div>
          </div>

          {/* MÉTRICA 2: Tasa de Respuesta */}
          <div className="card card-pad">
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <div className="cx-title">Tasa de Respuesta</div>
              <HelpTip title="Tasa de Respuesta">
                Porcentaje de personas que completaron la encuesta del total que la abrieron. Mide la participación efectiva.
              </HelpTip>
            </div>
            <div style={{ height: 220, position: 'relative' }}>
              <Doughnut 
                data={responseRateGauge} 
                options={{ 
                  maintainAspectRatio: false,
                  plugins: {
                    legend: { display: false },
                    tooltip: { enabled: false }
                  },
                  cutout: '75%'
                }} 
              />
              <div style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -25%)',
                textAlign: 'center'
              }}>
                <div style={{ fontSize: 42, fontWeight: 700, color: PINK_DARK }}>{responseRate}%</div>
                <div style={{ fontSize: 14, color: TXT }}>completaron</div>
              </div>
            </div>
          </div>

          {/* MÉTRICA 3: Tasa de Abandono */}
          <div className="card card-pad">
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <div className="cx-title">Tasa de Abandono</div>
              <HelpTip title="Tasa de Abandono">
                Porcentaje de personas que empezaron la encuesta pero no la terminaron. Si es alto, indica que el formulario es muy largo o poco atractivo.
              </HelpTip>
            </div>
            <div style={{ height: 220, position: 'relative' }}>
              <Doughnut 
                data={abandonmentRateGauge} 
                options={{ 
                  maintainAspectRatio: false,
                  plugins: {
                    legend: { display: false },
                    tooltip: { enabled: false }
                  },
                  cutout: '75%'
                }} 
              />
              <div style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -25%)',
                textAlign: 'center'
              }}>
                <div style={{ fontSize: 42, fontWeight: 700, color: '#dc2626' }}>{abandonmentRate}%</div>
                <div style={{ fontSize: 14, color: TXT }}>abandonaron</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <DataModal open={showModal} onClose={() => setShowModal(false)} branchCode={code} />
    </>
  );
}