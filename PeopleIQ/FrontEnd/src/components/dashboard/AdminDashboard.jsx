// components/dashboard/AdminDashboard.jsx — Rewired with real ML data
import React, { useEffect, useState } from "react";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";
import { fetchPredictionSummary } from "../../services/mlService";

const COLORS = ["#4f46e5", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899"];
const RISK_COLORS = { High: "#ef4444", Medium: "#f59e0b", Low: "#10b981" };

export default function AdminDashboard() {
  const [employees, setEmployees] = useState([]);
  const [mlSummary, setMlSummary] = useState(null);
  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

  useEffect(() => {
    const token = JSON.parse(localStorage.getItem("user"))?.token;

    // Fetch employees
    fetch(`${API_URL}/api/employees`, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    })
      .then(res => res.json())
      .then(data => {
        if (data.success) setEmployees(data.data);
      })
      .catch(err => console.error("Dashboard load error", err));

    // Fetch ML summary
    fetchPredictionSummary()
      .then(res => {
        if (res.success && res.data) setMlSummary(res.data);
      })
      .catch(err => console.error("ML Summary load error", err));
  }, []);

  const total = mlSummary?.TotalEmployees || mlSummary?.totalEmployees || employees.length;
  const avgBurnout = mlSummary?.AvgBurnoutScore || mlSummary?.avgBurnoutScore || 0;
  const avgEngagement = mlSummary?.AvgEngagement || mlSummary?.avgEngagement || 0;

  /* Department metrics from ML */
  const deptMetrics = mlSummary?.DeptWiseMetrics || mlSummary?.departmentMetrics || {};
  const deptData = Object.entries(deptMetrics).map(([name, m]) => ({
    name,
    employees: m.count,
    name,
    employees: m.count,
  }));

  /* (Removed Risk Pie and Top Factors) */

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold text-slate-900">Admin Overview</h1>

      {/* KPI CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
        <Card title="Total Employees" value={total} />
        <Card title="Avg Engagement" value={avgEngagement.toFixed ? avgEngagement.toFixed(2) : avgEngagement} color="text-indigo-600" />
      </div>

      {/* CHARTS */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* (Removed Risk Distribution Pie) */}

        {/* Department Risk */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <h3 className="text-lg font-bold text-slate-900 mb-4">
            Department Risk Overview
          </h3>
          <div className="h-80">
            <ResponsiveContainer>
              <BarChart data={deptData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" tick={{ fill: "#475569", fontSize: 11 }} angle={-20} textAnchor="end" height={60} />
                <YAxis tick={{ fill: "#94a3b8", fontSize: 12 }} />
                <Tooltip />
                <Bar dataKey="employees" name="Employees" fill="#6366f1" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* (Removed Top Turnover Risk Factors bar chart) */}

      {/* System Insight */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
        <h3 className="text-lg font-bold mb-3">System Insight</h3>
        <ul className="text-slate-600 space-y-2 text-sm">
          <li>- Average burnout score: {(avgBurnout * 100).toFixed(0)}%</li>
          <li>- ML predictions powered by notebook pipeline</li>
        </ul>
      </div>
    </div>
  );
}

function Card({ title, value, color = "text-slate-900" }) {
  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition">
      <p className="text-slate-500 text-sm font-medium uppercase tracking-wider">
        {title}
      </p>
      <h3 className={`text-2xl font-bold mt-1 ${color}`}>
        {value}
      </h3>
    </div>
  );
}