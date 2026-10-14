'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

type SupervisorReport = {
  id: number;
  title: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'NEEDS_REVISION';
  createdAt: string;
  feedback?: string;
  student: {
    id: number;
    name: string;
  };
};

export default function SupervisorReviewReportsPage() {
  const [reports, setReports] = useState<SupervisorReport[]>([]);
  const [weekFilter, setWeekFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const reportsPerPage = 5;
  const router = useRouter();

  useEffect(() => {
    let retries = 0;
    const maxRetries = 10;
    const delay = 500;

    const tryFetch = async () => {
      const token = localStorage.getItem('token');

      if (!token) {
        if (retries < maxRetries) {
          retries++;
          setTimeout(tryFetch, delay);
        } else {
          setLoading(false);
        }
        return;
      }

      try {
        const res = await fetch('/api/supervisor/reports', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await res.json();
        if (Array.isArray(data)) {
          setReports(data);
        } else if (Array.isArray(data.reports)) {
          setReports(data.reports);
        } else {
          setReports([]);
        }
      } catch {
        setReports([]);
      } finally {
        setLoading(false);
      }
    };

    tryFetch();
  }, []);

  const filteredReports = reports.filter((r) => {
    const weekMatch = weekFilter ? r.title.includes(`Week ${weekFilter}`) : true;
    const statusMatch = statusFilter ? r.status === statusFilter : true;
    const nameMatch = searchQuery
      ? r.student.name.toLowerCase().includes(searchQuery.toLowerCase())
      : true;
    return weekMatch && statusMatch && nameMatch;
  });

  const paginatedReports = filteredReports.slice(
    (currentPage - 1) * reportsPerPage,
    currentPage * reportsPerPage
  );

  return (
    <main className="mt-[70px] lg:mt-0 lg:ml-[250px] p-4 sm:p-6 lg:p-8 max-w-screen-xl mx-auto">
      <h1 className="text-2xl sm:text-3xl font-bold mb-6">📑 Review Reports</h1>

      {/* 🔍 Search & Filters */}
      <div className="flex flex-col sm:flex-row flex-wrap gap-4 mb-6">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => {
            setSearchQuery(e.target.value);
            setCurrentPage(1);
          }}
          placeholder="Search by student name..."
          className="border p-2 rounded w-full sm:w-auto"
        />

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
      </div>

      {/* 📋 Report Cards */}
      {loading ? (
        <p>Loading...</p>
      ) : filteredReports.length === 0 ? (
        <p className="text-gray-500">
          Report not found. Once students submit their reports, you’ll be able to review and give feedback.
        </p>
      ) : (
        paginatedReports.map((report) => (
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
              <p className="text-sm mt-1 text-gray-700">
                💬 Feedback: <span className="italic">{report.feedback}</span>
              </p>
            )}
            <div className="mt-2">
              <button
                onClick={() => router.push(`/supervisor/reports/${report.id}`)}
                className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700 text-sm"
              >
                🔍 Review Report
              </button>
            </div>
          </div>
        ))
      )}

      {/* 📄 Pagination */}
      {filteredReports.length > reportsPerPage && (
        <div className="flex justify-center gap-2 mt-6 flex-wrap">
          {Array.from(
            { length: Math.ceil(filteredReports.length / reportsPerPage) },
            (_, i) => (
              <button
                key={i}
                onClick={() => setCurrentPage(i + 1)}
                className={`px-3 py-1 rounded text-sm ${
                  currentPage === i + 1
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
                }`}
              >
                {i + 1}
              </button>
            )
          )}
        </div>
      )}
    </main>
  );
}