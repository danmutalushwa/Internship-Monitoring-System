'use client';

import { useEffect, useState } from 'react';

interface Report {
  id: string;
  name: string;
  student: string;
  faculty: string;
  type: string;
  url: string;
  createdAt: string;
}

export default function AllReportsPage() {
  const [reports, setReports] = useState<Report[]>([]);
  const [filtered, setFiltered] = useState<Report[]>([]);
  const [facultyFilter, setFacultyFilter] = useState('');
  const [studentFilter, setStudentFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  useEffect(() => {
    async function fetchReports() {
      try {
        const token = localStorage.getItem('accessToken');
        const query = new URLSearchParams({
          faculty: facultyFilter,
          student: studentFilter,
          type: typeFilter,
          startDate,
          endDate,
        });
        const res = await fetch(`/api/reports?${query}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        setReports(data);
        setFiltered(data);
      } catch (err) {
        console.error('Failed to fetch reports:', err);
      }
    }

    fetchReports();
  }, [facultyFilter, studentFilter, typeFilter, startDate, endDate]);

  const faculties = Array.from(new Set(reports.map((r) => r.faculty)));
  const types = Array.from(new Set(reports.map((r) => r.type)));

  const exportQuery = new URLSearchParams({
    faculty: facultyFilter,
    student: studentFilter,
    type: typeFilter,
    startDate,
    endDate,
  }).toString();

  return (
    <div className="px-4 sm:px-6 lg:px-8 lg:pl-72 py-6 space-y-6 max-w-full">
      <h1 className="text-xl sm:text-2xl font-bold">📄 All Reports</h1>

      {/* Filters */}
      <div className="flex flex-wrap gap-4 items-center justify-start">
        <select
          value={facultyFilter}
          onChange={(e) => setFacultyFilter(e.target.value)}
          className="border p-2 rounded"
        >
          <option value="">All Faculties</option>
          {faculties.map((f) => (
            <option key={f} value={f}>{f}</option>
          ))}
        </select>

        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          className="border p-2 rounded"
        >
          <option value="">All Types</option>
          {types.map((t) => (
            <option key={t} value={t}>{t}</option>
          ))}
        </select>

        <input
          type="text"
          placeholder="Search by student name"
          value={studentFilter}
          onChange={(e) => setStudentFilter(e.target.value)}
          className="border p-2 rounded w-64"
        />

        <input
          type="date"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
          className="border p-2 rounded"
        />

        <input
          type="date"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
          className="border p-2 rounded"
        />

        <a
          href={`/api/reports/export?${exportQuery}`}
          className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 whitespace-nowrap"
        >
          Export CSV
        </a>
      </div>

      {/* Table */}
      <div className="w-full overflow-x-auto border rounded">
        <table className="min-w-[600px] w-full text-sm">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-2 text-left">Report</th>
              <th className="p-2 text-left">Student</th>
              <th className="p-2 text-left">Faculty</th>
              <th className="p-2 text-left">Type</th>
              <th className="p-2 text-left">Date</th>
              <th className="p-2 text-left">Download</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((report) => (
              <tr key={report.id} className="border-t">
                <td className="p-2">{report.name}</td>
                <td className="p-2">{report.student}</td>
                <td className="p-2">{report.faculty}</td>
                <td className="p-2">{report.type}</td>
                <td className="p-2">{report.createdAt}</td>
                <td className="p-2">
                  <a
                    href={report.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline"
                  >
                    Download
                  </a>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={6} className="p-4 text-center text-gray-500">
                  No reports found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}