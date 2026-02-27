// src/services/mlService.js
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

const getToken = () => {
    // AuthContext stores token under separate 'token' key
    const token = localStorage.getItem("token");
    if (token) return token;
    // Fallback: check if token is inside user object
    try {
        const user = JSON.parse(localStorage.getItem("user"));
        return user?.token || "";
    } catch {
        return "";
    }
};

const headers = () => ({
    "Content-Type": "application/json",
    Authorization: `Bearer ${getToken()}`,
});

export const fetchPredictionSummary = async () => {
    const res = await fetch(`${API_URL}/api/predictions/summary`, { headers: headers() });
    return res.json();
};

export const fetchTurnoverData = async () => {
    const res = await fetch(`${API_URL}/api/predictions/turnover`, { headers: headers() });
    return res.json();
};

export const fetchPerformanceData = async () => {
    const res = await fetch(`${API_URL}/api/predictions/performance`, { headers: headers() });
    return res.json();
};

export const fetchAbsenteeismData = async () => {
    const res = await fetch(`${API_URL}/api/predictions/absenteeism`, { headers: headers() });
    return res.json();
};

export const fetchRecommendationsData = async () => {
    const res = await fetch(`${API_URL}/api/predictions/recommendations`, { headers: headers() });
    return res.json();
};

export const fetchAlerts = async () => {
    const res = await fetch(`${API_URL}/api/predictions/alerts`, { headers: headers() });
    return res.json();
};

export const fetchPredictions = async (page = 1, limit = 50, filters = {}) => {
    const params = new URLSearchParams({ page, limit, ...filters });
    const res = await fetch(`${API_URL}/api/predictions?${params}`, { headers: headers() });
    return res.json();
};

export const fetchEmployeePrediction = async (empId) => {
    const res = await fetch(`${API_URL}/api/predictions/${empId}`, { headers: headers() });
    return res.json();
};

export const fetchDepartmentPredictions = async (dept) => {
    const res = await fetch(`${API_URL}/api/predictions/department/${dept}`, { headers: headers() });
    return res.json();
};
