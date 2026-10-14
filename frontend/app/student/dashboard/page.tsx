"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

// Types
type Faculty = { name: string };

type Student = {
  id: number;
  name: string;
  internshipId?: number;            // ✅ added
  internshipCompany?: string;
  internshipStatus?: string;
  faculty?: Faculty;
};

type ReportStatus = "APPROVED" | "PENDING" | "REJECTED" | "NEEDS_REVISION";

type Report = {
  id: number;
  title: string;
  status: ReportStatus;
  createdAt: string;
};

export default function StudentDashboard() {
  const [student, setStudent] = useState<Student | null>(null);
  const [reports, setReports] = useState<Report[]>([]);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("accessToken");

    if (!token) {
      console.warn("No token found, redirecting to login");
      router.push("/login");
      return;
    }

    // Fetch student profile
    fetch("/api/student/me", {   // use /api/student/me instead of /api/auth/me
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => {
        if (!res.ok) throw new Error("Unauthorized");
        return res.json();
      })
      .then(setStudent)
      .catch((err) => {
        console.error("Failed to fetch student profile:", err);
        setStudent(null);
      });

    // Fetch student reports
    fetch("/api/student/reports", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setReports(data);
        } else if (Array.isArray(data.reports)) {
          setReports(data.reports);
        } else {
          console.warn("Unexpected reports shape:", data);
          setReports([]);
        }
      })
      .catch((err) => {
        console.error("Failed to fetch reports:", err);
        setReports([]);
      });
  }, [router]);

  if (!student) return <div className="p-4">Loading...</div>;

  // ✅ Counters
  const submittedCount = reports.length;
  const approvedCount = reports.filter((r) => r.status === "APPROVED").length;
  const pendingCount = reports.filter((r) => r.status === "PENDING").length;
  const rejectedCount = reports.filter((r) => r.status === "REJECTED").length;

  const canMarkCompleted = submittedCount === 8 && approvedCount === 8;

  // ✅ Use internshipId instead of student.name
  const handleMarkCompleted = async () => {
    const token = localStorage.getItem("accessToken");
    if (!token || !student?.internshipId) return;

    try {
      const res = await fetch(`/api/internships/${student.internshipId}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: "COMPLETED" }),
      });

      if (!res.ok) throw new Error("Failed to update internship status");

      const updated = await res.json();
      setStudent((prev) =>
        prev ? { ...prev, internshipStatus: updated.status } : prev
      );
    } catch (err) {
      console.error("Error marking internship as completed:", err);
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:ml-[250px]">
      <h1 className="text-xl sm:text-2xl font-bold mb-4">
        🎓 Welcome, {student.name}
      </h1>

      {/* Internship Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 mb-6">
        <div className="bg-white border rounded-lg p-4 shadow-sm">
          <h2 className="text-base sm:text-lg font-semibold mb-2">
            Internship Status
          </h2>
          <p>
            <strong>Company:</strong> {student.internshipCompany ?? "N/A"}
          </p>
          <p>
            <strong>Status:</strong> {student.internshipStatus ?? "N/A"}
          </p>
          <p>
            <strong>Faculty:</strong> {student.faculty?.name ?? "N/A"}
          </p>

          {canMarkCompleted && (
            <button
              onClick={handleMarkCompleted}
              className="mt-3 bg-green-600 text-white px-3 py-2 rounded hover:bg-green-700"
            >
              ✅ Mark Internship as Completed
            </button>
          )}
        </div>

        {/* Report Progress */}
        <div className="bg-white border rounded-lg p-4 shadow-sm">
          <h2 className="text-base sm:text-lg font-semibold mb-2">
            Report Progress
          </h2>
          <div className="w-full bg-gray-200 rounded-full h-4 mb-2">
            <div
              className="bg-blue-600 h-4 rounded-full"
              style={{ width: `${(submittedCount / 8) * 100}%` }}
            />
          </div>
          <p>
            <strong>Submitted:</strong> {submittedCount} / 8
          </p>
          <p>
            <strong>Approved:</strong> {approvedCount}
          </p>
          <p>
            <strong>Pending:</strong> {pendingCount}
          </p>
          <p>
            <strong>Rejected:</strong> {rejectedCount}
          </p>
        </div>
      </div>

      {/* Recent Reports */}
      <div className="bg-white border rounded-lg p-4 shadow-sm mb-6">
        <h2 className="text-base sm:text-lg font-semibold mb-2">
          Recent Reports
        </h2>
        <ul className="list-disc pl-5">
          {reports.slice(-3).reverse().map((r) => (
            <li key={r.id}>
              {r.title} — {r.status} (
              {new Date(r.createdAt).toLocaleDateString()})
            </li>
          ))}
        </ul>
      </div>

      {/* Submit New Report */}
      <div className="text-right">
        <button
          onClick={() => router.push("/student/reports/new")}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 w-full sm:w-auto"
        >
          ➕ Submit New Report
        </button>
      </div>
    </div>
  );
}