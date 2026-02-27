// pages/PerformancePage.jsx — Performance Analytics Dashboard
import React, { useEffect, useState } from "react";
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    PieChart, Pie, Cell, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
} from "recharts";
import { fetchPerformanceData } from "../services/mlService";

const COLORS = ["#6366f1", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6"];
const PROMO_COLORS = { Ready: "#10b981", Developing: "#f59e0b", "Not Ready": "#ef4444" };

export default function PerformancePage() {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchPerformanceData()
            .then(res => { if (res.success) setData(res.data); })
            .catch(err => console.error("Performance fetch failed", err))
            .finally(() => setLoading(false));
    }, []);

    if (loading) return <div className="flex items-center justify-center h-64"><p className="text-slate-400 text-lg">Loading performance data...</p></div>;
    if (!data) return <p className="text-red-400">Failed to load performance data</p>;

    const ratingData = Object.entries(data.ratingDistribution).map(([rating, count]) => ({
        rating: `Rating ${rating}`,
        count,
    }));

    const promoData = Object.entries(data.promotionBreakdown).map(([name, value]) => ({ name, value }));

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold text-slate-900">Performance Analytics</h1>
                <p className="text-slate-500 mt-1">Rating distributions, top performers, and promotion readiness</p>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <KPI title="Promotion Ready" value={data.promotionBreakdown.Ready || 0} color="text-emerald-600" />
                <KPI title="Developing" value={data.promotionBreakdown.Developing || 0} color="text-amber-600" />
                <KPI title="Not Ready" value={data.promotionBreakdown["Not Ready"] || 0} color="text-red-600" />
                <KPI title="Departments" value={data.departments.length} />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Rating Distribution */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                    <h3 className="text-lg font-bold text-slate-900 mb-4">Performance Rating Distribution</h3>
                    <ResponsiveContainer width="100%" height={280}>
                        <BarChart data={ratingData}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                            <XAxis dataKey="rating" tick={{ fill: "#475569", fontSize: 12 }} />
                            <YAxis tick={{ fill: "#94a3b8", fontSize: 12 }} />
                            <Tooltip />
                            <Bar dataKey="count" fill="#6366f1" radius={[8, 8, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>

                {/* Promotion Readiness Pie */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                    <h3 className="text-lg font-bold text-slate-900 mb-4">Promotion Readiness</h3>
                    <ResponsiveContainer width="100%" height={240}>
                        <PieChart>
                            <Pie data={promoData} dataKey="value" innerRadius={55} outerRadius={85} paddingAngle={4}>
                                {promoData.map((entry, i) => (
                                    <Cell key={i} fill={PROMO_COLORS[entry.name] || COLORS[i]} />
                                ))}
                            </Pie>
                            <Tooltip />
                        </PieChart>
                    </ResponsiveContainer>
                    <div className="flex justify-center gap-4 mt-2">
                        {promoData.map((entry, i) => (
                            <div key={i} className="flex items-center gap-1.5 text-sm">
                                <span className="w-3 h-3 rounded-full" style={{ background: PROMO_COLORS[entry.name] || COLORS[i] }} />
                                {entry.name}: {entry.value}
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Department Performance */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                <h3 className="text-lg font-bold text-slate-900 mb-4">Average Performance by Department</h3>
                <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={data.departments.sort((a, b) => b.avgPerformance - a.avgPerformance)}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                        <XAxis dataKey="name" tick={{ fill: "#475569", fontSize: 11 }} angle={-20} textAnchor="end" height={60} />
                        <YAxis domain={[0, 5]} tick={{ fill: "#94a3b8", fontSize: 12 }} />
                        <Tooltip />
                        <Bar dataKey="avgPerformance" name="Avg Rating" fill="#8b5cf6" radius={[6, 6, 0, 0]} />
                    </BarChart>
                </ResponsiveContainer>
            </div>

            {/* Top Performers Table */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                <h3 className="text-lg font-bold text-slate-900 mb-4">Top Performers</h3>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b border-slate-200 text-left text-slate-500">
                                <th className="pb-3 font-medium">Rank</th>
                                <th className="pb-3 font-medium">Employee ID</th>
                                <th className="pb-3 font-medium">Department</th>
                                <th className="pb-3 font-medium">Current Rating</th>
                                <th className="pb-3 font-medium">Predicted Rating</th>
                                <th className="pb-3 font-medium">Promotion</th>
                            </tr>
                        </thead>
                        <tbody>
                            {data.topPerformers.map((emp, i) => (
                                <tr key={i} className="border-b border-slate-50 hover:bg-slate-50 transition">
                                    <td className="py-3 font-bold text-indigo-600">#{i + 1}</td>
                                    <td className="py-3 font-medium text-slate-900">{emp.EmployeeID}</td>
                                    <td className="py-3 text-slate-600">{emp.Department}</td>
                                    <td className="py-3">
                                        <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-indigo-100 text-indigo-700">
                                            {emp.CurrentPerformance}/5
                                        </span>
                                    </td>
                                    <td className="py-3">
                                        <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-purple-100 text-purple-700">
                                            {emp.PredictedPerformance}/5
                                        </span>
                                    </td>
                                    <td className="py-3">
                                        <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${emp.PromotionReadiness === "Ready" ? "bg-emerald-100 text-emerald-700" :
                                                emp.PromotionReadiness === "Developing" ? "bg-amber-100 text-amber-700" :
                                                    "bg-red-100 text-red-700"
                                            }`}>
                                            {emp.PromotionReadiness}
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
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition">
            <p className="text-sm font-medium text-slate-500 uppercase tracking-wider">{title}</p>
            <h3 className={`text-2xl font-bold mt-1 ${color}`}>{value}</h3>
        </div>
    );
}
