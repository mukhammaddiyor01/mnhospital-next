import AuthPortal from '@/libs/components/auth/AuthPortal';
import withLayoutMain from '@/libs/components/layout/LayoutHome';

const SignInPage = () => <AuthPortal initialMode="login" />;

export default withLayoutMain(SignInPage);
