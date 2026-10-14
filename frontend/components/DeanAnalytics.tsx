'use client';

import { Line, Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  BarElement,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(
  BarElement,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend
);

export default function DeanAnalytics({ data }: { data: any }) {
  if (!data || !data.reports || !data.students) {
    return <p className="text-gray-500">No analytics data available.</p>;
  }

  const { students, reports } = data;

  // Safe fallback for missing arrays
  const byStatus = Array.isArray(reports.byStatus) ? reports.byStatus : [];
  const weekly = Array.isArray(reports.weekly) ? reports.weekly : [];

  // Extract status counts safely
  const pending =
    byStatus.find((s: any) => s.status === 'PENDING')?._count.status ?? 0;

  const approved =
    byStatus.find((s: any) => s.status === 'APPROVED')?._count.status ?? 0;

  const rejected =
    byStatus.find((s: any) => s.status === 'REJECTED')?._count.status ?? 0;

  // Weekly line chart data (safe)
  const weeklyLabels = weekly.map((w: any) =>
    new Date(w.week).toLocaleDateString()
  );

  const weeklyCounts = weekly.map((w: any) => w.count);

  const weeklyChartData = {
    labels: weeklyLabels,
    datasets: [
      {
        label: 'Weekly Report Submissions',
        data: weeklyCounts,
        borderColor: '#2563eb',
        backgroundColor: 'rgba(37, 99, 235, 0.3)',
        tension: 0.3,
      },
    ],
  };

  const weeklyOptions = {
    responsive: true,
    plugins: {
      legend: { position: 'top' as const },
    },
  };

  // Status bar chart
  const statusChartData = {
    labels: ['Approved', 'Rejected', 'Pending'],
    datasets: [
      {
        label: 'Reports',
        data: [approved, rejected, pending],
        backgroundColor: ['#16a34a', '#dc2626', '#facc15'],
      },
    ],
  };

  const statusOptions = {
    responsive: true,
    plugins: {
      legend: { position: 'top' as const },
    },
    scales: {
      y: { beginAtZero: true },
    },
  };

  return (
    <div className="space-y-8">
      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        <KPI label="Students" value={students.total ?? 0} />
        <KPI label="Assigned" value={students.assigned ?? 0} />
        <KPI label="Unassigned" value={students.unassigned ?? 0} />
        <KPI label="Reports" value={reports.total ?? 0} />
        <KPI label="Approved" value={approved} />
        <KPI label="Pending" value={pending} />
      </div>

      {/* Weekly Line Chart */}
      <div className="p-4 border rounded bg-white shadow-sm">
        <h2 className="text-lg font-semibold mb-4">📈 Weekly Report Submissions</h2>

        {weekly.length > 0 ? (
          <Line data={weeklyChartData} options={weeklyOptions} />
        ) : (
          <p className="text-gray-500">No weekly submission data available.</p>
        )}
      </div>

      {/* Status Bar Chart */}
      <div className="p-4 border rounded bg-white shadow-sm">
        <h2 className="text-lg font-semibold mb-4">📊 Report Status Distribution</h2>

        {byStatus.length > 0 ? (
          <Bar data={statusChartData} options={statusOptions} />
        ) : (
          <p className="text-gray-500">No report status data available.</p>
        )}
      </div>
    </div>
  );
}

function KPI({ label, value }: { label: string; value: number }) {
  return (
    <div className="border rounded-lg p-3 sm:p-4 bg-white shadow-sm flex flex-col items-start">
      <span className="text-xs uppercase text-gray-500">{label}</span>
      <span className="text-lg sm:text-xl font-semibold">{value}</span>
    </div>
  );
}