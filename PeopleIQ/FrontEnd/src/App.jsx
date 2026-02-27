import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import ProtectedRoute from "./components/ProtectedRoute";
import DashboardLayout from "./layout/DashboardLayout";
import Login from "./pages/Login";
import ForgotPassword from "./pages/ForgotPassword";
import Dashboard from "./pages/Dashboard";
import EmployeeDirectory from "./pages/EmployeeDirectory";
import PerformancePage from "./pages/PerformancePage";
import AbsenteeismPage from "./pages/AbsenteeismPage";
import PredictionsPage from "./pages/PredictionsPage";
import RecommendationsPage from "./pages/RecommendationsPage";
import { useAuth } from "./context/AuthContext";

function DashboardRouter() {
  const { user } = useAuth();
  const r = (user?.role || "").toString().toLowerCase();
  if (r === "admin") return <Dashboard role="admin" />;
  if (r === "hr") return <Dashboard role="hr" />;
  if (r === "manager") return <Dashboard role="manager" />;
  return <Dashboard role="employee" />;
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* Public */}
        <Route path="/login" element={<Login />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />

        {/* Dashboard */}
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <DashboardLayout>
                <DashboardRouter />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />

        {/* HR/Admin Directory */}
        <Route
          path="/employees"
          element={
            <ProtectedRoute roles={["Admin", "HR"]}>
              <DashboardLayout>
                <EmployeeDirectory />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />

        {/* Manager Team View */}
        <Route
          path="/team"
          element={
            <ProtectedRoute roles={["Manager"]}>
              <DashboardLayout>
                <EmployeeDirectory managerView />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />

        {/* Performance Analytics */}
        <Route
          path="/performance"
          element={
            <ProtectedRoute roles={["Admin", "HR", "Manager"]}>
              <DashboardLayout>
                <PerformancePage />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />

        {/* Absenteeism */}
        <Route
          path="/absenteeism"
          element={
            <ProtectedRoute roles={["Admin", "HR", "Manager"]}>
              <DashboardLayout>
                <AbsenteeismPage />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />

        {/* ML Predictions */}
        <Route
          path="/predictions"
          element={
            <ProtectedRoute roles={["Admin", "HR"]}>
              <DashboardLayout>
                <PredictionsPage />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />

        {/* Recommendations */}
        <Route
          path="/recommendations"
          element={
            <ProtectedRoute roles={["Admin", "HR"]}>
              <DashboardLayout>
                <RecommendationsPage />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />

        {/* fallback */}
        <Route path="*" element={<Navigate to="/" />} />

      </Routes>
    </BrowserRouter>
  );
}