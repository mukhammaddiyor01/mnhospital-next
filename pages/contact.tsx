import { FormEvent, useState } from "react";
import Link from "next/link";
import withLayoutMain from "@/libs/components/layout/LayoutHome";
import Icon from "@/libs/components/common/Icon";

const ContactPage = () => {
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
            <Link href="/">Home</Link> / Contact
          </div>
          <span className="clinical-eyebrow">GET IN TOUCH</span>
          <h1>
            Let’s talk about
            <br />
            <em>your care.</em>
          </h1>
          <p>
            Have a question about an appointment or our services? Our support
            team is ready to help.
          </p>
        </div>
      </section>
      <section className="clinical-inner-section">
        <div className="clinical-contact-grid">
          <div className="clinical-contact-details">
            <span className="clinical-section-kicker">MN HOSPITAL</span>
            <h2>We’re here when you need us.</h2>
            <p>
              Reach out to our patient support team for guidance, appointments,
              and service information.
            </p>
            <div className="clinical-contact-item">
              <span className="clinical-contact-icon">
                <Icon name="location_on" />
              </span>
              <div>
                <strong>Visit us</strong>
                <small>
                  Tashkent, Chilanzar district
                  <br />
                  MN Hospital building
                </small>
              </div>
            </div>
            <div className="clinical-contact-item">
              <span className="clinical-contact-icon">
                <Icon name="call" />
              </span>
              <div>
                <strong>Call us</strong>
                <small>
                  <a href="tel:+821077777777">+821077777777</a>
                  <br />
                  <a href="tel:103">Emergency line: 119</a>
                </small>
              </div>
            </div>
            <div className="clinical-contact-item">
              <span className="clinical-contact-icon">
                <Icon name="schedule" />
              </span>
              <div>
                <strong>Working hours</strong>
                <small>
                  Emergency care: 24/7
                  <br />
                  Mon–Fri: 08:00–20:00
                </small>
              </div>
            </div>
          </div>
          <form className="clinical-contact-form" onSubmit={submitHandler}>
            <span className="clinical-section-kicker">SEND A MESSAGE</span>
            <h2>How can we help?</h2>
            <label>
              Name
              <input required placeholder="Your full name" />
            </label>
            <label>
              Email
              <input required type="email" placeholder="you@example.com" />
            </label>
            <label>
              Message
              <textarea
                required
                rows={5}
                placeholder="Tell us how we can support you..."
              />
            </label>
            <button className="clinical-primary-button" type="submit">
              {submitted ? "Message received ✓" : "Send message →"}
            </button>
            {submitted && (
              <p className="clinical-form-success">
                Thank you. Our care coordinator will contact you shortly.
              </p>
            )}
          </form>
        </div>
      </section>
    </div>
  );
};

export default withLayoutMain(ContactPage);
