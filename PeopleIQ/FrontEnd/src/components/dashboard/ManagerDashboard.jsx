// components/dashboard/ManagerDashboard.jsx — Enhanced with ML predictions
import React, { useEffect, useState } from "react";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, PieChart, Pie, Cell, LineChart, Line } from "recharts";
import { fetchPredictionSummary } from "../../services/mlService";

const COLORS = ["#6366f1", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6"];

export default function ManagerDashboard() {
  const [team, setTeam] = useState([]);
  const [mlSummary, setMlSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

  useEffect(() => {
    const fetchTeam = async () => {
      try {
        const token = JSON.parse(localStorage.getItem("user"))?.token;
        const [empRes, mlRes] = await Promise.all([
          fetch(`${API_URL}/api/employees`, {
            headers: { Authorization: `Bearer ${token}` },
          }).then(r => r.json()),
          fetchPredictionSummary().catch(() => ({ success: false })),
        ]);

        if (empRes.success && empRes.data) {
          const user = JSON.parse(localStorage.getItem("user") || "{}");
          setTeam(empRes.data.filter(emp => emp.ManagerId === user._id));
        }
        if (mlRes.success && mlRes.data) setMlSummary(mlRes.data);
      } catch (err) {
        console.error("Manager dashboard load failed", err);
      } finally {
        setLoading(false);
      }
    };
    fetchTeam();
  }, []);

  if (loading) return <p className="text-slate-500">Loading dashboard...</p>;

  // ML-enhanced KPIs
  const teamSize = team.length;
  const avgEngagement = mlSummary?.AvgEngagement || mlSummary?.avgEngagement ||
    (teamSize ? (team.reduce((acc, e) => acc + (e.engagementScore || 0), 0) / teamSize).toFixed(1) : "0");
  const topPerformer = team.length
    ? [...team].sort((a, b) => b.performanceRating - a.performanceRating)[0]?.Name || "—"
    : "—";

  const performanceData = team.map(e => ({ name: e.Name, performance: e.performanceRating || 0, engagement: e.engagementScore || 0 }));

  const deptMap = {};
  team.forEach(e => { const d = e.Department || "Unknown"; deptMap[d] = (deptMap[d] || 0) + 1 });
  const deptData = Object.entries(deptMap).map(([name, value]) => ({ name, value }));

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold text-slate-900">Manager Dashboard</h1>

      <div className="grid md:grid-cols-2 xl:grid-cols-4 gap-6">
        <Card title="Team Size" value={teamSize} />
        <Card title="Top Performer" value={topPerformer} />
        <Card title="Avg Engagement" value={typeof avgEngagement === 'number' ? avgEngagement.toFixed(1) : avgEngagement} />
      </div>

      {/* Charts */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* (Removed Attrition BarChart) */}

        <div className="bg-white p-4 rounded-lg shadow-sm">
          <h3 className="font-semibold mb-3">Performance & Engagement</h3>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={performanceData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" hide />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="performance" stroke="#6366f1" strokeWidth={3} />
              <Line type="monotone" dataKey="engagement" stroke="#10b981" strokeWidth={3} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="lg:col-span-2 bg-white p-4 rounded-lg shadow-sm">
          <h3 className="font-semibold mb-3">Department Distribution</h3>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie data={deptData} dataKey="value" innerRadius={50} outerRadius={70}>
                {deptData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

    </div>
  );
}

const Card = ({ title, value, color = "text-slate-900" }) => (
  <div className="bg-white p-4 rounded-lg shadow-sm hover:shadow-md transition">
    <p className="text-xs font-medium text-slate-500 uppercase">{title}</p>
    <p className={`text-xl font-bold mt-1 ${color}`}>{value}</p>
  </div>
);