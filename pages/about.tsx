import withLayoutMain from '@/libs/components/layout/LayoutHome';

const AboutPage = () => <div className="inner-page"><div className="container"><div className="page-intro"><span className="eyebrow">About MN Hospital</span><h1>Healthcare should feel human.</h1><p>MN Hospital brings trusted medical expertise and a more thoughtful digital experience together. Our mission is to deliver precision medicine with empathetic care, ensuring every patient feels seen, heard, and supported.</p></div><div className="placeholder-panel"><h2>Built around people, not paperwork.</h2><p>From seamless booking to connected follow-up care, we reimagine every step of the healthcare journey around patient wellbeing.</p></div></div></div>;

export default withLayoutMain(AboutPage);
