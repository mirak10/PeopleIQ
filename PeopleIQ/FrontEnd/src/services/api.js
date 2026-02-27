const API_BASE = "http://localhost:5000/api";

export const fetchEmployees = async () => {
  const res = await fetch(`${API_BASE}/employees`);
  return res.json();
};