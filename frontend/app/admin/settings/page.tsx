'use client';

import SystemSettingsForm from '../../../components/SystemSettingsForm';

export default function AdminSettingsPage() {
  return (
    <div className="p-6 space-y-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold">⚙️ System Settings</h1>
      <SystemSettingsForm />
    </div>
  );
}