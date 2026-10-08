import Link from "next/link";
import Icon from "./common/Icon";
import MnLogo from "./common/MnLogo";
import SocialLinks from "./common/SocialLinks";
import AnimatedWave from "./common/AnimatedWave";
import { useTranslation } from "@/libs/i18n/useTranslation";

const Footer = () => {
  const t = useTranslation();
  return (
  <footer id="footer" className="clinical-footer">
    <AnimatedWave variant="footer" />
    <div className="clinical-footer-grid">
      <nav className="clinical-footer-links" aria-label={t('footer.navigation')}>
        <h2>{t('footer.explore')}</h2>
        <Link href="/about">{t('footer.about')}</Link>
        <Link href="/service">{t('footer.medicalServices')}</Link>
        <Link href="/doctor">{t('footer.findDoctor')}</Link>
        <Link href="/article">{t('footer.healthArticles')}</Link>
        <Link href="/appointment">{t('footer.book')}</Link>
        <Link href="/contact">{t('footer.contact')}</Link>
      </nav>
      <div className="clinical-footer-contact">
        <h2>{t('footer.getInTouch')}</h2>
        <div className="clinical-footer-contact-item">
          <span className="clinical-footer-contact-icon">
            <Icon name="location_on" />
          </span>
          <div>
            <small>{t('footer.visit')}</small>
            <p>
              {t('footer.address')}
              <br />
              {t('footer.building')}
            </p>
          </div>
        </div>
        <div className="clinical-footer-contact-item">
          <span className="clinical-footer-contact-icon">
            <Icon name="call" />
          </span>
          <div>
            <small>{t('footer.call')}</small>
            <a href="tel:+821077777777">+821077777777</a>
          </div>
        </div>
        <div className="clinical-footer-contact-item">
          <span className="clinical-footer-contact-icon">
            <Icon name="schedule" />
          </span>
          <div>
            <small>{t('footer.hours')}</small>
            <p>
              {t('footer.emergencyCare')}
              <br />
              {t('footer.weekdays')}
            </p>
          </div>
        </div>
      </div>
      <div className="clinical-footer-brand-card">
        <MnLogo footer />
        <p>
          {t('footer.description')}
        </p>
        <Link className="clinical-footer-cta" href="/appointment">
          {t('footer.plan')} <Icon name="arrow_forward" />
        </Link>
      </div>
    </div>
    <div className="clinical-copyright">
      <span>
        © {new Date().getFullYear()} {t('footer.rights')}
      </span>
      <a href="tel:119">
        <Icon name="emergency" /> {t('footer.emergency')}
      </a>
      <SocialLinks />
    </div>
  </footer>
  );
};

export default Footer;
