import React, { useState } from "react";
import { Mail, ArrowLeft, BrainCircuit } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function ForgotPassword() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // 🔹 Replace with real API call later
      // await fetch("/api/forgot-password", { method: "POST", body: JSON.stringify({ email }) })

      // Simulate API call
      setTimeout(() => {
        setSubmitted(true);
        setLoading(false);
      }, 1000);
    } catch (err) {
      alert("Failed to send reset email. Try again.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* LEFT SIDE */}
      <div className="hidden lg:flex w-1/2 bg-gradient-to-br from-indigo-600 to-blue-600 text-white p-12 flex-col justify-between">
        <div className="flex items-center gap-3 text-2xl font-bold">
          <BrainCircuit size={32} />
          HR Analysis Platform
        </div>

        <div>
          <h1 className="text-4xl font-bold leading-tight mb-4">
            Smarter Workforce Intelligence
          </h1>
          <p className="text-indigo-100 max-w-md">
            Predict attrition, optimize performance, and empower leaders with AI-driven insights.
          </p>
        </div>

        <p className="text-indigo-200 text-sm">
          © {new Date().getFullYear()} HR Analysis Platform
        </p>
      </div>

      {/* RIGHT SIDE */}
      <div className="flex-1 flex items-center justify-center bg-slate-50 p-6">
        <div className="w-full max-w-md bg-white p-8 rounded-2xl shadow-sm border space-y-6">

          {!submitted ? (
            <>
              <div>
                <h2 className="text-2xl font-bold">Reset your password</h2>
                <p className="text-slate-500 text-sm">
                  Enter your email address and we'll send you a link to reset your password.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="relative">
                  <Mail className="absolute left-3 top-3.5 text-slate-400" size={18} />
                  <input
                    type="email"
                    placeholder="Work email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-white text-slate-900 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full bg-indigo-600 text-white py-3 rounded-lg font-semibold hover:bg-indigo-700 transition"
                >
                  {loading ? "Sending..." : "Send Reset Link"}
                </button>
              </form>

              <button
                type="button"
                onClick={() => navigate("/login")}
                className="w-full flex items-center justify-center gap-2 text-indigo-600 hover:text-indigo-700 font-medium"
              >
                <ArrowLeft size={16} />
                Back to login
              </button>
            </>
          ) : (
            <>
              <div className="text-center space-y-4">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                  <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>

                <h2 className="text-2xl font-bold">Check your email</h2>
                <p className="text-slate-500">
                  We've sent a password reset link to <strong>{email}</strong>
                </p>
                <p className="text-slate-500 text-sm">
                  Click the link in the email to reset your password. The link expires in 1 hour.
                </p>
              </div>

              <button
                type="button"
                onClick={() => navigate("/login")}
                className="w-full bg-indigo-600 text-white py-3 rounded-lg font-semibold hover:bg-indigo-700 transition"
              >
                Back to login
              </button>
            </>
          )}

        </div>
      </div>
    </div>
  );
}