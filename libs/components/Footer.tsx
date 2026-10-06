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
        <p>{t('footer.contactIntro')}</p>
        <Link href="/contact">{t('footer.contact')} <Icon name="arrow_forward" /></Link>
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
