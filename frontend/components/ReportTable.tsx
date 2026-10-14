'use client';

import Link from 'next/link';
import { useState } from 'react';

interface Report {
  id: number;
  title: string;
  status: string;
  faculty: string;
  student: { name: string };
  reviewer?: { name: string };
  updatedAt?: string;
}

interface ReportTableProps {
  reports: Report[];
  role: 'DEAN';
}

export default function ReportTable({ reports, role }: ReportTableProps) {
  const [sortKey, setSortKey] = useState<'title' | 'status' | 'faculty' | 'updatedAt'>('updatedAt');
  const [sortAsc, setSortAsc] = useState(false);

  const sortedReports = [...reports].sort((a, b) => {
    const valA = a[sortKey] || '';
    const valB = b[sortKey] || '';
    return sortAsc
      ? String(valA).localeCompare(String(valB))
      : String(valB).localeCompare(String(valA));
  });

  const toggleSort = (key: typeof sortKey) => {
    if (sortKey === key) setSortAsc(!sortAsc);
    else {
      setSortKey(key);
      setSortAsc(true);
    }
  };

  return (
    <div className="overflow-x-auto border rounded">
      <table className="min-w-full text-sm">
        <thead className="bg-gray-100">
          <tr>
            <th className="p-2 cursor-pointer" onClick={() => toggleSort('title')}>Title</th>
            <th className="p-2 cursor-pointer" onClick={() => toggleSort('faculty')}>Faculty</th>
            <th className="p-2 cursor-pointer" onClick={() => toggleSort('status')}>Status</th>
            <th className="p-2">Student</th>
            <th className="p-2">Reviewer</th>
            <th className="p-2 cursor-pointer" onClick={() => toggleSort('updatedAt')}>Updated</th>
            <th className="p-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {sortedReports.map((report) => (
            <tr key={report.id} className="border-t">
              <td className="p-2">{report.title}</td>
              <td className="p-2">{report.faculty}</td>
              <td className="p-2">{report.status}</td>
              <td className="p-2">{report.student.name}</td>
              <td className="p-2">{report.reviewer?.name || '—'}</td>
              <td className="p-2 text-xs text-gray-500">
                {report.updatedAt ? new Date(report.updatedAt).toLocaleString() : '—'}
              </td>
              <td className="p-2">
                <Link
                  href={`/${role.toLowerCase()}/reports/${report.id}`}
                  className="text-blue-600 underline"
                >
                  View
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}