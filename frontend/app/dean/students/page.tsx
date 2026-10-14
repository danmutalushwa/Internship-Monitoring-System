'use client';

import { useEffect, useState } from 'react';

type DeanStudent = {
  id: number;
  name: string;
  email: string;
  internshipStatus: 'PENDING' | 'ONGOING' | 'COMPLETED';
  faculty?: { name: string } | null;
  assignedLecturer?: { name: string } | null;
};

export default function DeanStudentsPage() {
  const [students, setStudents] = useState<DeanStudent[]>([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStudents() {
      setLoading(true);
      try {
        const token = localStorage.getItem('accessToken');

        const params = new URLSearchParams();
        if (statusFilter) params.append('status', statusFilter);
        if (search) params.append('search', search);

        const res = await fetch(`/api/dean/students?${params.toString()}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await res.json();
        setStudents(data);
      } catch (err) {
        console.error('Failed to fetch students:', err);
        setStudents([]);
      } finally {
        setLoading(false);
      }
    }

    fetchStudents();
  }, [statusFilter, search]);

  const filtered = students.filter((s) => {
    const matchesSearch = search
      ? s.name.toLowerCase().includes(search.toLowerCase()) ||
        s.email.toLowerCase().includes(search.toLowerCase())
      : true;
    const matchesStatus = statusFilter
      ? s.internshipStatus === statusFilter
      : true;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="p-4 sm:p-6 lg:p-8 lg:ml-[250px] max-w-6xl mx-auto">
      <h1 className="text-2xl sm:text-3xl font-bold mb-4">🎓 Faculty Students</h1>
      <p className="text-gray-600 mb-6">
        All students within your faculty, with internship and assignment status.
      </p>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name or email..."
          className="border rounded p-2 w-full sm:w-1/2"
        />
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="border rounded p-2 w-full sm:w-1/3"
        >
          <option value="">All internship statuses</option>
          <option value="PENDING">Pending</option>
          <option value="ONGOING">Ongoing</option>
          <option value="COMPLETED">Completed</option>
        </select>
      </div>

      {loading ? (
        <p className="text-gray-500">Loading students...</p>
      ) : filtered.length === 0 ? (
        <p className="text-gray-500">No students found.</p>
      ) : (
        <div className="space-y-3">
          {filtered.map((s) => (
            <div
              key={s.id}
              className="border rounded-lg p-3 sm:p-4 bg-white shadow-sm flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2"
            >
              <div>
                <p className="font-semibold">{s.name}</p>
                <p className="text-sm text-gray-500">{s.email}</p>
                <p className="text-sm mt-1">
                  Internship:{' '}
                  <span className="font-medium">{s.internshipStatus}</span>
                </p>
                <p className="text-sm mt-1">
                  Faculty:{' '}
                  <span className="font-medium">
                    {s.faculty?.name ?? 'Unknown'}
                  </span>
                </p>
              </div>
              <div className="text-sm text-gray-600">
                Assigned lecturer:{' '}
                <span className="font-medium">
                  {s.assignedLecturer?.name ?? 'Not assigned'}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}