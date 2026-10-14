'use client';

import { useEffect, useState } from 'react';

type DeanLecturer = {
  id: number;
  name: string;
  email: string;
  assignedStudentsCount: number;
};

export default function DeanLecturersPage() {
  const [lecturers, setLecturers] = useState<DeanLecturer[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchLecturers() {
      setLoading(true);
      try {
        const token = localStorage.getItem("accessToken");

        const res = await fetch(`/api/dean/reviewers`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const data = await res.json();
        setLecturers(data);
      } catch (err) {
        console.error("Failed to fetch lecturers:", err);
        setLecturers([]);
      } finally {
        setLoading(false);
      }
    }

    fetchLecturers();
  }, []);
  
  const filtered = lecturers.filter((l) =>
    search
      ? l.name.toLowerCase().includes(search.toLowerCase()) ||
        l.email.toLowerCase().includes(search.toLowerCase())
      : true
  );

  return (
    <div className="p-4 sm:p-6 lg:p-8 lg:ml-[250px] max-w-6xl mx-auto">
      <h1 className="text-2xl sm:text-3xl font-bold mb-4">👨‍🏫 Faculty Lecturers</h1>
      <p className="text-gray-600 mb-6">
        All lecturers within your faculty and their current workloads.
      </p>

      <div className="mb-6">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name or email..."
          className="border rounded p-2 w-full sm:w-1/2"
        />
      </div>

      {loading ? (
        <p className="text-gray-500">Loading lecturers...</p>
      ) : filtered.length === 0 ? (
        <p className="text-gray-500">No lecturers found.</p>
      ) : (
        <div className="space-y-3">
          {filtered.map((l) => (
            <div
              key={l.id}
              className="border rounded-lg p-3 sm:p-4 bg-white shadow-sm flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2"
            >
              <div>
                <p className="font-semibold">{l.name}</p>
                <p className="text-sm text-gray-500">{l.email}</p>
              </div>
              <p className="text-sm text-gray-600">
                Assigned students:{' '}
                <span className="font-semibold">{l.assignedStudentsCount}</span>
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}