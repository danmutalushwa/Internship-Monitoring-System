'use client';

interface AdminSummaryCardsProps {
  totalUsers: number;
  activeReviewers: number;
  faculties: number;
  pendingConfigs: number;
}

export default function AdminSummaryCards({
  totalUsers,
  activeReviewers,
  faculties,
  pendingConfigs,
}: AdminSummaryCardsProps) {
  const cards = [
    { label: 'Total Users', value: totalUsers, color: 'bg-gray-100' },
    { label: 'Active Reviewers', value: activeReviewers, color: 'bg-blue-100' },
    { label: 'Faculties', value: faculties, color: 'bg-green-100' },
    { label: 'Pending Configs', value: pendingConfigs, color: 'bg-yellow-100' },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {cards.map((card) => (
        <div key={card.label} className={`p-4 rounded shadow-sm ${card.color}`}>
          <p className="text-sm text-gray-600">{card.label}</p>
          <p className="text-xl font-bold">{card.value}</p>
        </div>
      ))}
    </div>
  );
}