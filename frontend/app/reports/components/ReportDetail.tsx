'use client';

interface Report {
  id: number;
  title: string;
  status: 'APPROVED' | 'PENDING' | 'REJECTED';
  date: string;
  content?: string;
  fileUrl?: string;
}

export default function ReportDetail({ report }: { report: Report }) {
  return (
    <div className="bg-white p-6 rounded-lg shadow border border-gray-200 space-y-4">
      <h1 className="text-2xl font-bold">{report.title}</h1>

      <div className="text-sm text-gray-600">
        <p>
          Status:{' '}
          <span className={statusColor(report.status)}>
            {report.status.charAt(0) + report.status.slice(1).toLowerCase()}
          </span>
        </p>
        <p>Date: {report.date}</p>
      </div>

      {report.content && (
        <div>
          <h2 className="text-lg font-semibold mt-4 mb-2">Report Content</h2>
          <p className="text-sm text-gray-700 whitespace-pre-line">{report.content}</p>
        </div>
      )}

      {report.fileUrl && (
        <a
          href={report.fileUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm text-blue-600 underline block mt-4"
        >
          View attached file
        </a>
      )}
    </div>
  );
}

function statusColor(status: string): string {
  switch (status) {
    case 'APPROVED':
      return 'text-green-600 font-medium';
    case 'PENDING':
      return 'text-yellow-600 font-medium';
    case 'REJECTED':
      return 'text-red-600 font-medium';
    default:
      return 'text-gray-600';
  }
}