import AdminWorkspacePage from '@/libs/components/dashboard/AdminWorkspacePage';
import { MessagesPage } from '@/pages/mypage/messages';

const AdminMessagesPage = () => <AdminWorkspacePage titleKey="messages.title" introKey="messages.intro"><MessagesPage embedded /></AdminWorkspacePage>;

export default AdminMessagesPage;
