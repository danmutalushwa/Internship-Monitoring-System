'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

interface Report {
  id: number;
  title: string;
  status: 'APPROVED' | 'PENDING' | 'REJECTED';
  date: string;
}

export default function ReportsPage() {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (!token) {
      setError('Missing access token');
      setLoading(false);
      return;
    }

    fetch('http://localhost:4000/api/reports', {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => {
        if (!res.ok) throw new Error('Failed to fetch reports');
        return res.json();
      })
      .then((data) => setReports(data))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p className="text-center mt-10 text-gray-600">Loading reports...</p>;
  if (error) return <p className="text-center text-red-500 mt-10">{error}</p>;

  return (
    <main className="min-h-screen px-4 sm:px-6 lg:pl-72 py-6">
      <h1 className="text-2xl font-bold mb-6">Submitted Reports</h1>

      {reports.length === 0 ? (
        <p className="text-sm text-gray-500">No reports found.</p>
      ) : (
        <ul className="space-y-4">
          {reports.map((report) => (
            <li key={report.id} className="bg-white p-4 rounded-lg shadow border border-gray-200">
              <Link href={`/reports/${report.id}`}>
                <h2 className="text-lg font-semibold text-blue-600 hover:underline">{report.title}</h2>
              </Link>
              <p className="text-sm text-gray-600">
                Status:{' '}
                <span className={statusColor(report.status)}>
                  {report.status.charAt(0) + report.status.slice(1).toLowerCase()}
                </span>
              </p>
              <p className="text-sm text-gray-500">Date: {report.date}</p>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}

function statusColor(status: string): string {
  switch (status) {
    case 'APPROVED':
      return 'text-green-600 font-medium';
    case 'PENDING':
      return 'text-yellow-600 font-medium';
    case 'REJECTED':
      return 'text-red-600 font-medium';
    default:
      return 'text-gray-600';
  }
}