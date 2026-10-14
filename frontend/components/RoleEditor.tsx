'use client';

import { useState } from 'react';

interface RoleEditorProps {
  user: {
    id: number;
    name: string;
    email: string;
    role: string;
    faculty?: string;
  };
  onClose: () => void;
  onSuccess: () => void;
}

export default function RoleEditor({ user, onClose, onSuccess }: RoleEditorProps) {
  const [role, setRole] = useState(user.role);
  const [faculty, setFaculty] = useState(user.faculty || '');
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('accessToken');
      await fetch(`/api/users/${user.id}/role`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ role, faculty }),
      });
      onSuccess();
    } catch {
      alert('Failed to update user.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded shadow-lg w-full max-w-md space-y-4">
        <h2 className="text-lg font-semibold">Edit Role for {user.name}</h2>

        <div className="space-y-2">
          <label className="block text-sm font-medium">Role</label>
          <select
            value={role}
            onChange={(e) => setRole(e.target.value)}
            className="border p-2 rounded w-full"
          >
            <option value="STUDENT">Student</option>
            <option value="SUPERVISOR">Supervisor</option>
            <option value="LECTURER">Lecturer</option>
            <option value="DEAN">Dean</option>
            <option value="ADMIN">Admin</option>
          </select>
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium">Faculty</label>
          <select
            value={faculty}
            onChange={(e) => setFaculty(e.target.value)}
            className="border p-2 rounded w-full"
          >
            <option value="">None</option>
            <option value="Engineering">Engineering</option>
            <option value="Science">Science</option>
            <option value="Business">Business</option>
            <option value="Education">Education</option>
          </select>
        </div>

        <div className="flex justify-end gap-2 pt-4">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded border border-gray-300 hover:bg-gray-100"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={loading}
            className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700"
          >
            {loading ? 'Saving...' : 'Save'}
          </button>
        </div>
      </div>
    </div>
  );
}