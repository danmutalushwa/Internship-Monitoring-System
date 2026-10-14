'use client';

interface ReportCardProps {
  id: number;
  title: string;
  status: string;
  studentName?: string;
  updatedAt?: string;
  role: 'STUDENT' | 'SUPERVISOR' | 'LECTURER' | 'DEAN';
}

export default function ReportCard({
  title,
  status,
  studentName,
  updatedAt,
}: ReportCardProps) {
  return (
    <div className="border rounded p-4 hover:shadow-md transition">
      <h3 className="font-semibold text-lg">{title}</h3>
      <p className="text-sm text-gray-600">Status: {status}</p>

      {studentName && (
        <p className="text-sm">Student: {studentName}</p>
      )}

      {updatedAt && (
        <p className="text-xs text-gray-500">
          Updated: {new Date(updatedAt).toLocaleString()}
        </p>
      )}
    </div>
  );
}