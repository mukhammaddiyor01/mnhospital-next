import AuthPortal from '@/libs/components/auth/AuthPortal';
import withLayoutMain from '@/libs/components/layout/LayoutHome';

const JoinPage = () => <AuthPortal initialMode="register" />;

export default withLayoutMain(JoinPage);
