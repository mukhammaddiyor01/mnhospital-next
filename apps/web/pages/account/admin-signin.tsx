import StaffSignIn from '@/libs/components/auth/StaffSignIn';
import withLayoutMain from '@/libs/components/layout/LayoutHome';

const AdminSignIn = () => <StaffSignIn role="admin" />;

export default withLayoutMain(AdminSignIn);
