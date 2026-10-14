'use client';

import { useEffect, useState } from 'react';

type FeedbackReport = {
  id: number;
  title: string;
  createdAt: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'NEEDS_REVISION';
  feedback?: string;
  student: {
    id: number;
    name: string;
  };
};

export default function SupervisorFeedbackPage() {
  const [reports, setReports] = useState<FeedbackReport[]>([]);
  const [weekFilter, setWeekFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const reportsPerPage = 5;

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return;

    fetch('/api/supervisor/feedback', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setReports(data);
        } else if (Array.isArray(data.reports)) {
          setReports(data.reports);
        } else {
          console.warn('Unexpected reports shape:', data);
          setReports([]);
        }
      })
      .catch((err) => {
        console.error('Failed to fetch supervisor feedback reports:', err);
        setReports([]);
      });
  }, []);

  const filteredReports = Array.isArray(reports)
    ? reports.filter((r) => {
        const weekMatch = weekFilter ? r.title.includes(`Week ${weekFilter}`) : true;
        const statusMatch = statusFilter ? r.status === statusFilter : true;
        const nameMatch = searchQuery
          ? r.student.name.toLowerCase().includes(searchQuery.toLowerCase())
          : true;
        return weekMatch && statusMatch && nameMatch && r.feedback;
      })
    : [];

  const paginatedReports = filteredReports.slice(
    (currentPage - 1) * reportsPerPage,
    currentPage * reportsPerPage
  );

  return (
    <main className="mt-[70px] lg:mt-0 lg:ml-[250px] p-4 sm:p-6 lg:p-8 max-w-screen-xl mx-auto">
      <h1 className="text-2xl sm:text-3xl font-bold mb-6">🧑‍🏫 Supervisor Feedback</h1>

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

      {/* 💬 Feedback Cards */}
      {filteredReports.length === 0 ? (
        <p className="text-gray-500">No feedback found.</p>
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
            <p className="text-sm mt-1 text-gray-700">
              💬 Feedback: <span className="italic">{report.feedback}</span>
            </p>
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