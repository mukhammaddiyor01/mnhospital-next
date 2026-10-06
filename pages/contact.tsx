import Link from 'next/link';
import withLayoutMain from '@/libs/components/layout/LayoutHome';
import Icon from '@/libs/components/common/Icon';
import { useTranslation } from '@/libs/i18n/useTranslation';

const ContactPage = () => {
  const t = useTranslation();

  return <div className="clinical-inner-page">
    <section className="clinical-inner-hero">
      <div className="clinical-crumb"><Link href="/">{t('nav.home')}</Link> / {t('nav.contact')}</div>
      <span className="clinical-eyebrow">{t('contact.eyebrow')}</span>
      <h1>{t('contact.title1')}<br /><em>{t('contact.title2')}</em></h1>
      <p>{t('contact.intro')}</p>
    </section>
    <section className="clinical-inner-section clinical-contact-paths">
      <h2>{t('contact.nextTitle')}</h2>
      <p>{t('contact.nextText')}</p>
      <div className="clinical-contact-options">
        <div>
          <h3>{t('contact.appointmentTitle')}</h3>
          <p>{t('contact.appointmentText')}</p>
          <Link href="/appointment">{t('nav.book')} <Icon name="arrow_forward" /></Link>
        </div>
        <div>
          <h3>{t('contact.emergencyTitle')}</h3>
          <p>{t('contact.emergencyText')}</p>
          <a href="tel:119">119 <Icon name="arrow_forward" /></a>
        </div>
      </div>
    </section>
  </div>;
};

export default withLayoutMain(ContactPage);
