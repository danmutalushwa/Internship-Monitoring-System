'use client';

import { useEffect, useState } from 'react';

type DeanSummary = {
  totalReports: number;
  pendingReports: number;
  approvedReports: number;
  rejectedReports: number;
  totalStudents: number;
  totalLecturers: number;
};

export default function DeanDashboardPage() {
  const [summary, setSummary] = useState<DeanSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch REAL data from backend
  useEffect(() => {
    async function fetchSummary() {
      setLoading(true);
      setError(null);

      try {
        const token = localStorage.getItem('accessToken');

        // Fetch analytics (reports + students)
        const analyticsRes = await fetch('http://localhost:4000/api/dean/analytics', {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!analyticsRes.ok) throw new Error('Failed to fetch analytics');

        const analytics = await analyticsRes.json();

        // Fetch lecturers count
        const lecturersRes = await fetch('/api/dean/reviewers', {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!lecturersRes.ok) throw new Error('Failed to fetch lecturers');

        const lecturers = await lecturersRes.json();

        // Extract summary values
        const totalReports = analytics.reports.total;

        const pending = analytics.reports.byStatus.find(
          (s: any) => s.status === 'PENDING'
        )?._count.status || 0;

        const approved = analytics.reports.byStatus.find(
          (s: any) => s.status === 'APPROVED'
        )?._count.status || 0;

        const rejected = analytics.reports.byStatus.find(
          (s: any) => s.status === 'REJECTED'
        )?._count.status || 0;

        setSummary({
          totalReports,
          pendingReports: pending,
          approvedReports: approved,
          rejectedReports: rejected,
          totalStudents: analytics.students.total,
          totalLecturers: lecturers.length,
        });
      } catch (err: any) {
        setError(err.message || 'Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    }

    fetchSummary();
  }, []);

  return (
    <div className="p-4 sm:p-6 lg:p-8 lg:ml-[250px] max-w-6xl mx-auto">
      <h1 className="text-2xl sm:text-3xl font-bold mb-4">📊 Dean Dashboard</h1>
      <p className="text-gray-600 mb-6">
        Faculty-level snapshot of students, lecturers, and report activity.
      </p>

      {loading && <p className="text-gray-500">Loading faculty summary...</p>}
      {error && <p className="text-red-600">{error}</p>}

      {!loading && !error && summary && (
        <>
          {/* Summary cards */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
            <SummaryCard label="Reports" value={summary.totalReports} />
            <SummaryCard label="Pending" value={summary.pendingReports} />
            <SummaryCard label="Approved" value={summary.approvedReports} />
            <SummaryCard label="Rejected" value={summary.rejectedReports} />
            <SummaryCard label="Students" value={summary.totalStudents} />
            <SummaryCard label="Lecturers" value={summary.totalLecturers} />
          </div>

          {/* Real analytics can be added here later */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="border rounded-lg p-4 shadow-sm bg-white">
              <h2 className="font-semibold mb-2">Approval trends</h2>
              <p className="text-sm text-gray-500">
                Weekly approval trends will appear here.
              </p>
            </div>

            <div className="border rounded-lg p-4 shadow-sm bg-white">
              <h2 className="font-semibold mb-2">Internship status overview</h2>
              <p className="text-sm text-gray-500">
                Breakdown of internship progress will appear here.
              </p>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function SummaryCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="border rounded-lg p-3 sm:p-4 bg-white shadow-sm flex flex-col items-start">
      <span className="text-xs uppercase text-gray-500">{label}</span>
      <span className="text-lg sm:text-xl font-semibold">{value}</span>
    </div>
  );
}