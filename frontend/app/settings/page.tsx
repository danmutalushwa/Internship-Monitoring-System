"use client";

import { useEffect, useState } from "react";

export default function SettingsPage() {
  const [user, setUser] = useState<{ id?: number; name?: string; email?: string } | null>(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");

  useEffect(() => {
    async function loadProfile() {
      try {
        const token = localStorage.getItem("accessToken");
        const res = await fetch("http://localhost:4000/api/auth/me", {
          headers: { Authorization: `Bearer ${token}` },
          credentials: "include",
        });
        if (!res.ok) return;
        const data = await res.json();
        setUser(data);
        setName(data.name || "");
        setEmail(data.email || "");
      } catch (err) {
        console.error("Error loading profile:", err);
      }
    }
    loadProfile();
  }, []);

  async function handleUpdateInfo(e: React.FormEvent) {
    e.preventDefault();
    if (!user?.id) return;
    try {
      const token = localStorage.getItem("accessToken");
      const res = await fetch(`http://localhost:4000/api/users/profile/${user.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ name, email }),
      });
      if (res.ok) {
        alert("Profile updated successfully!");
      } else {
        alert("Failed to update profile");
      }
    } catch (err) {
      console.error("Error updating profile:", err);
    }
  }

  async function handleChangePassword(e: React.FormEvent) {
    e.preventDefault();
    if (!user?.id) return;
    try {
      const token = localStorage.getItem("accessToken");
      const res = await fetch(`http://localhost:4000/api/users/${user.id}/password`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      if (res.ok) {
        alert("Password updated successfully!");
        setCurrentPassword("");
        setNewPassword("");
      } else {
        alert("Failed to update password");
      }
    } catch (err) {
      console.error("Error updating password:", err);
    }
  }

  return (
    <div className="p-6 max-w-md mx-auto space-y-8">
      <h1 className="text-2xl font-bold">Settings</h1>

      {user ? (
        <>
          {/* Update Info Form */}
          <form onSubmit={handleUpdateInfo} className="space-y-4 border p-4 rounded">
            <h2 className="text-lg font-semibold">Update Info</h2>
            <div>
              <label className="block mb-1">Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full border p-2 rounded"
              />
            </div>
            <div>
              <label className="block mb-1">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full border p-2 rounded"
              />
            </div>
            <button
              type="submit"
              className="px-4 py-2 bg-sky-600 text-white rounded hover:bg-sky-700"
            >
              Save
            </button>
          </form>

          {/* Change Password Form */}
          <form onSubmit={handleChangePassword} className="space-y-4 border p-4 rounded">
            <h2 className="text-lg font-semibold">Change Password</h2>
            <div>
              <label className="block mb-1">Current Password</label>
              <input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="w-full border p-2 rounded"
              />
            </div>
            <div>
              <label className="block mb-1">New Password</label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full border p-2 rounded"
              />
            </div>
            <button
              type="submit"
              className="px-4 py-2 bg-sky-600 text-white rounded hover:bg-sky-700"
            >
              Update Password
            </button>
          </form>
        </>
      ) : (
        <p>User not authenticated</p>
      )}
    </div>
  );
}