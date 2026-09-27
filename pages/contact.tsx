import withLayoutMain from '@/libs/components/layout/LayoutHome';
import Icon from '@/libs/components/common/Icon';

const ContactPage = () => <div className="inner-page"><div className="container"><div className="page-intro"><span className="eyebrow">Contact us</span><h1>Let’s talk about your care.</h1><p>Have a question about an appointment or our services? Our support team is ready to help.</p></div><div className="placeholder-panel contact-panel"><h2>MN Hospital</h2><p><Icon name="location_on" /> Tashkent, Chilanzar district, MN Hospital building</p><p><Icon name="call" /> +998 71 200 00 00</p><p><Icon name="mail" /> hello@mnhospital.uz</p><p><Icon name="schedule" /> Monday – Sunday, 24/7</p></div></div></div>;

export default withLayoutMain(ContactPage);
