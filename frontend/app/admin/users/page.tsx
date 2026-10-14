'use client';

import { useEffect, useState } from 'react';
import UserTable from '../../../components/UserTable';

interface Faculty {
  id: number;
  name: string;
}

interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  faculty?: {
    name: string;
  } | null;
  assignedLecturer?: {
    name: string;
  } | null;
  assignedSupervisor?: {
    name: string;
  } | null;
  assignedReviewer?: {
    name: string;
  } | null;
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [faculties, setFaculties] = useState<Faculty[]>([]);
  const [loading, setLoading] = useState(true);
  const [role, setRole] = useState('');
  const [facultyId, setFacultyId] = useState('');

  useEffect(() => {
    async function fetchFaculties() {
      try {
        const token = localStorage.getItem('accessToken');
        const res = await fetch('/api/users/faculties', {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        console.log("Fetched faculties:", data);

        if (Array.isArray(data)) {
          setFaculties(data);
        } else {
          console.warn('Unexpected faculty response shape:', data);
          setFaculties([]);
        }
       
      } catch (err) {
        console.error('Failed to fetch faculties:', err);
        setFaculties([]);
      }
    }

    fetchFaculties();
  }, []);

  useEffect(() => {
    async function fetchUsers() {
      setLoading(true);
      try {
        const token = localStorage.getItem('accessToken');
        const query = new URLSearchParams();
        if (role) query.append('role', role);
        if (facultyId) query.append('faculty', facultyId);
        console.log('Query:', query.toString());

        const res = await fetch(`/api/users?${query}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        console.log('Users response:', data);

        if (Array.isArray(data)) {
          setUsers(data);
        } else if (Array.isArray(data.users)) {
          setUsers(data.users);
        } else {
          console.warn('Unexpected users shape:', data);
          setUsers([]);
        }
      } catch (err) {
        console.error('Failed to fetch users:', err);
        setUsers([]);
      } finally {
        setLoading(false);
      }
    }

    fetchUsers();
  }, [role, facultyId]);

  return (
    <div className="p-4 sm:p-6 lg:ml-[250px] space-y-6 max-w-6xl mx-auto">
      <h1 className="text-xl sm:text-2xl font-bold">👥 Manage Users</h1>

      {/* Filters */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <select
          value={role}
          onChange={(e) => setRole(e.target.value)}
          className="border p-2 rounded w-full"
        >
          <option value="">All Roles</option>
          <option value="STUDENT">Student</option>
          <option value="SUPERVISOR">Supervisor</option>
          <option value="LECTURER">Lecturer</option>
          <option value="DEAN">Dean</option>
          <option value="ADMIN">Admin</option>
        </select>

        <select
          value={facultyId}
          onChange={(e) => setFacultyId(e.target.value)}
          className="border p-2 rounded w-full"
        >
          <option value="">All Faculties</option>
          {faculties.length > 0 ? (
            faculties.map((f) => (
              <option key={f.id} value={f.id.toString()}>
                {f.name}
              </option>
            ))
          ) : (
            <option disabled>No faculties found</option>
          )}
        </select>
      </div>

      {/* Table */}
      {loading ? (
        <p>Loading users...</p>
      ) : users.length === 0 ? (
        <p>No users found.</p>
      ) : (
        <UserTable users={users} />
      )}
    </div>
  );
}