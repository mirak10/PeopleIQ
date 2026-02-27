// components/AIInsights.jsx — Rewired to use real ML predictions
import React, { useEffect, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { fetchPredictionSummary } from "../services/mlService";

const AIInsights = () => {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPredictionSummary()
      .then(res => {
        if (res.success && res.data) setSummary(res.data);
      })
      .catch(err => console.error("AI Insights fetch failed", err))
      .finally(() => setLoading(false));
  }, []);

  // Fallback data while loading or on error
  const highRisk = summary?.HighRiskCount || summary?.highRiskCount || 0;
  const mediumRisk = summary?.MediumRiskCount || summary?.mediumRiskCount || 0;
  const lowRisk = summary?.LowRiskCount || summary?.lowRiskCount || 0;

  const factorsRaw = summary?.TopTurnoverFactors || summary?.topTurnoverFactors || [];
  const factorData = factorsRaw.map(f => ({
    factor: f.factor,
    value: f.weight || f.count || 0,
  }));

  return (
    <div className="min-h-full bg-slate-50 space-y-8">
      <h1 className="text-3xl font-bold tracking-tight">AI Insights</h1>
      <p className="text-slate-500">
        {loading ? "Loading predictions..." : "Predictive attrition risk and top turnover factors from ML models."}
      </p>

      {/* KPI / Risk Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
          <p className="text-slate-500 text-sm uppercase font-medium tracking-wider">
            High-Risk Employees
          </p>
          <h2 className="text-2xl font-bold mt-1 text-red-600">{highRisk}</h2>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
          <p className="text-slate-500 text-sm uppercase font-medium tracking-wider">
            Medium-Risk Employees
          </p>
          <h2 className="text-2xl font-bold mt-1 text-amber-600">{mediumRisk}</h2>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
          <p className="text-slate-500 text-sm uppercase font-medium tracking-wider">
            Low-Risk Employees
          </p>
          <h2 className="text-2xl font-bold mt-1 text-emerald-600">{lowRisk}</h2>
        </div>
      </div>

      {/* Bar Chart: Top Turnover Factors */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <h2 className="text-xl font-bold mb-4">Top Factors for Turnover</h2>
        <div className="h-80">
          {factorData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={factorData}
                margin={{ top: 5, right: 30, left: 0, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="factor" tick={{ fill: "#94a3b8", fontSize: 11 }} angle={-15} textAnchor="end" height={60} />
                <YAxis tick={{ fill: "#94a3b8", fontSize: 12 }} />
                <Tooltip
                  contentStyle={{
                    borderRadius: "12px",
                    border: "none",
                    boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                  }}
                />
                <Bar dataKey="value" fill="#4f46e5" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-full text-slate-400">
              {loading ? "Loading chart data..." : "No turnover factor data available"}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AIInsights;