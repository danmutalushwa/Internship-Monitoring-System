"use client";

import { useEffect, useState } from "react";

type Internship = {
  id: number;
  company: string;
  department: string;
  startDate: string;
  endDate: string;
  supervisor: string;
  status: "ONGOING" | "COMPLETED" | "PENDING";
};

export default function StudentInternshipsPage() {
  const [internships, setInternships] = useState<Internship[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editStatus, setEditStatus] = useState<Internship["status"]>("PENDING");

  // Form state for creating internship
  const [company, setCompany] = useState("");
  const [department, setDepartment] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [supervisor, setSupervisor] = useState("");
  const [status, setStatus] = useState<Internship["status"]>("PENDING");

  useEffect(() => {
    fetch("/api/internships/student")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setInternships(data);
        else setInternships([]);
      })
      .catch(() => setInternships([]))
      .finally(() => setLoading(false));
  }, []);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    try {
      const token = localStorage.getItem("accessToken");
      const res = await fetch("/api/internships", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ company, department, startDate, endDate, supervisor, status }),
      });

      if (res.ok) {
        const newInternship = await res.json();
        setInternships((prev) => [...prev, newInternship]);
        // reset form
        setCompany("");
        setDepartment("");
        setStartDate("");
        setEndDate("");
        setSupervisor("");
        setStatus("PENDING");
        alert("Internship created successfully!");
      } else {
        alert("Failed to create internship");
      }
    } catch (err) {
      console.error("Error creating internship:", err);
    }
  }

  async function handleUpdateStatus(id: number) {
    try {
      const token = localStorage.getItem("accessToken");
      const res = await fetch(`/api/internships/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: editStatus }),
      });

      if (res.ok) {
        const updated = await res.json();
        setInternships((prev) =>
          prev.map((i) => (i.id === id ? { ...i, status: updated.status } : i))
        );
        setEditingId(null);
        alert("Internship updated successfully!");
      } else {
        alert("Failed to update internship");
      }
    } catch (err) {
      console.error("Error updating internship:", err);
    }
  }

  async function handleDelete(id: number) {
    if (!confirm("Are you sure you want to delete this internship?")) return;

    try {
      const token = localStorage.getItem("accessToken");
      const res = await fetch(`/api/internships/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.ok) {
        setInternships((prev) => prev.filter((i) => i.id !== id));
        alert("Internship deleted successfully!");
      } else {
        alert("Failed to delete internship");
      }
    } catch (err) {
      console.error("Error deleting internship:", err);
    }
  }

  return (
    <div className="px-4 sm:px-6 lg:pl-[250px] py-6 max-w-full">
      <h1 className="text-xl sm:text-2xl font-bold mb-4">🏢 My Internships</h1>

      {/* Create Internship Form */}
      <form onSubmit={handleCreate} className="space-y-4 border p-4 rounded bg-white mb-6">
        <h2 className="text-lg font-semibold">Add Internship</h2>
        <input
          type="text"
          value={company}
          onChange={(e) => setCompany(e.target.value)}
          placeholder="Company"
          className="w-full border p-2 rounded"
        />
        <input
          type="text"
          value={department}
          onChange={(e) => setDepartment(e.target.value)}
          placeholder="Department"
          className="w-full border p-2 rounded"
        />
        <div className="flex gap-2">
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="w-full border p-2 rounded"
          />
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="w-full border p-2 rounded"
          />
        </div>
        <input
          type="text"
          value={supervisor}
          onChange={(e) => setSupervisor(e.target.value)}
          placeholder="Supervisor"
          className="w-full border p-2 rounded"
        />
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value as Internship["status"])}
          className="w-full border p-2 rounded"
        >
          <option value="PENDING">Pending</option>
          <option value="ONGOING">Ongoing</option>
          <option value="COMPLETED">Completed</option>
        </select>
        <button type="submit" className="px-4 py-2 bg-sky-600 text-white rounded hover:bg-sky-700">
          Save Internship
        </button>
      </form>

      {/* Internship List */}
      {loading ? (
        <p>Loading internships...</p>
      ) : internships.length === 0 ? (
        <p className="text-gray-500">No internship records found.</p>
      ) : (
        <div className="space-y-4">
          {internships.map((internship) => (
            <div key={internship.id} className="border rounded-lg p-4 shadow-sm bg-white">
              <h2 className="text-lg font-semibold">{internship.company}</h2>
              <p className="text-sm text-gray-600">Department: {internship.department}</p>
              <p className="text-sm">
                Duration: {internship.startDate} → {internship.endDate}
              </p>
              <p className="text-sm">Supervisor: {internship.supervisor}</p>
              <p className="text-sm font-medium">
                Status:{" "}
                {editingId === internship.id ? (
                  <span>
                    <select
                      value={editStatus}
                      onChange={(e) => setEditStatus(e.target.value as Internship["status"])}
                      className="border p-1 rounded"
                    >
                      <option value="PENDING">Pending</option>
                      <option value="ONGOING">Ongoing</option>
                      <option value="COMPLETED">Completed</option>
                    </select>
                    <button
                      onClick={() => handleUpdateStatus(internship.id)}
                      className="ml-2 px-2 py-1 bg-sky-600 text-white rounded"
                    >
                      Save
                    </button>
                    <button
                      onClick={() => setEditingId(null)}
                      className="ml-2 px-2 py-1 bg-gray-400 text-white rounded"
                    >
                      Cancel
                    </button>
                  </span>
                ) : (
                  <span>
                    {internship.status}{" "}
                    <button
                      onClick={() => {
                        setEditingId(internship.id);
                        setEditStatus(internship.status);
                      }}
                      className="ml-2 text-blue-600 underline"
                    >
                      Edit
                    </button>
                  </span>
                )}
              </p>

              {/* Delete button */}
              <button
                onClick={() => handleDelete(internship.id)}
                className="mt-2 px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700"
              >
                Delete Internship
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}