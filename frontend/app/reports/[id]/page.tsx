'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import ReportDetail from '../components/ReportDetail';

interface Report {
  id: number;
  title: string;
  status: 'APPROVED' | 'PENDING' | 'REJECTED';
  date: string;
  content?: string;
  fileUrl?: string;
}

export default function ReportDetailPage() {
  const { id } = useParams();
  const [report, setReport] = useState<Report | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (!token) {
      setError('Missing access token');
      setLoading(false);
      return;
    }

    fetch(`http://localhost:4000/api/reports/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => {
        if (!res.ok) throw new Error('Failed to fetch report');
        return res.json();
      })
      .then((data) => setReport(data))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <p className="text-center mt-10 text-gray-600">Loading report...</p>;
  if (error) return <p className="text-center text-red-500 mt-10">{error}</p>;
  if (!report) return <p className="text-center text-gray-500 mt-10">Report not found.</p>;

  return (
    <main className="min-h-screen px-4 sm:px-6 lg:pl-72 py-6">
      <ReportDetail report={report} />
    </main>
  );
}