import NotificationList from '../../../components/NotificationList';

export default function AdminNotificationsPage() {
  return (
    <main className="p-6 max-w-5xl mx-auto">
      <NotificationList role="ADMIN" />
    </main>
  );
}