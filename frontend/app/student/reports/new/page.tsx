"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

export default function SubmitReportPage() {
  const router = useRouter();
  const [week, setWeek] = useState(1);
  const [rows, setRows] = useState(
    Array.from({ length: 5 }, (_, i) => ({
      day: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"][i],
      department: "",
      task: "",
      outcome: "",
      remark: "",
    }))
  );
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const startDate = new Date("2025-06-02");
    const today = new Date();
    const diff = Math.floor((today.getTime() - startDate.getTime()) / (7 * 24 * 60 * 60 * 1000));
    const currentWeek = Math.min(8, Math.max(1, diff + 1));
    setWeek(currentWeek);
  }, []);

  const handleSubmit = async () => {
    setLoading(true);

    const content = [
      "| Day/Date | Department/Section | Description of Activities/Tasks | Learning Outcomes | Remarks |",
      "|----------|--------------------|----------------------------------|--------------------|---------|",
      ...rows.map(
        (r) => `| ${r.day} | ${r.department} | ${r.task} | ${r.outcome} | ${r.remark} |`
      ),
    ].join("\n");

    const formData = new FormData();
    formData.append("title", `Week ${week} Logbook`);
    formData.append("content", content);
    if (file) formData.append("file", file);

    try {
      const token = localStorage.getItem("accessToken")
      const res = await fetch("/api/reports", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || "Submission failed");
      }

      const data = await res.json();
      toast.success(data.message || "Report submitted!");
      router.push("/student/reports");
    } catch (err: any) {
      toast.error(err.message || "Failed to submit report");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:ml-[250px] max-w-7xl mx-auto">
      <h1 className="text-4xl font-extrabold text-blue-700 mb-10 tracking-tight">
        ➕ Submit Weekly Report
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Form Section */}
        <div>
          <label className="block mb-2 font-semibold text-gray-700">Week</label>
          <select
            value={week}
            onChange={(e) => setWeek(Number(e.target.value))}
            className="mb-6 p-2 border rounded w-full bg-white shadow-sm"
          >
            {Array.from({ length: 8 }, (_, i) => (
              <option key={i} value={i + 1}>
                Week {i + 1}
              </option>
            ))}
          </select>

          <div className="overflow-x-auto">
            <table className="w-full max-w-[900px] text-sm mb-6 shadow-sm divide-y divide-gray-200">
              <thead className="bg-gray-100 text-gray-700 font-medium divide-x divide-gray-200">
                <tr>
                  <th className="p-3 text-left w-[15%]">Day</th>
                  <th className="p-3 text-left w-[20%]">Department</th>
                  <th className="p-3 text-left w-[25%]">Task</th>
                  <th className="p-3 text-left w-[25%]">Outcome</th>
                  <th className="p-3 text-left w-[15%]">Remark</th> 
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {rows.map((r, i) => (
                  <tr key={i} className="divide-x divide-gray-100">
                    <td className="p-3 font-semibold">{r.day}</td>
                    {["department", "task", "outcome", "remark"].map((field) => (
                      <td key={field} className="p-3">
                        <input
                          value={r[field as keyof typeof r]}
                          onChange={(e) =>
                            setRows((prev) =>
                              prev.map((row, idx) =>
                                idx === i ? { ...row, [field]: e.target.value } : row
                              )
                            )
                          }
                          className="w-full bg-white border border-gray-300 rounded px-2 py-1 text-sm"
                        />
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <label className="block mb-2 font-semibold text-gray-700">
            Upload Report File (PDF/DOC)
          </label>
          <input
            type="file"
            accept=".pdf,.doc,.docx"
            onChange={(e) => setFile(e.target.files?.[0] || null)}
            className="mb-2"
          />
          {file && (
            <p className="text-sm text-gray-600 mb-6">
              📄 {file.name} ({(file.size / 1024).toFixed(1)} KB)
            </p>
          )}

          <button
            onClick={handleSubmit}
            disabled={loading}
            className={`w-full sm:w-auto bg-blue-600 text-white px-6 py-3 rounded font-semibold hover:bg-blue-700 transition ${
              loading ? "opacity-50 cursor-not-allowed" : ""
            }`}
          >
            {loading ? "Submitting..." : "Submit Report"}
          </button>
        </div>

        {/* Optional Sidebar Tips */}
        <div className="hidden lg:block lg:ml-6">
          <div className="bg-gray-50 p-6 rounded shadow-md">
            <h2 className="text-lg font-semibold mb-3 text-gray-800">Submission Tips</h2>
            <ul className="list-disc pl-5 text-sm text-gray-700 space-y-2">
              <li>Fill all fields clearly and accurately</li>
              <li>Attach your weekly log file before submitting</li>
              <li>Use the sidebar to navigate past reports</li>
              <li>Click "Submit Report" when ready</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}