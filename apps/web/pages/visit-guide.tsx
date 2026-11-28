import Link from 'next/link';
import withLayoutMain from '@/libs/components/layout/LayoutHome';
import { useTranslation } from '@/libs/i18n/useTranslation';

function VisitGuide() {
  const t = useTranslation();
  return <div className="clinical-inner-page">
    <section className="clinical-inner-hero"><div>
      <div className="clinical-crumb"><Link href="/">{t('nav.home')}</Link> / {t('visit.title')}</div>
      <h1>{t('visit.title')}</h1><p>{t('visit.intro')}</p>
    </div></section>
    <section className="clinical-inner-section clinical-visit-guide">
      <article><h2>{t('visit.step1')}</h2><p>{t('visit.body1')}</p></article>
      <article><h2>{t('visit.step2')}</h2><p>{t('visit.body2')}</p></article>
      <article><h2>{t('visit.step3')}</h2><p>{t('visit.body3')}</p></article>
      <p className="clinical-query-status">{t('visit.notice')}</p>
      <Link className="clinical-primary-button" href="/appointment">{t('visit.book')}</Link>
    </section>
  </div>;
}
export default withLayoutMain(VisitGuide);
