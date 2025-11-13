import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from "recharts";
import "./BranchDashboard.css";
import { supabase } from "../lib/supabaseClient";

const COLORS = ["#F4B6C2", "#E4A6A1", "#6F4E37"];

export default function BranchDashboard({ branchCode }) {
  const [metrics, setMetrics] = useState(null);

  useEffect(() => {
    async function fetchMetrics() {
      const { data, error } = await supabase
        .from("v_branch_metrics_daily")
        .select("*")
        .eq("branch_code", branchCode);
      if (!error) setMetrics(data);
    }
    fetchMetrics();
  }, [branchCode]);

  const pieData = [
    { name: "Promotores", value: 45 },
    { name: "Neutros", value: 30 },
    { name: "Detractores", value: 25 },
  ];

  return (
    <motion.div
      className="dashboard-container"
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <header className="dashboard-header">
        <h1>📊 Métricas de Sucursal</h1>
        <p className="branch-name">Sucursal: {branchCode}</p>
      </header>

      <section className="charts-section">
        <motion.div
          className="card"
          whileHover={{ scale: 1.03 }}
          transition={{ type: "spring", stiffness: 120 }}
        >
          <h2>NPS (Net Promoter Score)</h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) =>
                  `${name} ${(percent * 100).toFixed(0)}%`
                }
                outerRadius={110}
                fill="#8884d8"
                dataKey="value"
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </motion.div>

        <motion.div
          className="card"
          whileHover={{ scale: 1.03 }}
          transition={{ type: "spring", stiffness: 120 }}
        >
          <h2>CSAT (Satisfacción)</h2>
          <div className="csat-bar">
            <div className="bar-label">Satisfecho</div>
            <div className="bar-track">
              <div className="bar-fill" style={{ width: "80%" }}></div>
            </div>

            <div className="bar-label">Neutral</div>
            <div className="bar-track">
              <div className="bar-fill neutral" style={{ width: "50%" }}></div>
            </div>

            <div className="bar-label">Insatisfecho</div>
            <div className="bar-track">
              <div className="bar-fill low" style={{ width: "20%" }}></div>
            </div>
          </div>
        </motion.div>
      </section>
    </motion.div>
  );
}
