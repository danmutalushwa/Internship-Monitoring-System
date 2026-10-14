'use client';
console.log("✅ PAGE IS RUNNING");
import { useEffect, useState } from 'react';

type Student = {
  id: number;
  name: string;
  email: string;
  internshipCompany: string;
  internshipStatus: string;
  facultyName: string;
};

export default function AssignedStudentsPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let retries = 0;
    const maxRetries = 10;
    const delay = 500;

    const tryFetch = async () => {
      const token = localStorage.getItem('accessToken'); 

      if (!token) {
        if (retries < maxRetries) {
          retries++;
          setTimeout(tryFetch, delay);
        } else {
          setLoading(false);
        }
        return;
      }

      try {
        const res = await fetch('http://localhost:4000/api/supervisor/students', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        
        const data = await res.json();
        console.log("RAW RESPONSE:", data);
        if (Array.isArray(data)) {
          setStudents(data);
        } else if (Array.isArray(data.students)) {
          setStudents(data.students);
        } else {
          setStudents([]);
        }
        console.log("RUNNING ASSIGNED STUDENTS PAGE");
        console.log("FETCHING FROM:", 'http://localhost:4000/supervisor/students');
        
      } catch {
        setStudents([]);
      } finally {
        setLoading(false);
      }
    };

    tryFetch();
  }, []);

  return (
    <main className="mt-[70px] lg:mt-0 lg:ml-[250px] p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
      <h1 className="text-2xl sm:text-3xl font-bold mb-6">🎓 Assigned Students</h1>

      {loading ? (
        <p>Loading...</p>
      ) : students.length === 0 ? (
        <p className="text-gray-500">No assigned students.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse border">
            <thead>
              <tr className="bg-gray-100">
                <th className="border px-4 py-2 text-left">Name</th>
                <th className="border px-4 py-2 text-left">Email</th>
                <th className="border px-4 py-2 text-left">Company</th>
                <th className="border px-4 py-2 text-left">Status</th>
                <th className="border px-4 py-2 text-left">Faculty</th>
              </tr>
            </thead>
            <tbody>
              {students.map((student) => (
                <tr key={student.id}>
                  <td className="border px-4 py-2">{student.name}</td>
                  <td className="border px-4 py-2">{student.email}</td>
                  <td className="border px-4 py-2">{student.internshipCompany}</td>
                  <td className="border px-4 py-2">{student.internshipStatus}</td>
                  <td className="border px-4 py-2">{student.facultyName}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </main>
  );
}