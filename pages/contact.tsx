import { FormEvent, useState } from "react";
import Link from "next/link";
import withLayoutMain from "@/libs/components/layout/LayoutHome";
import Icon from "@/libs/components/common/Icon";
import { useTranslation } from "@/libs/i18n/useTranslation";

const ContactPage = () => {
  const t = useTranslation();
  const [submitted, setSubmitted] = useState(false);
  const submitHandler = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitted(true);
  };

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
                  <a href="tel:+821077777777">+821077777777</a>
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
          <form className="clinical-contact-form" onSubmit={submitHandler}>
            <span className="clinical-section-kicker">{t('contact.messageKicker')}</span>
            <h2>{t('contact.messageTitle')}</h2>
            <label>
              {t('contact.name')}
              <input required placeholder={t('contact.namePlaceholder')} />
            </label>
            <label>
              {t('contact.email')}
              <input required type="email" placeholder="you@example.com" />
            </label>
            <label>
              {t('contact.message')}
              <textarea
                required
                rows={5}
                placeholder={t('contact.messagePlaceholder')}
              />
            </label>
            <button className="clinical-primary-button" type="submit">
              {submitted ? t('contact.received') : t('contact.send')}
            </button>
            {submitted && (
              <p className="clinical-form-success">
                {t('contact.thanks')}
              </p>
            )}
          </form>
        </div>
      </section>
    </div>
  );
};

export default withLayoutMain(ContactPage);
