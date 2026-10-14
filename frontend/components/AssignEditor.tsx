'use client';

import { useState, useEffect } from 'react';

interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  facultyId?: number;
}

interface AssignEditorProps {
  user: User;
  onClose: () => void;
  onSuccess: () => void;
}

export default function AssignEditor({ user, onClose, onSuccess }: AssignEditorProps) {
  const [lecturers, setLecturers] = useState<User[]>([]);
  const [supervisors, setSupervisors] = useState<User[]>([]);
  const [reviewers, setReviewers] = useState<User[]>([]);

  const [selectedLecturerId, setSelectedLecturerId] = useState<number | null>(null);
  const [selectedSupervisorId, setSelectedSupervisorId] = useState<number | null>(null);
  const [selectedReviewerId, setSelectedReviewerId] = useState<number | null>(null);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchAssignableUsers() {
      try {
        const token = localStorage.getItem('accessToken');
        const res = await fetch(`/api/users/roles?facultyId=${user.facultyId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();

        setLecturers(data?.lecturers ?? []);
        setSupervisors(data?.supervisors ?? []);
        setReviewers(data?.reviewers ?? []);
      } catch (err) {
        console.error('Failed to fetch assignable users:', err);
      } finally {
        setLoading(false);
      }
    }

    if (user.role === 'STUDENT' && user.facultyId) {
      fetchAssignableUsers();
    }
  }, [user]);

  const handleAssign = async () => {
    const payload: any = {};
    if (selectedLecturerId) payload.lecturerId = selectedLecturerId;
    if (selectedSupervisorId) payload.supervisorId = selectedSupervisorId;
    if (selectedReviewerId) payload.reviewerId = selectedReviewerId;

    try {
      const token = localStorage.getItem('accessToken');
      const res = await fetch(`/api/users/${user.id}/assign`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        onSuccess();
      } else {
        alert('Assignment failed');
      }
    } catch (err) {
      console.error('Assignment error:', err);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md space-y-5 animate-fadeIn">
        <h2 className="text-lg font-bold">
          Assign Roles to <span className="text-sky-600">{user.name}</span>
        </h2>

        {loading ? (
          <p className="text-gray-500">Loading users...</p>
        ) : (
          <>
            {/* Lecturer */}
            <div>
              <label className="block mb-1 font-medium">Lecturer</label>
              <select
                value={selectedLecturerId ?? ''}
                onChange={(e) =>
                  setSelectedLecturerId(e.target.value ? Number(e.target.value) : null)
                }
                className="w-full border p-2 rounded"
              >
                <option value="">Select a lecturer</option>
                {lecturers.map((l) => (
                  <option key={l.id} value={l.id}>
                    {l.name} ({l.email})
                  </option>
                ))}
              </select>
            </div>

            {/* Supervisor */}
            <div>
              <label className="block mb-1 font-medium">Supervisor</label>
              <select
                value={selectedSupervisorId ?? ''}
                onChange={(e) =>
                  setSelectedSupervisorId(e.target.value ? Number(e.target.value) : null)
                }
                className="w-full border p-2 rounded"
              >
                <option value="">Select a supervisor</option>
                {supervisors.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name} ({s.email})
                  </option>
                ))}
              </select>
            </div>

            {/* Reviewer */}
            <div>
              <label className="block mb-1 font-medium">Reviewer</label>
              <select
                value={selectedReviewerId ?? ''}
                onChange={(e) =>
                  setSelectedReviewerId(e.target.value ? Number(e.target.value) : null)
                }
                className="w-full border p-2 rounded"
              >
                <option value="">Select a reviewer</option>
                {reviewers.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.name} ({r.email}) - {r.role}
                  </option>
                ))}
              </select>
            </div>
          </>
        )}

        <div className="flex justify-end gap-3 mt-4">
          <button onClick={onClose} className="px-4 py-2 border rounded">
            Cancel
          </button>

          <button
            onClick={handleAssign}
            disabled={!selectedLecturerId && !selectedSupervisorId && !selectedReviewerId}
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
          >
            Assign
          </button>
        </div>
      </div>
    </div>
  );
}