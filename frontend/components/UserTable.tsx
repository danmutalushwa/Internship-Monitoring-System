'use client';

import { useState } from 'react';
import AssignEditor from './AssignEditor';
import EditUserModal from './EditUserModal';

interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  faculty?: { name: string } | null;
  assignedLecturer?: { name: string } | null;
  assignedSupervisor?: { name: string } | null;
  assignedReviewer?: { name: string } | null;
  facultyId?: number;
}

interface UserTableProps {
  users: User[];
}

export default function UserTable({ users }: UserTableProps) {
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [editingUser, setEditingUser] = useState<User | null>(null);

  const handleDelete = async (user: User) => {
    if (!confirm(`Are you sure you want to delete ${user.name}?`)) return;

    try {
      const token = localStorage.getItem('accessToken');
      const res = await fetch(`/api/users/${user.id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        alert('User deleted');
        window.location.reload(); // Optional: replace with local state update for smoother UX
      } else {
        alert('Failed to delete user');
      }
    } catch (err) {
      console.error('Delete error:', err);
    }
  };

  const handleAssign = (user: User) => {
    if (user.role === 'STUDENT') {
      setSelectedUser(user);
    }
  };

  return (
    <div className="overflow-x-auto border rounded shadow-sm bg-white">
      <table className="min-w-full text-sm text-left">
        <thead className="bg-gray-100 text-gray-700 uppercase text-xs">
          <tr>
            <th className="p-3">Name</th>
            <th className="p-3">Email</th>
            <th className="p-3">Role</th>
            <th className="p-3">Faculty</th>
            <th className="p-3">Lecturer</th>
            <th className="p-3">Supervisor</th>
            <th className="p-3">Reviewer</th>
            <th className="p-3">Actions</th>
          </tr>
        </thead>

        <tbody>
          {users?.map((user) => (
            <tr key={user.id} className="border-t hover:bg-gray-50">
              <td className="p-3">{user.name}</td>
              <td className="p-3">{user.email}</td>
              <td className="p-3">{user.role}</td>
              <td className="p-3">{user.faculty?.name ?? '—'}</td>
              <td className="p-3">{user.assignedLecturer?.name ?? '—'}</td>
              <td className="p-3">{user.assignedSupervisor?.name ?? '—'}</td>
              <td className="p-3">{user.assignedReviewer?.name ?? '—'}</td>

              <td className="p-3 space-x-2 whitespace-nowrap">
                <button
                  onClick={() => setEditingUser(user)} 
                  className="text-blue-600 hover:underline"
                >
                  Edit
                </button>

                <button
                  onClick={() => handleDelete(user)}
                  className="text-red-600 hover:underline"
                >
                  Delete
                </button>

                {user.role === 'STUDENT' && (
                  <button
                    onClick={() => handleAssign(user)}
                    className="text-green-600 hover:underline"
                  >
                    Assign
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {selectedUser && (
        <AssignEditor
          user={selectedUser}
          onClose={() => setSelectedUser(null)}
          onSuccess={() => window.location.reload()}
        />
      )}
      {editingUser && (
        <EditUserModal
          user={editingUser}
          onClose={() => setEditingUser(null)}
          onSuccess={() => window.location.reload()}
        />
      )}
    </div>
  );
}