'use client';

import { useEffect, useState } from 'react';
import DeanAnalytics from '../../../components/DeanAnalytics';
import ExportButton from '../../../components/ExportButton';

export default function DeanAnalyticsPage() {
  const [loading, setLoading] = useState(false);
  const [analytics, setAnalytics] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  // Fetch analytics from backend
  useEffect(() => {
    async function fetchAnalytics() {
      setLoading(true);
      setError(null);

      try {
        const token = localStorage.getItem('accessToken');

        const res = await fetch('http://localhost:4000/api/dean/analytics', {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!res.ok) throw new Error('Failed to fetch analytics');

        const data = await res.json();
        setAnalytics(data);
      } catch (err: any) {
        setError(err.message || 'Failed to load analytics');
      } finally {
        setLoading(false);
      }
    }

    fetchAnalytics();
  }, []);

  // Export handler (backend-ready)
  const handleExport = async () => {
    try {
      alert('Export will be wired to backend later.');
    } catch (err) {
      console.error('Export failed:', err);
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 lg:ml-[250px] max-w-6xl mx-auto">
      {/* Page Title */}
      <h1 className="text-2xl sm:text-3xl font-bold mb-4">📈 Faculty Analytics</h1>
      <p className="text-gray-600 mb-6">
        Analytics and performance overview for your faculty&apos;s internships and reports.
      </p>

      {/* Header Row */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <h2 className="font-semibold text-lg">Approval, Completion & Weekly Trends</h2>
        <ExportButton label="📥 Export Analytics" onExport={handleExport} />
      </div>

      {/* Loading State */}
      {loading && <p className="text-gray-500">Loading analytics...</p>}

      {/* Error State */}
      {error && <p className="text-red-600 font-medium">{error}</p>}

      {/* Analytics Component */}
      {!loading && !error && analytics && (
        <DeanAnalytics data={analytics} />
      )}

      {/* No Data State */}
      {!loading && !error && !analytics && (
        <p className="text-gray-500">No analytics data available.</p>
      )}
    </div>
  );
}