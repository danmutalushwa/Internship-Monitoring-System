import NotificationList from '../../../components/NotificationList';

export default function ReviewerNotificationsPage() {
  return (
    <main className="p-6 max-w-5xl mx-auto">
      <NotificationList role="REVIEWER" />
    </main>
  );
}