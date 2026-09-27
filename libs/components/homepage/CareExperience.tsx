import Link from 'next/link';
import Icon from '../common/Icon';

const CareExperience = () => (
	<section className="care-section">
		<div className="container care-grid">
			<div className="care-art"><div className="care-circle"><Icon name="favorite" /></div><div className="care-note"><strong>98%</strong><span>Patient satisfaction</span></div></div>
			<div className="care-copy"><span className="eyebrow">Why MN Hospital</span><h2>Every visit matters.</h2><p>We are committed to providing exceptional care through clinical precision and deep empathy. Our modern facilities and expert staff ensure you receive the best possible treatment.</p><Link className="button button-secondary" href="/about">Learn about our mission <span>→</span></Link><div className="metric-grid"><div><strong>12+</strong><span>Years experience</span></div><div><strong>35+</strong><span>Expert doctors</span></div><div><strong>24/7</strong><span>Emergency support</span></div></div></div>
		</div>
	</section>
);

export default CareExperience;
