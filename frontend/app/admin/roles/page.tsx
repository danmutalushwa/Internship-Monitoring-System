'use client';

import { useState } from 'react';

const allPermissions = [
  'view_reports',
  'assign_students',
  'approve_logs',
  'manage_roles',
] as const;

type Permission = (typeof allPermissions)[number];

interface Role {
  name: string;
  permissions: Permission[];
}

export default function RolesPermissionsPage() {
  const [roles, setRoles] = useState<Role[]>([]);
  const [newRole, setNewRole] = useState('');
  const [selectedPermissions, setSelectedPermissions] = useState<Permission[]>([]);
  const [loading, setLoading] = useState(false);

  const togglePermission = (perm: Permission) => {
    setSelectedPermissions((prev) =>
      prev.includes(perm) ? prev.filter((p) => p !== perm) : [...prev, perm]
    );
  };

  const handleAddRole = async () => {
    if (!newRole.trim()) return;
    const payload = {
      name: newRole.toUpperCase(),
      permissions: selectedPermissions,
    };

    try {
      setLoading(true);
      const token = localStorage.getItem('accessToken');
      const res = await fetch('http://localhost:4000/api/roles', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errorText = await res.text(); // capture backend error
        throw new Error(`Failed to create role:  ${res.status} ${errorText}`);
      }
      const created = await res.json();
      setRoles((prev) => [...prev, created]);
      setNewRole('');
      setSelectedPermissions([]);
    } catch (err) {
      console.error('Error creating role:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteRole = async (name: string) => {
    try {
      setLoading(true);
      const token = localStorage.getItem('accessToken');
      const res = await fetch(`http://localhost:4000/api/roles/${name}
`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) throw new Error('Failed to delete role');
      setRoles((prev) => prev.filter((r) => r.name !== name));
    } catch (err) {
      console.error('Error deleting role:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold">🔐 Roles & Permissions</h1>

      <div className="border p-4 rounded space-y-4 bg-gray-50">
        <h2 className="font-semibold">Create New Role</h2>
        <input
          type="text"
          placeholder="Role name (e.g. REVIEWER)"
          value={newRole}
          onChange={(e) => setNewRole(e.target.value)}
          className="border p-2 rounded w-full"
        />
        <div className="flex flex-wrap gap-4">
          {allPermissions.map((perm) => (
            <label key={perm} className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={selectedPermissions.includes(perm)}
                onChange={() => togglePermission(perm)}
              />
              <span className="text-sm">{perm}</span>
            </label>
          ))}
        </div>
        <button
          onClick={handleAddRole}
          disabled={loading}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          ➕ Add Role
        </button>
      </div>

      <div className="border rounded overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-2 text-left">Role</th>
              <th className="p-2 text-left">Permissions</th>
              <th className="p-2 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {roles.map((role, i) => (
              <tr key={i} className="border-t">
                <td className="p-2 font-semibold">{role.name}</td>
                <td className="p-2 space-x-2">
                  {role.permissions.map((perm) => (
                    <span
                      key={perm}
                      className="inline-block bg-gray-200 px-2 py-1 rounded text-xs"
                    >
                      {perm}
                    </span>
                  ))}
                </td>
                <td className="p-2">
                  <button
                    onClick={() => handleDeleteRole(role.name)}
                    disabled={loading}
                    className="text-red-600 hover:underline"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}