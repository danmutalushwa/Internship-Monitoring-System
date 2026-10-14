'use client';

interface DeanSummaryCardsProps {
  total: number;
  approved: number;
  pending: number;
  rejected: number;
}

export default function DeanSummaryCards({
  total,
  approved,
  pending,
  rejected,
}: DeanSummaryCardsProps) {
  const cards = [
    { label: 'Total Reports', value: total, color: 'bg-gray-100' },
    { label: 'Approved', value: approved, color: 'bg-green-100' },
    { label: 'Pending', value: pending, color: 'bg-yellow-100' },
    { label: 'Rejected', value: rejected, color: 'bg-red-100' },
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