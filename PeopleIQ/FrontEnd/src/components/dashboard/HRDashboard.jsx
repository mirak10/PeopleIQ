// components/dashboard/HRDashboard.jsx — Rewired with real ML data
import React, { useEffect, useState } from "react";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, BarChart, Bar
} from "recharts";
import { fetchPredictionSummary } from "../../services/mlService";

const COLORS = ["#4f46e5", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899"];

export default function HRDashboard() {
  const [employees, setEmployees] = useState([]);
  const [mlSummary, setMlSummary] = useState(null);
  const [loading, setLoading] = useState(true);

  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const token = JSON.parse(localStorage.getItem("user"))?.token;
        const [empRes, mlRes] = await Promise.all([
          fetch(`${API_URL}/api/employees`, {
            headers: { Authorization: `Bearer ${token}` },
          }).then(r => r.json()),
          fetchPredictionSummary(),
        ]);
        if (empRes.success) setEmployees(empRes.data);
        if (mlRes.success && mlRes.data) setMlSummary(mlRes.data);
      } catch (err) {
        console.error("Dashboard fetch failed", err);
      }
      setLoading(false);
    };
    fetchAll();
  }, []);

  if (loading) return <p className="text-slate-500">Loading dashboard...</p>;

  /* KPIs — ML-powered */
  const totalEmployees = mlSummary?.TotalEmployees || mlSummary?.totalEmployees || employees.length;
  const avgEngagement = (mlSummary?.AvgEngagement || mlSummary?.avgEngagement || 0);

  /* Department Distribution */
  const deptMetrics = mlSummary?.DeptWiseMetrics || mlSummary?.departmentMetrics || {};
  const deptData = Object.entries(deptMetrics).map(([name, m]) => ({
    name,
    value: m.count || 0,
  }));

  /* (Removed Department Performance Strategy and Top Turnover Factors) */

  return (
    <div className="space-y-6">
      <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">HR Dashboard</h1>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-4">
        <Card title="Total Employees" value={totalEmployees} />
        <Card title="Avg Engagement" value={typeof avgEngagement === 'number' ? avgEngagement.toFixed(2) : avgEngagement} color="text-indigo-600" />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Department Pie */}
        <div className="bg-white p-4 rounded-lg shadow-sm">
          <h3 className="font-semibold mb-3">Department Distribution</h3>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie data={deptData} dataKey="value" innerRadius={50} outerRadius={70} paddingAngle={4}>
                {deptData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* (Removed Engagement vs Attrition bar chart) */}
    </div>
  );
}

const Card = ({ title, value, color = "text-slate-900" }) => (
  <div className="bg-white p-4 rounded-lg shadow-sm hover:shadow-md transition">
    <p className="text-xs font-medium text-slate-500 uppercase">{title}</p>
    <p className={`text-xl font-bold mt-1 ${color}`}>{value}</p>
  </div>
);