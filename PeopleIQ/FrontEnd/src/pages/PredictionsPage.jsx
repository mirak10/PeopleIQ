// pages/PredictionsPage.jsx — Predictive Insights Dashboard
import React, { useEffect, useState } from "react";
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    PieChart, Pie, Cell, ScatterChart, Scatter, ZAxis,
} from "recharts";
import { fetchPredictions, fetchPredictionSummary, fetchAlerts } from "../services/mlService";

const RISK_COLORS = { High: "#ef4444", Medium: "#f59e0b", Low: "#10b981" };

export default function PredictionsPage() {
    const [summary, setSummary] = useState(null);
    const [predictions, setPredictions] = useState([]);
    const [alerts, setAlerts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filterDept, setFilterDept] = useState("");

    useEffect(() => {
        Promise.all([
            fetchPredictionSummary(),
            fetchPredictions(1, 100),
            fetchAlerts(),
        ])
            .then(([sumRes, predRes, alertRes]) => {
                if (sumRes.success) setSummary(sumRes.data);
                if (predRes.success) setPredictions(predRes.data);
                if (alertRes.success) setAlerts(alertRes.data);
            })
            .catch(err => console.error("Predictions fetch failed", err))
            .finally(() => setLoading(false));
    }, []);

    const refetch = () => {
        const filters = {};
        if (filterDept) filters.department = filterDept;
        fetchPredictions(1, 100, filters)
            .then(res => { if (res.success) setPredictions(res.data); });
    };

    useEffect(() => { if (!loading) refetch(); }, [filterDept]);

    if (loading) return <div className="flex items-center justify-center h-64"><p className="text-slate-400 text-lg">Loading predictions...</p></div>;

    const departments = summary?.DeptWiseMetrics
        ? Object.entries(summary.DeptWiseMetrics).map(([name, m]) => ({ name, ...m }))
        : [];

    const uniqueDepts = [...new Set(predictions.map(p => p.Department))].sort();

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold text-slate-900">Predictive Insights</h1>
                <p className="text-slate-500 mt-1">AI-powered attrition risk scores, and employee alerts</p>
            </div>

            {/* Summary KPIs */}
            {summary && (
                <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-2 gap-4">
                    <KPI title="Total Employees" value={summary.TotalEmployees || summary.totalEmployees} />
                    <KPI title="Avg Burnout" value={`${((summary.AvgBurnoutScore || summary.avgBurnoutScore || 0) * 100).toFixed(0)}%`} />
                </div>
            )}

            {/* Alerts Banner */}
            {alerts.length > 0 && (
                <div className="bg-red-50 border border-red-200 rounded-2xl p-5">
                    <h3 className="text-lg font-bold text-red-800 mb-3">Active Alerts ({alerts.length} employees)</h3>
                    <div className="space-y-2 max-h-48 overflow-y-auto">
                        {alerts.slice(0, 20).map((a, i) => (
                            <div key={i} className="flex items-start gap-3 text-sm">
                                <span className={`mt-0.5 w-2 h-2 rounded-full flex-shrink-0 bg-red-500`} />
                                <div>
                                    <span className="font-medium text-red-900">{a.EmployeeID}</span>
                                    <span className="text-red-600 mx-1">({a.Department})</span>
                                    <span className="text-red-700">— {a.Alerts.join("; ")}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Filters */}
            <div className="flex flex-wrap gap-4 items-center">
                <select
                    value={filterDept}
                    onChange={e => setFilterDept(e.target.value)}
                    className="px-4 py-2 rounded-xl border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                    <option value="">All Departments</option>
                    {uniqueDepts.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
                <span className="text-sm text-slate-500">{predictions.length} employees shown</span>
            </div>

            {/* Predictions Table */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                <h3 className="text-lg font-bold text-slate-900 mb-4">Employee Predictions</h3>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b border-slate-200 text-left text-slate-500">
                                <th className="pb-3 font-medium">Employee ID</th>
                                <th className="pb-3 font-medium">Department</th>
                                <th className="pb-3 font-medium">Burnout</th>
                                <th className="pb-3 font-medium">Promotion</th>
                            </tr>
                        </thead>
                        <tbody>
                            {predictions.map((p, i) => (
                                <tr key={i} className="border-b border-slate-50 hover:bg-slate-50 transition">
                                    <td className="py-3 font-medium text-slate-900">{p.EmployeeID}</td>
                                    <td className="py-3 text-slate-600">{p.Department}</td>
                                    <td className="py-3">
                                        <div className="flex items-center gap-2">
                                            <div className="w-12 h-2 bg-slate-200 rounded-full overflow-hidden">
                                                <div
                                                    className="h-full rounded-full"
                                                    style={{
                                                        width: `${(p.BurnoutScore || 0) * 100}%`,
                                                        background: (p.BurnoutScore || 0) >= 0.7 ? "#ef4444" : (p.BurnoutScore || 0) >= 0.4 ? "#f59e0b" : "#10b981",
                                                    }}
                                                />
                                            </div>
                                        </div>
                                    </td>
                                    <td className="py-3">
                                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${p.PromotionReadiness === "Ready" ? "bg-emerald-100 text-emerald-700" :
                                            p.PromotionReadiness === "Developing" ? "bg-amber-100 text-amber-700" :
                                                "bg-slate-100 text-slate-600"
                                            }`}>
                                            {p.PromotionReadiness}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

function KPI({ title, value, color = "text-slate-900" }) {
    return (
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition">
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">{title}</p>
            <h3 className={`text-xl font-bold mt-1 ${color}`}>{value}</h3>
        </div>
    );
}
