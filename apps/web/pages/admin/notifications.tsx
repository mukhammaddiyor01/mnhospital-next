import AdminWorkspacePage from '@/libs/components/dashboard/AdminWorkspacePage';
import { NotificationsPage } from '@/pages/mypage/notifications';

const AdminNotificationsPage = () => <AdminWorkspacePage titleKey="notifications.title" introKey="notifications.intro"><NotificationsPage embedded /></AdminWorkspacePage>;

export default AdminNotificationsPage;
