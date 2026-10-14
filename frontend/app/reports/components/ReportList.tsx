'use client';

interface Report {
  id: number;
  title: string;
  content: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  date: string;
}

export default function ReportList({ reports }: { reports: Report[] }) {
  if (!reports || reports.length === 0) {
    return <p className="text-gray-600 text-center">No reports submitted yet.</p>;
  }

  const statusColor = {
    APPROVED: 'text-green-600',
    REJECTED: 'text-red-600',
    PENDING: 'text-yellow-600',
  };

  return (
    <div className="space-y-3">
      {reports.map((r) => (
        <div key={r.id} className="bg-gray-50 p-4 rounded border">
          <h3 className="font-medium">{r.title}</h3>
          <p className="text-sm text-gray-600 mt-1">{r.content}</p>
          <div className="flex justify-between text-sm mt-2">
            <span className="text-gray-500">{r.date}</span>
            <span className={`font-semibold ${statusColor[r.status]}`}>
              {r.status}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}