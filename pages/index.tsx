import type { NextPage } from 'next';
import withLayoutMain from '@/libs/components/layout/LayoutHome';
import Hero from '@/libs/components/homepage/Hero';
import Services from '@/libs/components/homepage/Services';
import FeaturedDoctors from '@/libs/components/homepage/FeaturedDoctors';
import CareExperience from '@/libs/components/homepage/CareExperience';
import HowItWorks from '@/libs/components/homepage/HowItWorks';

const Home: NextPage = () => (
	<div className="home-page">
		<Hero />
		<Services />
		<FeaturedDoctors />
		<CareExperience />
		<HowItWorks />
	</div>
);

export default withLayoutMain(Home);
