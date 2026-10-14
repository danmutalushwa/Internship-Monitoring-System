"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import {
  Chart as ChartJS,
  BarElement,
  CategoryScale,
  LinearScale,
  ArcElement,
  Tooltip,
  Legend,
  Chart,
} from "chart.js";
import { Bar, Pie } from "react-chartjs-2";

ChartJS.register(BarElement, CategoryScale, LinearScale, ArcElement, Tooltip, Legend);

type SupervisorReport = {
  id: number;
  title: string;
  status: "PENDING" | "APPROVED" | "REJECTED" | "NEEDS_REVISION";
  createdAt: string;
  feedback?: string;
  reviewer?: { id: number; name: string };
  student: { id: number; name: string };
};

export default function SupervisorDashboardPage() {
  const [reports, setReports] = useState<SupervisorReport[]>([]);
  const [weekFilter, setWeekFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [reviewerFilter, setReviewerFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const reportsPerPage = 5;
  const router = useRouter();
  const weeklyChartRef = useRef<Chart<"bar", any[], string> | null>(null);

  useEffect(() => {
    fetch("/api/reports/supervisor")
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
  }, []);

  const reviewerOptions = Array.isArray(reports)
    ? Array.from(new Set(reports.map((r) => r.reviewer?.name).filter(Boolean)))
    : [];

  const filteredReports = Array.isArray(reports)
    ? reports.filter((r) => {
        const weekMatch = weekFilter ? r.title.includes(`Week ${weekFilter}`) : true;
        const statusMatch = statusFilter ? r.status === statusFilter : true;
        const nameMatch = searchQuery
          ? r.student.name.toLowerCase().includes(searchQuery.toLowerCase())
          : true;
        const reviewerMatch = reviewerFilter ? r.reviewer?.name === reviewerFilter : true;
        return weekMatch && statusMatch && nameMatch && reviewerMatch;
      })
    : [];

  const paginatedReports = filteredReports.slice(
    (currentPage - 1) * reportsPerPage,
    currentPage * reportsPerPage
  );

  const weekCounts = Array(8).fill(0);
  filteredReports.forEach((r) => {
    const week = Number(r.title.match(/\d+/)?.[0]);
    if (week >= 1 && week <= 8) weekCounts[week - 1]++;
  });

  const weeklyChartData = {
    labels: weekCounts.map((_, i) => `Week ${i + 1}`),
    datasets: [
      {
        label: "Reports Submitted",
        data: weekCounts,
        backgroundColor: "rgba(59, 130, 246, 0.6)",
        borderRadius: 4,
      },
    ],
  };

  const statusCounts: Record<SupervisorReport["status"], number> = {
    PENDING: 0,
    APPROVED: 0,
    REJECTED: 0,
    NEEDS_REVISION: 0,
  };
  filteredReports.forEach((r) => {
    if (statusCounts[r.status] !== undefined) statusCounts[r.status]++;
  });

  const pieChartData = {
    labels: ["Pending", "Approved", "Rejected", "Needs Revision"],
    datasets: [
      {
        data: [
          statusCounts.PENDING,
          statusCounts.APPROVED,
          statusCounts.REJECTED,
          statusCounts.NEEDS_REVISION,
        ],
        backgroundColor: ["#facc15", "#22c55e", "#ef4444", "#a855f7"],
      },
    ],
  };

  const studentMap = new Map<string, number>();
  filteredReports.forEach((r) => {
    const name = r.student.name;
    studentMap.set(name, (studentMap.get(name) || 0) + 1);
  });

  const studentChartData = {
    labels: Array.from(studentMap.keys()),
    datasets: [
      {
        label: "Reports per Student",
        data: Array.from(studentMap.values()),
        backgroundColor: "rgba(16, 185, 129, 0.6)",
        borderRadius: 4,
      },
    ],
  };

  const downloadChartAsImage = () => {
    const chart = weeklyChartRef.current;
    if (chart) {
      const link = document.createElement("a");
      link.href = chart.toBase64Image();
      link.download = "weekly-submissions.png";
      link.click();
    }
  };

  const exportReportsToCSV = () => {
    const headers = ["Student", "Week", "Status", "Submitted", "Feedback"];
    const rows = reports.map((r) => [
      r.student.name,
      r.title,
      r.status,
      new Date(r.createdAt).toLocaleDateString(),
      r.feedback?.replace(/[\n\r,]/g, " ") || "",
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers, ...rows].map((e) => e.join(",")).join("\n");

    const link = document.createElement("a");
    link.href = encodeURI(csvContent);
    link.download = "reports.csv";
    link.click();
  };

  return (
    <div className="p-4 sm:p-6 lg:ml-[250px] max-w-7xl mx-auto">
      <h1 className="text-2xl sm:text-3xl font-bold mb-6">🧑‍🏫 Supervisor Dashboard</h1>

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <button onClick={downloadChartAsImage} className="text-sm text-blue-600 underline">
          📥 Download Weekly Chart as PNG
        </button>
        <button onClick={exportReportsToCSV} className="text-sm text-green-600 underline">
          📤 Export All Reports to CSV
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4 mb-6">
        <div className="overflow-x-auto">
          <h2 className="text-lg font-semibold mb-2">📊 Weekly Submission Stats</h2>
          <Bar ref={weeklyChartRef} data={weeklyChartData} />
        </div>
        <div className="overflow-x-auto">
          <h2 className="text-lg font-semibold mb-2">🥧 Status Breakdown</h2>
          <Pie data={pieChartData} />
        </div>
        <div className="md:col-span-2 overflow-x-auto">
          <h2 className="text-lg font-semibold mb-2">🧮 Reports per Student</h2>
          <Bar data={studentChartData} />
        </div>
      </div>

      <input
        type="text"
        value={searchQuery}
        onChange={(e) => {
          setSearchQuery(e.target.value);
          setCurrentPage(1);
        }}
        placeholder="Search by student name..."
        className="border p-2 rounded w-full mb-4"
      />

      <div className="flex flex-col sm:flex-row flex-wrap gap-4 mb-6">
        <select
          value={weekFilter}
          onChange={(e) => {
            setWeekFilter(e.target.value);
            setCurrentPage(1);
          }}
          className="border p-2 rounded w-full sm:w-auto"
        >
          <option value="">All Weeks</option>
          {[...Array(8)].map((_, i) => (
            <option key={i} value={i + 1}>
              Week {i + 1}
            </option>
          ))}
        </select>

        <select
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value);
            setCurrentPage(1);
          }}
          className="border p-2 rounded w-full sm:w-auto"
        >
          <option value="">All Statuses</option>
          <option value="PENDING">Pending</option>
          <option value="APPROVED">Approved</option>
          <option value="REJECTED">Rejected</option>
          <option value="NEEDS_REVISION">Needs Revision</option>
        </select>
        <select
          value={reviewerFilter}
          onChange={(e) => {
            setReviewerFilter(e.target.value);
            setCurrentPage(1);
          }}
          className="border p-2 rounded w-full sm:w-auto"
        >
          <option value="">All Reviewers</option>
          {reviewerOptions.map((name) => (
            <option key={name} value={name}>
              {name}
            </option>
          ))}
        </select>
      </div>

      {filteredReports.length === 0 ? (
        <p className="text-gray-500">No matching reports found.</p>
      ) : (
        paginatedReports.map((report: SupervisorReport) => (
          <div key={report.id} className="mb-6 border rounded-lg p-4 shadow-sm bg-white">
            <h2 className="text-lg font-semibold text-blue-700">{report.title}</h2>
            <p className="text-sm text-gray-600">
              Student: <strong>{report.student.name}</strong>
            </p>
            <p className="text-sm">
              Status: <span className="font-medium">{report.status}</span>
            </p>
            <p className="text-sm">
              Submitted: {new Date(report.createdAt).toLocaleDateString()}
            </p>
            {report.feedback && (
              <p className="text-sm text-gray-700 mt-1">
                Feedback: {report.feedback}
              </p>
            )}
            {report.reviewer && (
              <p className="text-sm text-gray-700 mt-1">
                Reviewed by: <strong>{report.reviewer.name}</strong>
              </p>
            )}
          </div>
        ))
      )}

      {filteredReports.length > reportsPerPage && (
        <div className="flex justify-center mt-6 flex-wrap gap-2">
          {Array.from({
            length: Math.ceil(filteredReports.length / reportsPerPage),
          }).map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrentPage(i + 1)}
              className={`px-3 py-1 rounded text-sm ${
                currentPage === i + 1
                  ? "bg-blue-600 text-white"
                  : "bg-gray-200 text-gray-800 hover:bg-gray-300"
              }`}
            >
              {i + 1}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}