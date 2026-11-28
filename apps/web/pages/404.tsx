import Link from 'next/link';
import withLayoutMain from '@/libs/components/layout/LayoutHome';
import { useTranslation } from '@/libs/i18n/useTranslation';

const NotFoundPage = () => {
	const t = useTranslation();
	return <div className="clinical-inner-page">
		<section className="clinical-inner-hero">
			<span className="clinical-eyebrow">404</span>
			<h1>{t('notFound.title')}</h1>
			<p>{t('notFound.description')}</p>
			<div className="clinical-hero-actions"><Link className="clinical-primary-button" href="/">{t('notFound.home')}</Link></div>
		</section>
	</div>;
};

export default withLayoutMain(NotFoundPage);
