import React, { useState } from "react";
import { Menu, X, BrainCircuit, Settings } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";

export default function DashboardLayout({ children }) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);



  return (
    <div className="flex h-screen bg-slate-50 font-sans text-slate-900">
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} userRole={user?.role} />

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        {/* Mobile Header */}
        <div className="md:hidden flex items-center justify-between p-3 sm:p-4 bg-white border-b border-slate-200">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 text-slate-500 hover:bg-slate-100 rounded-lg"
          >
            <Menu size={20} />
          </button>
          <div className="flex items-center gap-1.5 sm:gap-2 text-indigo-600 font-bold text-base sm:text-lg">
            <div className="bg-indigo-600 p-1 rounded text-white">
              <BrainCircuit size={16} />
            </div>
            <span className="truncate">HR Analysis</span>
          </div>
        </div>

        {/* Page Content */}
        <div className="p-3 sm:p-4 md:p-6 lg:p-8">
          {children}
        </div>
      </main>
    </div>
  );
}
