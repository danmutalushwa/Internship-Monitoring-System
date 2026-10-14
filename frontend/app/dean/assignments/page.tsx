'use client';

import { useEffect, useState } from 'react';

type AssignableLecturer = {
  id: number;
  name: string;
};

type AssignableStudent = {
  id: number;
  name: string;
  email: string;
  assignedLecturerId?: number | null;
  assignedLecturerName?: string | null;
};

export default function DeanAssignmentsPage() {
  const [lecturers, setLecturers] = useState<AssignableLecturer[]>([]);
  const [students, setStudents] = useState<AssignableStudent[]>([]);
  const [selectedLecturerId, setSelectedLecturerId] = useState<number | null>(
    null,
  );
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [assigning, setAssigning] = useState(false);

  // Fetch lecturers + students from backend
  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        const token = localStorage.getItem('accessToken');

        const [lecturerRes, studentRes] = await Promise.all([
          fetch('/api/dean/reviewers', {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch('/api/dean/students', {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        const lecturersData = await lecturerRes.json();
        const studentsData = await studentRes.json();

        setLecturers(lecturersData);

        setStudents(
          studentsData.map((s: any) => ({
            id: s.id,
            name: s.name,
            email: s.email,
            assignedLecturerId: s.assignedLecturerId,
            assignedLecturerName: s.assignedLecturer?.name ?? null,
          })),
        );

        if (lecturersData.length > 0) {
          setSelectedLecturerId(lecturersData[0].id);
        }
      } catch (err) {
        console.error('Failed to fetch assignment data:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  const handleAssign = async (studentId: number) => {
    if (!selectedLecturerId) return;

    setAssigning(true);

    try {
      const token = localStorage.getItem('accessToken');

      const res = await fetch('/api/dean/students/bulk-assign', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          reviewerId: selectedLecturerId,
          studentIds: [studentId],
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        console.error('Assignment failed:', data);
        return;
      }

      const lecturer = lecturers.find((l) => l.id === selectedLecturerId);

      setStudents((prev) =>
        prev.map((s) =>
          s.id === studentId
            ? {
                ...s,
                assignedLecturerId: selectedLecturerId,
                assignedLecturerName: lecturer?.name ?? null,
              }
            : s,
        ),
      );
    } catch (err) {
      console.error('Assignment error:', err);
    } finally {
      setAssigning(false);
    }
  };

  const filteredStudents = students.filter((s) =>
    search
      ? s.name.toLowerCase().includes(search.toLowerCase()) ||
        s.email.toLowerCase().includes(search.toLowerCase())
      : true,
  );

  return (
    <div className="p-4 sm:p-6 lg:p-8 lg:ml-[250px] max-w-6xl mx-auto">
      <h1 className="text-2xl sm:text-3xl font-bold mb-4">🔄 Assign Students</h1>
      <p className="text-gray-600 mb-6">
        Assign or reassign students within your faculty to lecturers.
      </p>

      {/* Controls */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <select
          value={selectedLecturerId ?? ''}
          onChange={(e) =>
            setSelectedLecturerId(
              e.target.value ? parseInt(e.target.value, 10) : null,
            )
          }
          className="border rounded p-2 w-full sm:w-1/2"
        >
          <option value="">Select lecturer</option>
          {lecturers.map((l) => (
            <option key={l.id} value={l.id}>
              {l.name}
            </option>
          ))}
        </select>

        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search student by name or email..."
          className="border rounded p-2 w-full sm:w-1/2"
        />
      </div>

      {loading ? (
        <p className="text-gray-500">Loading assignable students...</p>
      ) : filteredStudents.length === 0 ? (
        <p className="text-gray-500">No students found.</p>
      ) : (
        <div className="space-y-3">
          {filteredStudents.map((s) => (
            <div
              key={s.id}
              className="border rounded-lg p-3 sm:p-4 bg-white shadow-sm flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3"
            >
              <div>
                <p className="font-semibold">{s.name}</p>
                <p className="text-sm text-gray-500">{s.email}</p>
                <p className="text-sm mt-1">
                  Current lecturer:{' '}
                  <span className="font-medium">
                    {s.assignedLecturerName ?? 'Not assigned'}
                  </span>
                </p>
              </div>

              <button
                onClick={() => handleAssign(s.id)}
                disabled={!selectedLecturerId || assigning}
                className="px-3 py-1 rounded text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {assigning
                  ? 'Assigning...'
                  : s.assignedLecturerId
                  ? 'Reassign'
                  : 'Assign'}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}