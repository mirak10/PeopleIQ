// components/dashboard/EmployeeDashboard.jsx — Enhanced with personal ML predictions
import React, { useEffect, useState } from "react";
import { fetchPredictionSummary } from "../../services/mlService";

export default function EmployeeDashboard() {
  const [user, setUser] = useState(null);
  const [mlData, setMlData] = useState(null);

  useEffect(() => {
    const u = JSON.parse(localStorage.getItem("user"));
    setUser(u);

    // Attempt to load ML summary for engagement data
    fetchPredictionSummary()
      .then(res => {
        if (res.success && res.data) setMlData(res.data);
      })
      .catch(() => { });
  }, []);

  if (!user) return <p className="text-slate-500">Loading...</p>;

  const avgEngagement = mlData?.AvgEngagement || mlData?.avgEngagement || "N/A";
  const avgBurnout = mlData?.AvgBurnoutScore || mlData?.avgBurnoutScore || 0;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-slate-900">My Dashboard</h1>

      <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
        <Card title="Welcome" value={user.name || "Employee"} />
        <Card title="Role" value={user.role || "Employee"} />
        <Card title="Org Engagement" value={typeof avgEngagement === 'number' ? avgEngagement.toFixed(2) : avgEngagement} color="text-indigo-600" />
        <Card title="Org Burnout Score" value={`${(avgBurnout * 100).toFixed(0)}%`} color={avgBurnout > 0.5 ? "text-red-600" : "text-emerald-600"} />
        <Card title="Time Off Balance" value="14 days remaining" />
        <Card title="Training" value="Check with HR for programs" />
      </div>

      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
        <h3 className="text-lg font-bold text-slate-900 mb-3">Quick Info</h3>
        <ul className="text-slate-600 space-y-2 text-sm">
          <li>- Contact HR for your personal performance and development plan</li>
          <li>- Organization-wide analytics are managed by HR and Admin roles</li>
          <li>- Visit Settings to update your profile information</li>
        </ul>
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