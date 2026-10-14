'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import ReportCard from '../../../components/ReportCard';
import Link from 'next/link';

interface Report {
  id: number;
  title: string;
  status: string;
  student: { name: string };
  updatedAt?: string;
}

export default function DeanReportsPage() {
  const [reports, setReports] = useState<Report[]>([]);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [status, setStatus] = useState('');
  const [search, setSearch] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);

  const observer = useRef<IntersectionObserver | null>(null);

  // ✅ Helper: Remove duplicate reports by ID
  const dedupe = (list: Report[]) => {
    const map = new Map<number, Report>();
    list.forEach((r) => map.set(r.id, r));
    return Array.from(map.values());
  };

  // ✅ Fetch reports from backend (faculty-scoped automatically)
  const fetchReports = useCallback(async () => {
    if (!hasMore || loading) return;

    setLoading(true);

    try {
      const token = localStorage.getItem('accessToken');

      const params = new URLSearchParams();
      if (status) params.append('status', status);
      if (search) params.append('search', search);
      if (startDate) params.append('startDate', startDate);
      if (endDate) params.append('endDate', endDate);
      params.append('page', page.toString());

      const res = await fetch(`/api/dean/reports?${params.toString()}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await res.json();
      const newReports = Array.isArray(data) ? data : data.reports ?? [];

      // ✅ Dedupe to avoid duplicate keys
      setReports((prev) => dedupe([...prev, ...newReports]));

      setHasMore(newReports.length > 0);
    } catch (err) {
      console.error('Failed to fetch reports:', err);
      setHasMore(false);
    } finally {
      setLoading(false);
    }
  }, [status, search, startDate, endDate, page, hasMore, loading]);

  // ✅ Reset when filters change
  useEffect(() => {
    setReports([]);
    setPage(1);
    setHasMore(true);
  }, [status, search, startDate, endDate]);

  // ✅ Fetch on page load + when page increments
  useEffect(() => {
    fetchReports();
  }, [fetchReports]);

  // ✅ Infinite scroll observer
  const lastReportRef = useCallback(
    (node: HTMLDivElement | null) => {
      if (loading) return;

      if (observer.current) observer.current.disconnect();

      observer.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && hasMore) {
          setPage((prev) => prev + 1);
        }
      });

      if (node) observer.current.observe(node);
    },
    [loading, hasMore]
  );

  // ✅ Select / unselect reports
  const toggleSelect = (id: number) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  // ✅ Bulk approve / reject
  const handleBulkAction = async (action: 'APPROVED' | 'REJECTED') => {
    try {
      const token = localStorage.getItem('accessToken');

      await fetch('/api/dean/reports/bulk-update', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ ids: selectedIds, status: action }),
      });

      // ✅ Optimistic UI update
      setReports((prev) =>
        prev.map((r) =>
          selectedIds.includes(r.id) ? { ...r, status: action } : r
        )
      );

      setSelectedIds([]);
    } catch (err) {
      console.error('Bulk update failed:', err);
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:ml-[250px] max-w-6xl mx-auto space-y-6">
      <h1 className="text-xl sm:text-2xl font-bold">📄 Faculty Reports</h1>

      {/* ✅ Filters */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="border p-2 rounded w-full"
        >
          <option value="">All Statuses</option>
          <option value="PENDING">Pending</option>
          <option value="APPROVED">Approved</option>
          <option value="REJECTED">Rejected</option>
        </select>

        <input
          type="date"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
          className="border p-2 rounded w-full"
        />

        <input
          type="date"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
          className="border p-2 rounded w-full"
        />
      </div>

      {/* ✅ Search + Bulk Actions */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search student or reviewer"
          className="border p-2 rounded w-full sm:w-2/3"
        />

        {selectedIds.length > 0 && (
          <div className="flex gap-2">
            <button
              onClick={() => handleBulkAction('APPROVED')}
              className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
            >
              Approve Selected
            </button>
            <button
              onClick={() => handleBulkAction('REJECTED')}
              className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
            >
              Reject Selected
            </button>
          </div>
        )}
      </div>

      {/* ✅ Report List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {reports.map((report, index) => {
          const isLast = index === reports.length - 1;

          return (
            <div
              key={report.id}
              ref={isLast ? lastReportRef : null}
              className={`relative border rounded-lg shadow-sm ${
                selectedIds.includes(report.id) ? 'ring-2 ring-blue-500' : ''
              }`}
            >
              {/* Select overlay */}
              <button
                onClick={() => toggleSelect(report.id)}
                className="absolute inset-0 z-0 w-full h-full"
              />

              <Link
                href={`/dean/reports/${report.id}`}
                className="relative z-10 block p-4 hover:bg-gray-50"
              >
                <ReportCard
                  id={report.id}
                  title={report.title}
                  status={report.status}
                  studentName={report.student.name}
                  updatedAt={report.updatedAt}
                  role="DEAN"
                />
              </Link>
            </div>
          );
        })}
      </div>

      {loading && <p>Loading more reports...</p>}
    </div>
  );
}