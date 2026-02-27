import React from "react";
import { Home, Users, LogOut, Activity, Settings, BarChart3, TrendingUp, X, BrainCircuit, AlertTriangle, GraduationCap, ClipboardList, UserMinus } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Sidebar({ sidebarOpen, setSidebarOpen, userRole }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  // Role-based menu items
  const getMenuItems = () => {
    const baseItems = [
      { label: "Dashboard", icon: <Home size={20} />, path: "/" },
    ];

    // Admin items
    if (userRole === "Admin") {
      baseItems.push(
        { label: "Employee Directory", icon: <Users size={20} />, path: "/employees" },
        { label: "Performance", icon: <Activity size={20} />, path: "/performance" },
        { label: "Absenteeism", icon: <AlertTriangle size={20} />, path: "/absenteeism" },
        { label: "ML Predictions", icon: <BrainCircuit size={20} />, path: "/predictions" },
        { label: "Recommendations", icon: <GraduationCap size={20} />, path: "/recommendations" },
        { label: "System Settings", icon: <Settings size={20} />, path: "/settings" },
      );
    }

    // HR items
    if (userRole === "HR") {
      baseItems.push(
        { label: "Employee Directory", icon: <Users size={20} />, path: "/employees" },
        { label: "Performance", icon: <Activity size={20} />, path: "/performance" },
        { label: "Absenteeism", icon: <AlertTriangle size={20} />, path: "/absenteeism" },
        { label: "ML Predictions", icon: <BrainCircuit size={20} />, path: "/predictions" },
        { label: "Recommendations", icon: <GraduationCap size={20} />, path: "/recommendations" },
        { label: "Settings", icon: <Settings size={20} />, path: "/settings" },
      );
    }

    // Manager items
    if (userRole === "Manager") {
      baseItems.push(
        { label: "Team Members", icon: <Users size={20} />, path: "/team" },
        { label: "Performance", icon: <Activity size={20} />, path: "/performance" },
        { label: "Absenteeism", icon: <AlertTriangle size={20} />, path: "/absenteeism" },
        { label: "Settings", icon: <Settings size={20} />, path: "/settings" },
      );
    }

    // Employee items
    if (userRole === "Employee") {
      baseItems.push(
        { label: "My Profile", icon: <Users size={20} />, path: "/profile" },
        { label: "Settings", icon: <Settings size={20} />, path: "/settings" },
      );
    }

    return baseItems;
  };

  const menuItems = getMenuItems();

  const handleNavigation = (path) => {
    navigate(path);
    setSidebarOpen(false);
  };

  return (
    <>
      {/* Sidebar */}
      <aside className={`w-64 bg-white border-r border-slate-200 flex flex-col fixed md:static inset-y-0 left-0 z-50 transform transition-transform duration-300 ease-in-out ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } md:translate-x-0 md:flex`}>
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2 text-indigo-600 font-bold text-xl">
            <div className="bg-indigo-600 p-1.5 rounded-lg text-white">
              <BrainCircuit size={24} />
            </div>
            <span className="truncate">HR Analysis</span>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="md:hidden p-2 text-slate-500 hover:bg-slate-100 rounded-lg"
          >
            <X size={20} />
          </button>
        </div>

        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {menuItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <button
                key={item.path}
                onClick={() => handleNavigation(item.path)}
                className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all text-sm ${isActive
                  ? "bg-indigo-50 text-indigo-600 font-semibold"
                  : "text-slate-500 hover:bg-slate-50 font-medium"
                  }`}
              >
                {item.icon}
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Role Badge */}
        <div className="p-4 border-t border-slate-200">
          <div className="px-4 py-3 bg-indigo-50 rounded-lg">
            <p className="text-xs text-slate-500 font-medium">ROLE</p>
            <p className="text-sm font-bold text-indigo-600">{userRole}</p>

          </div>
        </div>

        {/* Logout Button */}
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 px-4 py-2 text-slate-500 hover:text-indigo-500 transition"
        >
          <LogOut size={18} />
          Logout
        </button>
      </aside>
    </>
  );
}