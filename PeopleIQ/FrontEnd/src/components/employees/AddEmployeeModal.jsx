// components/AddEmployeeModal.jsx
import React from "react";
import { Upload } from "lucide-react";

export default function AddEmployeeModal({
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
  setShowModal,
  roleOptions,
}) {
  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white w-full max-w-xl rounded-lg sm:rounded-2xl shadow-xl p-4 sm:p-6 space-y-4 sm:space-y-6 max-h-[90vh] overflow-y-auto">
        {/* HEADER */}
        <div className="flex items-center justify-between">
          <h2 className="text-lg sm:text-xl font-bold">Add Employees</h2>
          <button
            onClick={() => setShowModal(false)}
            className="text-slate-400 hover:text-slate-600 text-2xl"
          >
            ✕
          </button>
        </div>

        {/* MODE SWITCH */}
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => setMode("single")}
            className={`flex items-center gap-2 px-3 sm:px-4 py-2 rounded-lg border text-sm sm:text-base ${
              mode === "single"
                ? "bg-indigo-50 border-indigo-500 text-indigo-600"
                : "border-slate-200 text-indigo-600"
            }`}
          >
            Single
          </button>

          <button
            onClick={() => setMode("bulk")}
            className={`flex items-center gap-2 px-3 sm:px-4 py-2 rounded-lg border text-sm sm:text-base ${
              mode === "bulk"
                ? "bg-indigo-50 border-indigo-500 text-indigo-600"
                : "border-slate-200 text-indigo-600"
            }`}
          >
            Bulk Upload
          </button>
        </div>

        {/* SINGLE FORM */}
        {mode === "single" && (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleAddEmployee(form);
            }}
            className="space-y-3 sm:space-y-4"
          >
            <input
              className="w-full p-2.5 sm:p-3 border rounded-lg text-sm sm:text-base"
              placeholder="Full Name"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              required
            />
            <input
              type="email"
              className="w-full p-2.5 sm:p-3 border rounded-lg text-sm sm:text-base"
              placeholder="Email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              required
            />
            <input
              className="w-full p-2.5 sm:p-3 border rounded-lg text-sm sm:text-base"
              placeholder="Department"
              value={form.department}
              onChange={(e) => setForm({ ...form, department: e.target.value })}
              required
            />

            <select
              className="w-full p-2.5 sm:p-3 border rounded-lg text-sm sm:text-base"
              value={form.role}
              onChange={(e) => setForm({ ...form, role: e.target.value })}
            >
              {roleOptions.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>

            <button
              type="submit"
              className="w-full bg-indigo-50 text-indigo-600 py-2.5 sm:py-3 rounded-lg font-semibold hover:bg-indigo-100 border border-indigo-600 text-sm sm:text-base"
            >
              {saving ? "Saving..." : "Add Employee"}
            </button>
          </form>
        )}

        {/* BULK UPLOAD */}
        {mode === "bulk" && (
          <div className="space-y-3 sm:space-y-4">
            <div className="border-2 border-dashed rounded-lg sm:rounded-xl p-4 sm:p-6 text-center text-slate-500 hover:bg-slate-50 transition">
              <label
                htmlFor="bulk-file"
                className="cursor-pointer inline-flex items-center gap-2 text-sm sm:text-base"
              >
                <Upload size={18} /> Upload Excel (.xlsx or .csv)
              </label>
              <input
                id="bulk-file"
                type="file"
                accept=".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel"
                className="hidden"
                onChange={(e) => setBulkFile(e.target.files?.[0] ?? null)}
              />

              {bulkFile && <p className="text-xs sm:text-sm text-slate-600 mt-2">Selected file: {bulkFile.name}</p>}
            </div>

            <button
              onClick={downloadTemplate}
              className="w-full bg-indigo-50 text-indigo-600 py-2.5 sm:py-3 rounded-lg font-semibold hover:bg-indigo-100 border border-indigo-600 text-sm sm:text-base"
            >
              Download Template
            </button>

            <button
              disabled={!bulkFile || uploading}
              onClick={async () => {
                if (!bulkFile) return;
                await handleBulkUpload(bulkFile);
              }}
              className={`w-full py-2.5 sm:py-3 rounded-lg font-semibold transition transform duration-200 ease-out text-sm sm:text-base ${
                !bulkFile
                  ? "bg-slate-200 text-slate-400 cursor-not-allowed opacity-80 translate-y-2"
                  : uploading
                  ? "bg-indigo-500 text-indigo-600 opacity-90 translate-y-0"
                  : "bg-indigo-600 text-indigo-600 hover:bg-indigo-700 shadow-md opacity-100 translate-y-0"
              }`}
            >
              {uploading ? "Uploading..." : "Add Employees"}
            </button>

            {uploading && <p className="text-slate-500 text-xs sm:text-sm">Uploading...</p>}
          </div>
        )}
      </div>
    </div>
  );
}