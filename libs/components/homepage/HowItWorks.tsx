import Icon from '../common/Icon';
import SectionHeading from '../common/SectionHeading';

const steps = [
	['person_search', 'Choose a doctor', 'Find the right specialist for your specific needs.'],
	['calendar_month', 'Pick a time', 'Select a convenient slot that fits your schedule.'],
	['local_hospital', 'Visit us', 'Receive expert care in our modern facilities.'],
	['history', 'Track your care', 'Access records and follow-ups online.'],
];

const HowItWorks = () => (
	<section className="process-section section-light"><div className="container"><SectionHeading eyebrow="Simple by design" title="How it works" description="A simple, transparent process to get the care you need." /><div className="process-grid">{steps.map(([icon, title, description], index) => <div className="process-step" key={title}><span className="process-number">0{index + 1}</span><Icon name={icon} /><h3>{title}</h3><p>{description}</p></div>)}</div></div></section>
);

export default HowItWorks;
