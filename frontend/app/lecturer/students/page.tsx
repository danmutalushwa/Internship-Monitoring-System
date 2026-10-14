"use client";

import { useEffect, useState } from "react";

type Student = {
  id: number;
  name: string;
  email: string;
  internshipCompany?: string;
  internshipStatus?: "PENDING" | "APPROVED" | "REJECTED";
  faculty?: { name: string };
};

export default function LecturerStudentsPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    if (!token) {
      console.log("No token found");
      return;
    }
    fetch("http://localhost:4000/api/lecturer/students",{
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      }
    })
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setStudents(data);
        } else if (Array.isArray(data.students)) {
          setStudents(data.students);
        } else {
          console.warn("Unexpected students shape:", data);
          setStudents([]);
        }
      })
      .catch((err) => {
        console.error("Failed to fetch students:", err);
        setStudents([]); 
      });
  }, []);

  const filteredStudents = Array.isArray(students)
    ? students.filter((s) => {
        const nameMatch = searchQuery
          ? s.name.toLowerCase().includes(searchQuery.toLowerCase())
          : true;
        const statusMatch = statusFilter ? s.internshipStatus === statusFilter : true;
        return nameMatch && statusMatch;
      })
    : [];

  return (
    <div className="p-4 sm:p-6 lg:p-8 lg:ml-[250px] max-w-7xl mx-auto">
      <h1 className="text-2xl sm:text-3xl font-bold mb-6">👩‍🎓 My Students</h1>

      {/* 🔍 Search & Filter */}
      <div className="flex flex-col sm:flex-row flex-wrap gap-4 mb-6">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search by student name..."
          className="border p-2 rounded w-full sm:w-auto"
        />

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="border p-2 rounded w-full sm:w-auto"
        >
          <option value="">All Internship Statuses</option>
          <option value="PENDING">Pending</option>
          <option value="ONGOING">Ongoing</option>
          <option value="COMPLETED">Completed</option>
        </select>
      </div>

      {/* 👥 Student Cards */}
      {filteredStudents.length === 0 ? (
        <p className="text-gray-500">No matching students found.</p>
      ) : (
        filteredStudents.map((student) => (
          <div key={student.id} className="mb-6 border rounded-lg p-4 shadow-sm bg-white">
            <h2 className="text-lg font-semibold text-blue-700">{student.name}</h2>
            <p className="text-sm text-gray-600">Email: {student.email}</p>
            {student.faculty?.name && (
              <p className="text-sm">Faculty: {student.faculty.name}</p>
            )}
            {student.internshipCompany && (
              <p className="text-sm">Internship: {student.internshipCompany}</p>
            )}
            {student.internshipStatus && (
              <p className="text-sm">
                Status: <span className="font-medium">{student.internshipStatus}</span>
              </p>
            )}
          </div>
        ))
      )}
    </div>
  );
}