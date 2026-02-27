// pages/RecommendationsPage.jsx — Smart Retention, Pay Equity, Training
import React, { useEffect, useState } from "react";
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, Cell,
} from "recharts";
import { fetchRecommendationsData } from "../services/mlService";

export default function RecommendationsPage() {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState("retention");

    useEffect(() => {
        fetchRecommendationsData()
            .then(res => { if (res.success) setData(res.data); })
            .catch(err => console.error("Recommendations fetch failed", err))
            .finally(() => setLoading(false));
    }, []);

    if (loading) return <div className="flex items-center justify-center h-64"><p className="text-slate-400 text-lg">Loading recommendations...</p></div>;
    if (!data) return <p className="text-red-400">Failed to load recommendations</p>;

    const tabs = [
        { key: "retention", label: "Smart Retention" },
        { key: "payEquity", label: "Pay Equity" },
        { key: "training", label: "Training Impact" },
    ];

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold text-slate-900">Recommendations</h1>
                <p className="text-slate-500 mt-1">AI-generated retention strategies, pay equity analysis, and training recommendations</p>
            </div>

            {/* Tabs */}
            <div className="flex gap-1 bg-slate-100 rounded-xl p-1 w-fit">
                {tabs.map(tab => (
                    <button
                        key={tab.key}
                        onClick={() => setActiveTab(tab.key)}
                        className={`px-5 py-2.5 rounded-lg text-sm font-medium transition ${activeTab === tab.key
                            ? "bg-white text-indigo-600 shadow-sm"
                            : "text-slate-500 hover:text-slate-700"
                            }`}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>

            {activeTab === "retention" && <RetentionTab employees={data.actionableEmployees} />}
            {activeTab === "payEquity" && <PayEquityTab data={data.payEquity} />}
            {activeTab === "training" && <TrainingTab data={data.training} />}
        </div>
    );
}

/* ===================== Retention Tab ===================== */
function RetentionTab({ employees }) {
    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-1 gap-4">
                <KPI title="With Recommendations" value={employees.length} />
            </div>

            <div className="space-y-4">
                {employees.slice(0, 30).map((emp, i) => (
                    <div key={i} className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition">
                        <div className="flex items-start justify-between flex-wrap gap-2">
                            <div>
                                <div className="flex items-center gap-3">
                                    <span className="font-bold text-slate-900">{emp.EmployeeID}</span>
                                </div>
                                <p className="text-sm text-slate-500 mt-0.5">{emp.Department} — {emp.JobTitle}</p>
                            </div>
                        </div>
                        <div className="mt-3 space-y-1.5">
                            <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Recommended Actions</p>
                            {(emp.Recommendations || []).map((rec, j) => (
                                <div key={j} className="flex items-start gap-2 text-sm text-slate-700">
                                    <span className="text-indigo-500 mt-0.5 flex-shrink-0">&#9679;</span>
                                    <span>{rec}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

/* ===================== Pay Equity Tab ===================== */
function PayEquityTab({ data }) {
    // Group by department for chart
    const deptMap = {};
    data.forEach(d => {
        if (!deptMap[d.department]) deptMap[d.department] = {};
        deptMap[d.department][d.gender] = d.avgSalary;
    });
    const chartData = Object.entries(deptMap).map(([dept, genders]) => ({
        department: dept,
        Male: genders.Male || 0,
        Female: genders.Female || 0,
    }));

    // Gap summary
    const gapData = data.map(d => ({
        label: `${d.department} (${d.gender})`,
        gap: +(d.avgGap * 100).toFixed(1),
        department: d.department,
        gender: d.gender,
    })).sort((a, b) => a.gap - b.gap);

    return (
        <div className="space-y-8">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                <h3 className="text-lg font-bold text-slate-900 mb-4">Average Salary by Department & Gender</h3>
                <ResponsiveContainer width="100%" height={350}>
                    <BarChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                        <XAxis dataKey="department" tick={{ fill: "#475569", fontSize: 11 }} angle={-20} textAnchor="end" height={60} />
                        <YAxis tick={{ fill: "#94a3b8", fontSize: 12 }} />
                        <Tooltip formatter={(v) => `$${v.toLocaleString()}`} />
                        <Legend />
                        <Bar dataKey="Male" fill="#6366f1" radius={[4, 4, 0, 0]} />
                        <Bar dataKey="Female" fill="#ec4899" radius={[4, 4, 0, 0]} />
                    </BarChart>
                </ResponsiveContainer>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                <h3 className="text-lg font-bold text-slate-900 mb-4">Pay Gap (% vs Department Average)</h3>
                <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={gapData} layout="vertical" margin={{ left: 160 }}>
                        <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                        <XAxis type="number" tick={{ fill: "#94a3b8", fontSize: 12 }} tickFormatter={v => `${v}%`} />
                        <YAxis type="category" dataKey="label" tick={{ fill: "#475569", fontSize: 11 }} width={160} />
                        <Tooltip formatter={v => `${v}%`} />
                        <Bar dataKey="gap" radius={[0, 4, 4, 0]}>
                            {gapData.map((entry, i) => (
                                <Cell key={i} fill={entry.gap < -3 ? "#ef4444" : entry.gap > 3 ? "#10b981" : "#94a3b8"} />
                            ))}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}



/* ===================== Training Tab ===================== */
function TrainingTab({ data }) {
    return (
        <div className="space-y-8">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                <h3 className="text-lg font-bold text-slate-900 mb-4">Training Impact: Engagement Comparison</h3>
                <ResponsiveContainer width="100%" height={350}>
                    <BarChart data={data}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                        <XAxis dataKey="department" tick={{ fill: "#475569", fontSize: 11 }} angle={-20} textAnchor="end" height={60} />
                        <YAxis tick={{ fill: "#94a3b8", fontSize: 12 }} />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="avgEngTrained" name="Trained Engagement" fill="#10b981" radius={[4, 4, 0, 0]} />
                        <Bar dataKey="avgEngUntrained" name="Untrained Engagement" fill="#ef4444" radius={[4, 4, 0, 0]} />
                    </BarChart>
                </ResponsiveContainer>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                <h3 className="text-lg font-bold text-slate-900 mb-4">Training Coverage & Impact by Department</h3>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b border-slate-200 text-left text-slate-500">
                                <th className="pb-3 font-medium">Department</th>
                                <th className="pb-3 font-medium">Trained</th>
                                <th className="pb-3 font-medium">Untrained</th>
                                <th className="pb-3 font-medium">Coverage</th>
                                <th className="pb-3 font-medium">Avg Impact</th>
                                <th className="pb-3 font-medium">Eng. Trained</th>
                                <th className="pb-3 font-medium">Eng. Untrained</th>
                            </tr>
                        </thead>
                        <tbody>
                            {data.map((d, i) => {
                                const total = d.trainedCount + d.untrainedCount;
                                const coverage = total ? ((d.trainedCount / total) * 100).toFixed(0) : 0;
                                return (
                                    <tr key={i} className="border-b border-slate-50 hover:bg-slate-50 transition">
                                        <td className="py-3 font-medium text-slate-900">{d.department}</td>
                                        <td className="py-3 text-slate-700">{d.trainedCount}</td>
                                        <td className="py-3 text-slate-700">{d.untrainedCount}</td>
                                        <td className="py-3">
                                            <div className="flex items-center gap-2">
                                                <div className="w-16 h-2 bg-slate-200 rounded-full overflow-hidden">
                                                    <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${coverage}%` }} />
                                                </div>
                                                <span className="text-xs text-slate-500">{coverage}%</span>
                                            </div>
                                        </td>
                                        <td className="py-3">
                                            <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${d.avgImpact >= 0.6 ? "bg-emerald-100 text-emerald-700" :
                                                d.avgImpact >= 0.3 ? "bg-amber-100 text-amber-700" :
                                                    "bg-red-100 text-red-700"
                                                }`}>
                                                {(d.avgImpact * 100).toFixed(0)}%
                                            </span>
                                        </td>
                                        <td className="py-3 text-slate-700">{d.avgEngTrained}</td>
                                        <td className="py-3 text-slate-700">{d.avgEngUntrained}</td>
                                    </tr>
                                );
                            })}
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
