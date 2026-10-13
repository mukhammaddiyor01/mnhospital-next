import Link from "next/link";
import withLayoutMain from "@/libs/components/layout/LayoutHome";
import Icon from "@/libs/components/common/Icon";
import { useTranslation } from "@/libs/i18n/useTranslation";

const ContactPage = () => {
  const t = useTranslation();
  const phone = process.env.NEXT_PUBLIC_CLINIC_PHONE?.trim();

  return (
    <div className="clinical-inner-page">
      <section className="clinical-inner-hero">
        <div>
          <div className="clinical-crumb">
            <Link href="/">{t('nav.home')}</Link> / {t('nav.contact')}
          </div>
          <span className="clinical-eyebrow">{t('contact.eyebrow')}</span>
          <h1>
            {t('contact.title1')}
            <br />
            <em>{t('contact.title2')}</em>
          </h1>
          <p>{t('contact.intro')}</p>
        </div>
      </section>
      <section className="clinical-inner-section">
        <div className="clinical-contact-grid">
          <div className="clinical-contact-details">
            <span className="clinical-section-kicker">MN HOSPITAL</span>
            <h2>{t('contact.title')}</h2>
            <p>{t('contact.description')}</p>
            <div className="clinical-contact-item">
              <span className="clinical-contact-icon">
                <Icon name="location_on" />
              </span>
              <div>
                <strong>{t('contact.visit')}</strong>
                <small>
                  {t('footer.address')}
                  <br />
                  {t('footer.building')}
                </small>
              </div>
            </div>
            <div className="clinical-contact-item">
              <span className="clinical-contact-icon">
                <Icon name="call" />
              </span>
              <div>
                <strong>{t('contact.call')}</strong>
                <small>
                  {phone && /^\+?[0-9 ()-]{7,20}$/.test(phone) ? <a href={`tel:${phone.replace(/[ ()-]/g, '')}`}>{phone}</a> : <Link href="/doctor">{t('contact.privateLink')}</Link>}
                  <br />
                  <a href="tel:119">{t('contact.emergency')}: 119</a>
                </small>
              </div>
            </div>
            <div className="clinical-contact-item">
              <span className="clinical-contact-icon">
                <Icon name="schedule" />
              </span>
              <div>
                <strong>{t('contact.hours')}</strong>
                <small>
                  {t('contact.emergencyHours')}
                  <br />
                  {t('contact.weekdayHours')}
                </small>
              </div>
            </div>
          </div>
          <div className="clinical-contact-form">
            <span className="clinical-section-kicker">{t('contact.messageKicker')}</span>
            <h2>{t('contact.messageTitle')}</h2>
            <p>{t('contact.privateHelp')}</p>
            <Link className="clinical-primary-button" href="/doctor">{t('nav.doctors')}</Link>
            <Link href="/visit-guide">{t('visit.title')}</Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default withLayoutMain(ContactPage);
