// src/pages/Login.jsx
import React, { useState } from "react";
import { Eye, EyeOff, Lock, Mail, BrainCircuit } from "lucide-react";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const { login } = useAuth();

  const [step, setStep] = useState("login"); // login | changePassword
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // 🔹 Real API call to backend
      const res = await fetch("http://localhost:5000/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || "Login failed");
      }

      const data = await res.json(); // { _id, name, email, role, token }

      // Save user in context + localStorage
      login({ user: data, token: data.token });

      // Optional: first login check (if your backend has a flag)
      if (data.firstLogin) {
        setStep("changePassword");
      } else {
        window.location.href = "/"; // or "/dashboard"
      }
    } catch (err) {
      alert(err.message);
    }

    setLoading(false);
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();

    // 🔹 Send new password to backend (optional)
    alert("Password updated ✔ Redirecting...");
    window.location.href = "/";
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      {/* LEFT SIDE */}
      <div className="hidden lg:flex w-full lg:w-1/2 bg-gradient-to-br from-indigo-600 to-blue-600 text-white p-8 lg:p-12 flex-col justify-between">
        <div className="flex items-center gap-3 text-xl lg:text-2xl font-bold">
          <BrainCircuit size={28} />
          HR Analysis Platform
        </div>

        <div>
          <h1 className="text-3xl lg:text-4xl font-bold leading-tight mb-4">
            Smarter Workforce Intelligence
          </h1>
          <p className="text-indigo-100 max-w-md text-sm lg:text-base">
            Predict attrition, optimize performance, and empower leaders with AI-driven insights.
          </p>
        </div>

        <p className="text-indigo-200 text-xs lg:text-sm">
          © {new Date().getFullYear()} HR Analysis Platform
        </p>
      </div>

      {/* RIGHT SIDE */}
      <div className="flex-1 flex items-center justify-center bg-slate-50 p-4 sm:p-6 lg:p-6">
        <div className="w-full max-w-md bg-white p-6 sm:p-8 rounded-xl sm:rounded-2xl shadow-sm border space-y-6">

          {step === "login" && (
            <>
              <div>
                <h2 className="text-xl sm:text-2xl font-bold">Welcome back</h2>
                <p className="text-slate-500 text-xs sm:text-sm">
                  Enter your credentials to access the platform.
                </p>
              </div>

              <form onSubmit={handleLogin} className="space-y-3 sm:space-y-4">

                {/* Email */}
                <div className="relative">
                  <Mail className="absolute left-3 top-3 sm:top-3.5 text-slate-400" size={18} />
                  <input
                    type="email"
                    placeholder="Work email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 sm:py-3 text-sm sm:text-base bg-white text-slate-900 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
                </div>

                {/* Password & Options Wrapper */}
                <div className="space-y-3">
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 sm:top-3.5 text-slate-400" size={18} />
                    <input
                      type={showPassword ? "text" : "password"}
                      placeholder="Password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full pl-10 pr-10 py-2.5 sm:py-3 text-sm sm:text-base bg-white text-slate-900 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-2.5 sm:top-3 text-slate-400 hover:text-slate-600 focus:outline-none bg-transparent border-none p-1"
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>

                  <div className="flex flex-col sm:flex-row sm:justify-between text-xs sm:text-sm gap-2">
                    <label className="flex items-center gap-2 text-slate-600 cursor-pointer">
                      <input type="checkbox" className="rounded text-indigo-600 focus:ring-indigo-500" /> Remember me
                    </label>
                    <a href="/forgot-password" className="text-indigo-600 hover:underline">
                      Forgot password?
                    </a>
                  </div>
                </div>

                <button
                  className="w-full bg-indigo-600 text-indigo py-2.5 sm:py-3 rounded-lg font-semibold hover:bg-indigo-700 transition flex items-center justify-center text-sm sm:text-base"
                >
                  {loading ? "Signing in..." : "Sign In"}
                </button>

              </form>
            </>
          )}

          {step === "changePassword" && (
            <>
              <div>
                <h2 className="text-2xl font-bold">Set a new password</h2>
                <p className="text-slate-500 text-sm">
                  For security reasons, you must change your temporary password.
                </p>
              </div>

              <form onSubmit={handlePasswordChange} className="space-y-4">
                <input
                  type="password"
                  placeholder="New password"
                  required
                  className="w-full py-3 px-4 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                />
                <input
                  type="password"
                  placeholder="Confirm password"
                  required
                  className="w-full py-3 px-4 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                />

                <button className="w-full bg-indigo-600 text-indigo py-3 rounded-lg font-semibold hover:bg-indigo-700">
                  Update Password
                </button>
              </form>
            </>
          )}

        </div>
      </div>
    </div>
  );
}