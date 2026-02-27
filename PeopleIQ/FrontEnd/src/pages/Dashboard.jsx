import AdminDashboard from "../components/dashboard/AdminDashboard";
import HRDashboard from "../components/dashboard/HRDashboard";
import ManagerDashboard from "../components/dashboard/ManagerDashboard";
import EmployeeDashboard from "../components/dashboard/EmployeeDashboard";
import { ROLES } from "../config/roles";

export default function Dashboard({ role }) {
  const r = (role || "").toString().toLowerCase();

  switch (r) {
    case ROLES.ADMIN:
      return <AdminDashboard />;

    case ROLES.HR:
      return <HRDashboard />;

    case ROLES.MANAGER:
      return <ManagerDashboard />;

    case ROLES.EMPLOYEE:
      return <EmployeeDashboard />;

    default:
      return <div className="p-6">No dashboard available</div>;
  }
}