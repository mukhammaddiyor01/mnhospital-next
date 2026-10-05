import Link from "next/link";
import Icon from "./common/Icon";
import MnLogo from "./common/MnLogo";
import SocialLinks from "./common/SocialLinks";
import AnimatedWave from "./common/AnimatedWave";

const Footer = () => (
  <footer id="footer" className="clinical-footer">
    <AnimatedWave variant="footer" />
    <div className="clinical-footer-grid">
      <nav className="clinical-footer-links" aria-label="Footer navigation">
        <h2>Explore MN Hospital</h2>
        <Link href="/about">About us</Link>
        <Link href="/service">Medical services</Link>
        <Link href="/doctor">Find a doctor</Link>
        <Link href="/article">Health articles</Link>
        <Link href="/appointment">Book an appointment</Link>
        <Link href="/contact">Contact us</Link>
      </nav>
      <div className="clinical-footer-contact">
        <h2>Get in touch</h2>
        <div className="clinical-footer-contact-item">
          <span className="clinical-footer-contact-icon">
            <Icon name="location_on" />
          </span>
          <div>
            <small>VISIT US</small>
            <p>
              Gangwon-do, Samcheok-si
              <br />
              MN Hospital building
            </p>
          </div>
        </div>
        <div className="clinical-footer-contact-item">
          <span className="clinical-footer-contact-icon">
            <Icon name="call" />
          </span>
          <div>
            <small>CALL US</small>
            <a href="tel:+821077777777">+821077777777</a>
          </div>
        </div>
        <div className="clinical-footer-contact-item">
          <span className="clinical-footer-contact-icon">
            <Icon name="schedule" />
          </span>
          <div>
            <small>OPEN HOURS</small>
            <p>
              Emergency care 24/7
              <br />
              Mon–Fri 08:00–20:00
            </p>
          </div>
        </div>
      </div>
      <div className="clinical-footer-brand-card">
        <MnLogo footer />
        <p>
          Thoughtful care, skilled specialists, and clear guidance through every
          step of your health journey.
        </p>
        <Link className="clinical-footer-cta" href="/appointment">
          Plan your visit <Icon name="arrow_forward" />
        </Link>
      </div>
    </div>
    <div className="clinical-copyright">
      <span>
        © {new Date().getFullYear()} MN Hospital. All rights reserved.
      </span>
      <a href="tel:103">
        <Icon name="emergency" /> Emergency: 119
      </a>
      <SocialLinks />
    </div>
  </footer>
);

export default Footer;
