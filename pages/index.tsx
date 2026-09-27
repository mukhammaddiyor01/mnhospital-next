import type { NextPage } from 'next';
import withLayoutMain from '@/libs/components/layout/LayoutHome';
import ClinicalHome from '@/libs/components/homepage/ClinicalHome';

const Home: NextPage = () => <ClinicalHome />;

export default withLayoutMain(Home);
