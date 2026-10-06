import StaffSignIn from '@/libs/components/auth/StaffSignIn';
import withLayoutMain from '@/libs/components/layout/LayoutHome';

const ReceptionistSignIn = () => <StaffSignIn role="receptionist" />;

export default withLayoutMain(ReceptionistSignIn);
