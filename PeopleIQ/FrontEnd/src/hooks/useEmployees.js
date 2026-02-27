// hooks/useEmployees.js
import { useEffect, useState } from "react";

const API = "http://localhost:5000/api/employees";

export default function useEmployees(user) {
  const [employees, setEmployees] = useState([]);   // MUST be array
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [mode, setMode] = useState("single");

  const [form, setForm] = useState({
    name: "",
    email: "",
    department: "",
    role: "Employee",
  });

  const [saving, setSaving] = useState(false);

  const [bulkFile, setBulkFile] = useState(null);
  const [uploading, setUploading] = useState(false);

  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  const [editForm, setEditForm] = useState({});
  const [deleting, setDeleting] = useState(false);

  const getToken = () => {
  const stored = localStorage.getItem("user");
  if (!stored) return null;

  try {
    const parsed = JSON.parse(stored);
    return parsed?.token || null;
  } catch {
    return null;
  }
};

  const authHeaders = () => {
    const token = getToken();
    return {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
    };
  };

  // ✅ FETCH EMPLOYEES
  const fetchEmployees = async () => {
    try {
      setLoading(true);
      const res = await fetch(API, { headers: authHeaders() });
      const data = await res.json();

      if (!res.ok) throw new Error(data.message);

      // ⭐ CRITICAL LINE — ALWAYS STORE ARRAY
      setEmployees(Array.isArray(data.data) ? data.data : []);
    } catch (err) {
      console.error("Fetch employees error:", err.message);
      setMessage("Failed to fetch employees");
      setEmployees([]); // prevent UI crash
    } finally {
      setLoading(false);
    }
  };

  // ✅ ADD EMPLOYEE
  const handleAddEmployee = async () => {
    try {
      setSaving(true);
      const res = await fetch(API, {
        method: "POST",
        headers: authHeaders(),
        body: JSON.stringify(form),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      setMessage("Employee added successfully");
      setShowModal(false);
      setForm({ name: "", email: "", department: "", role: "Employee" });

      fetchEmployees();
    } catch (err) {
      console.error(err);
      setMessage(err.message || "Add failed");
    } finally {
      setSaving(false);
    }
  };

  // ✅ UPDATE EMPLOYEE
  const handleUpdateEmployee = async () => {
    if (!selectedEmployee) return;

    try {
      setSaving(true);
      const res = await fetch(`${API}/${selectedEmployee._id}`, {
        method: "PUT",
        headers: authHeaders(),
        body: JSON.stringify(editForm),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      setMessage("Employee updated");
      setShowDetailModal(false);
      fetchEmployees();
    } catch (err) {
      console.error(err);
      setMessage(err.message || "Update failed");
    } finally {
      setSaving(false);
    }
  };

  // ✅ DELETE EMPLOYEE
  const handleDeleteEmployee = async () => {
    if (!selectedEmployee) return;

    try {
      setDeleting(true);
      const res = await fetch(`${API}/${selectedEmployee._id}`, {
        method: "DELETE",
        headers: authHeaders(),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      setMessage("Employee deleted");
      setShowDetailModal(false);
      fetchEmployees();
    } catch (err) {
      console.error(err);
      setMessage(err.message || "Delete failed");
    } finally {
      setDeleting(false);
    }
  };

  // placeholders for features you already wired in UI
  const handleBulkUpload = async () => {};
  const downloadTemplate = () => {};

  useEffect(() => {
    if (user) fetchEmployees();
  }, [user]);

  return {
    employees,
    loading,
    message,
    setMessage,
    search,
    setSearch,
    showModal,
    setShowModal,
    mode,
    setMode,
    form,
    setForm,
    saving,
    handleAddEmployee,
    bulkFile,
    setBulkFile,
    uploading,
    handleBulkUpload,
    downloadTemplate,
    selectedEmployee,
    setSelectedEmployee,
    showDetailModal,
    setShowDetailModal,
    editForm,
    setEditForm,
    handleUpdateEmployee,
    handleDeleteEmployee,
    deleting,
  };
}