import Link from 'next/link';
import Image from 'next/image';
import withLayoutMain from '@/libs/components/layout/LayoutHome';
import { useTranslation } from '@/libs/i18n/useTranslation';

const AboutPage = () => {
	const t = useTranslation();
	return <div className="clinical-inner-page">
		<section className="clinical-inner-hero"><div>
			<div className="clinical-crumb"><Link href="/">{t('nav.home')}</Link> / {t('footer.about')}</div>
			<span className="clinical-eyebrow">{t('about.story')}</span>
			<h1>{t('about.hero1')}<br /><em>{t('about.hero2')}</em></h1>
			<p>{t('about.intro')}</p>
		</div></section>
		<section className="clinical-inner-section"><div className="clinical-about-grid">
			<div className="clinical-about-art"><Image src="/img/hospital-care-3.png" alt={t('about.imageAlt')} fill sizes="(max-width: 680px) calc(100vw - 64px), 520px" /></div>
			<div><span className="clinical-eyebrow">{t('about.purpose')}</span><h2>{t('about.title')}</h2>
				<p>{t('about.description')}</p>
				<ul className="clinical-check-list"><li>{t('about.point1')}</li><li>{t('about.point2')}</li><li>{t('about.point3')}</li><li>{t('about.point4')}</li></ul>
				<Link className="clinical-primary-button clinical-inline-button" href="/service">{t('about.explore')} <span>↗</span></Link>
			</div>
		</div></section>
		<section className="clinical-about-values"><div><span className="clinical-section-kicker">{t('about.standard')}</span><h2>{t('about.standardTitle')}</h2></div>
			<div className="clinical-value-grid">
				<article><strong>01</strong><h3>{t('about.value1')}</h3><p>{t('about.value1Text')}</p></article>
				<article><strong>02</strong><h3>{t('about.value2')}</h3><p>{t('about.value2Text')}</p></article>
				<article><strong>03</strong><h3>{t('about.value3')}</h3><p>{t('about.value3Text')}</p></article>
			</div>
		</section>
	</div>;
};

export default withLayoutMain(AboutPage);
