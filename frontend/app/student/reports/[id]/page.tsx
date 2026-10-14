'use client';

import { use, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import ReportAI from '../../../../components/ReportAI';

interface Report {
  id: number;
  title: string;
  content: string;
}

type Params = { id: string };

export default function StudentReportPage({ params }: { params: Promise<Params> }) {
  const { id } = use(params); 
  const reportId = Number(id);

  const [report, setReport] = useState<Report | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const router = useRouter();

  useEffect(() => {
    async function fetchReport() {
      try {
        const token = localStorage.getItem('accessToken');
        const res = await fetch(`/api/reports/${reportId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!res.ok) throw new Error('Failed to load report');
        const data = await res.json();
        setReport(data);
      } catch (err: any) {
        setError(err.message || 'Something went wrong');
      } finally {
        setLoading(false);
      }
    }

    fetchReport();
  }, [reportId]);

  if (loading) return <p className="p-4">Loading report...</p>;
  if (error) return <p className="p-4 text-red-600">{error}</p>;
  if (!report) return <p className="p-4">Report not found.</p>;

  const token = localStorage.getItem('accessToken') || '';

  return (
    <div className="max-w-3xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-2">{report.title}</h1>
      <p className="whitespace-pre-wrap text-gray-800 mb-6">{report.content}</p>

      <ReportAI reportId={report.id} role="STUDENT" token={token} />

      <button
        onClick={() => router.push(`/student/reports/edit/${report.id}`)}
        className="mt-6 inline-block px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
      >
        Edit Report
      </button>
    </div>
  );
}