'use client';

import { useState } from 'react';
import { ArrowDownTrayIcon } from '@heroicons/react/24/outline';

interface ExportButtonProps {
  label?: string;
  onExport: () => Promise<void>;
}

export default function ExportButton({ label = 'Export Data', onExport }: ExportButtonProps) {
  const [loading, setLoading] = useState(false);

  const handleClick = async () => {
    setLoading(true);
    try {
      await onExport();
    } catch {
      alert('Export failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleClick}
      disabled={loading}
      className="flex items-center gap-2 bg-gray-700 text-white px-4 py-2 rounded hover:bg-gray-800"
    >
      <ArrowDownTrayIcon className="w-4 h-4" />
      {loading ? 'Exporting...' : label}
    </button>
  );
}