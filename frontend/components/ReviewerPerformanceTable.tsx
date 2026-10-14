'use client';

import { useEffect, useState } from 'react';

interface Reviewer {
  name: string;
  role: string;
  faculty?: string;
  total: number;
  approved: number;
  rejected: number;
  pending: number;
  avgReviewTime?: number | null;
  overdue?: boolean;
}

type SortKey = keyof Reviewer;
type SortDirection = 'asc' | 'desc';

export default function ReviewerPerformanceTable() {
  const [reviewers, setReviewers] = useState<Reviewer[]>([]);
  const [filtered, setFiltered] = useState<Reviewer[]>([]);
  const [loading, setLoading] = useState(true);
  const [role, setRole] = useState('');
  const [faculty, setFaculty] = useState('');
  const [sortKey, setSortKey] = useState<SortKey>('name');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');

  useEffect(() => {
    async function fetchPerformance() {
      try {
        const token = localStorage.getItem('accessToken');
        const res = await fetch('/api/admin/reviewers/performance', {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        setReviewers(data);
        setFiltered(data);
      } catch {
        setReviewers([]);
        setFiltered([]);
      } finally {
        setLoading(false);
      }
    }

    fetchPerformance();
  }, []);

  useEffect(() => {
    let data = reviewers.filter((r) => {
      return (
        (role ? r.role === role : true) &&
        (faculty ? r.faculty === faculty : true)
      );
    });

    data.sort((a, b) => {
      const aVal = a[sortKey] ?? '';
      const bVal = b[sortKey] ?? '';
      if (typeof aVal === 'number' && typeof bVal === 'number') {
        return sortDirection === 'asc' ? aVal - bVal : bVal - aVal;
      }
      return sortDirection === 'asc'
        ? String(aVal).localeCompare(String(bVal))
        : String(bVal).localeCompare(String(aVal));
    });

    setFiltered(data);
  }, [role, faculty, reviewers, sortKey, sortDirection]);

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(key);
      setSortDirection('asc');
    }
  };

  const handleExport = () => {
    const csv = [
      [
        'Name',
        'Role',
        'Faculty',
        'Total',
        'Approved',
        'Rejected',
        'Pending',
        'Avg Review Time (days)',
        'Overdue',
      ],
      ...filtered.map((r) => [
        r.name,
        r.role,
        r.faculty || '',
        r.total,
        r.approved,
        r.rejected,
        r.pending,
        r.avgReviewTime ?? '',
        r.overdue ? 'Yes' : 'No',
      ]),
    ]
      .map((row) => row.join(','))
      .join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'reviewer-performance.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="px-4 sm:px-6 lg:pl-[250px] max-w-6xl mx-auto space-y-6 py-6">
      <h1 className="text-xl sm:text-2xl font-bold">📊 Reviewer Performance</h1>

      {/* Filters */}
      <div className="flex flex-wrap gap-4 items-center">
        <select
          value={role}
          onChange={(e) => setRole(e.target.value)}
          className="border p-2 rounded w-full sm:w-auto"
        >
          <option value="">All Roles</option>
          <option value="SUPERVISOR">Supervisor</option>
          <option value="LECTURER">Lecturer</option>
        </select>

        <select
          value={faculty}
          onChange={(e) => setFaculty(e.target.value)}
          className="border p-2 rounded w-full sm:w-auto"
        >
          <option value="">All Faculties</option>
          <option value="Engineering">Engineering</option>
          <option value="Science">Science</option>
          <option value="Business">Business</option>
          <option value="Education">Education</option>
        </select>

        <button
          onClick={handleExport}
          className="ml-auto px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          ⬇️ Export CSV
        </button>
      </div>

      {/* Table */}
      <div className="overflow-x-auto border rounded">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-100">
            <tr>
              {[
                'name',
                'role',
                'faculty',
                'total',
                'approved',
                'rejected',
                'pending',
                'avgReviewTime',
                'overdue',
              ].map((key) => (
                <th
                  key={key}
                  className="p-2 cursor-pointer hover:bg-gray-200"
                  onClick={() => handleSort(key as SortKey)}
                >
                  {key === sortKey ? (sortDirection === 'asc' ? '⬆️' : '⬇️') : ''}{' '}
                  {key === 'avgReviewTime' ? 'Avg Time' : key.charAt(0).toUpperCase() + key.slice(1)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={9} className="p-4 text-center">
                  Loading reviewer performance...
                </td>
              </tr>
            ) : filtered.length === 0 ? (
              <tr>
                <td colSpan={9} className="p-4 text-center">
                  No reviewer data found.
                </td>
              </tr>
            ) : (
              filtered.map((r, i) => (
                <tr key={i} className="border-t">
                  <td className="p-2">{r.name}</td>
                  <td className="p-2">{r.role}</td>
                  <td className="p-2">{r.faculty || '—'}</td>
                  <td className="p-2">{r.total}</td>
                  <td className="p-2 text-green-700 font-semibold">{r.approved}</td>
                  <td className="p-2 text-red-600 font-semibold">{r.rejected}</td>
                  <td className="p-2 text-yellow-600 font-semibold">{r.pending}</td>
                  <td className="p-2">
                    {r.avgReviewTime != null ? `${r.avgReviewTime}d` : '—'}
                  </td>
                  <td className={`p-2 ${r.overdue ? 'text-red-600 font-bold' : 'text-gray-600'}`}>
                    {r.overdue ? '⚠️ Yes' : 'No'}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}