// pages/AbsenteeismPage.jsx — Absenteeism Dashboard
import React, { useEffect, useState } from "react";
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    PieChart, Pie, Cell,
} from "recharts";
import { fetchAbsenteeismData } from "../services/mlService";

const RISK_COLORS = { High: "#ef4444", Medium: "#f59e0b", Low: "#10b981" };

export default function AbsenteeismPage() {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchAbsenteeismData()
            .then(res => { if (res.success) setData(res.data); })
            .catch(err => console.error("Absenteeism fetch failed", err))
            .finally(() => setLoading(false));
    }, []);

    if (loading) return <div className="flex items-center justify-center h-64"><p className="text-slate-400 text-lg">Loading absenteeism data...</p></div>;
    if (!data) return <p className="text-red-400">Failed to load absenteeism data</p>;

    const pieData = Object.entries(data.distribution).map(([name, value]) => ({ name, value }));

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold text-slate-900">Absenteeism</h1>
                <p className="text-slate-500 mt-1">Absence trends, department patterns, and alert thresholds</p>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                <KPI title="High Absence Risk" value={data.distribution.High} color="text-red-600" />
                <KPI title="Medium Risk" value={data.distribution.Medium} color="text-amber-600" />
                <KPI title="Low Risk" value={data.distribution.Low} color="text-emerald-600" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Absence Risk Pie */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                    <h3 className="text-lg font-bold text-slate-900 mb-4">Absence Risk Distribution</h3>
                    <ResponsiveContainer width="100%" height={260}>
                        <PieChart>
                            <Pie data={pieData} dataKey="value" innerRadius={60} outerRadius={90} paddingAngle={4}>
                                {pieData.map((entry, i) => (
                                    <Cell key={i} fill={RISK_COLORS[entry.name]} />
                                ))}
                            </Pie>
                            <Tooltip />
                        </PieChart>
                    </ResponsiveContainer>
                    <div className="flex justify-center gap-4 mt-2">
                        {pieData.map((entry, i) => (
                            <div key={i} className="flex items-center gap-1.5 text-sm">
                                <span className="w-3 h-3 rounded-full" style={{ background: RISK_COLORS[entry.name] }} />
                                {entry.name}: {entry.value}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Department Absence */}
                <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                    <h3 className="text-lg font-bold text-slate-900 mb-4">Avg Absence Days by Department</h3>
                    <ResponsiveContainer width="100%" height={280}>
                        <BarChart data={data.departments.sort((a, b) => b.avgAbsenceDays - a.avgAbsenceDays)}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                            <XAxis dataKey="name" tick={{ fill: "#475569", fontSize: 11 }} angle={-20} textAnchor="end" height={60} />
                            <YAxis tick={{ fill: "#94a3b8", fontSize: 12 }} />
                            <Tooltip />
                            <Bar dataKey="avgAbsenceDays" name="Avg Days" fill="#f59e0b" radius={[6, 6, 0, 0]} />
                            <Bar dataKey="highRiskCount" name="High Risk" fill="#ef4444" radius={[6, 6, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* High Absence Employees */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                <h3 className="text-lg font-bold text-slate-900 mb-4">Employees Exceeding Absence Thresholds</h3>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b border-slate-200 text-left text-slate-500">
                                <th className="pb-3 font-medium">Employee ID</th>
                                <th className="pb-3 font-medium">Department</th>
                                <th className="pb-3 font-medium">Role</th>
                                <th className="pb-3 font-medium">Absence Days</th>
                                <th className="pb-3 font-medium">Burnout Score</th>
                                <th className="pb-3 font-medium">Risk Level</th>
                            </tr>
                        </thead>
                        <tbody>
                            {data.highAbsenceEmployees.map((emp, i) => (
                                <tr key={i} className="border-b border-slate-50 hover:bg-slate-50 transition">
                                    <td className="py-3 font-medium text-slate-900">{emp.EmployeeID}</td>
                                    <td className="py-3 text-slate-600">{emp.Department}</td>
                                    <td className="py-3 text-slate-600">{emp.JobTitle}</td>
                                    <td className="py-3 font-bold text-slate-900">{emp.AbsenceDays} days</td>
                                    <td className="py-3">
                                        <div className="flex items-center gap-2">
                                            <div className="w-16 h-2 bg-slate-200 rounded-full overflow-hidden">
                                                <div
                                                    className="h-full rounded-full"
                                                    style={{
                                                        width: `${(emp.BurnoutScore || 0) * 100}%`,
                                                        background: (emp.BurnoutScore || 0) >= 0.7 ? "#ef4444" : (emp.BurnoutScore || 0) >= 0.4 ? "#f59e0b" : "#10b981",
                                                    }}
                                                />
                                            </div>
                                            <span className="text-xs text-slate-500">{((emp.BurnoutScore || 0) * 100).toFixed(0)}%</span>
                                        </div>
                                    </td>
                                    <td className="py-3">
                                        <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-red-100 text-red-700">
                                            {emp.AbsenceRisk}
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
