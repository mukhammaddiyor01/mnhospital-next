import Link from 'next/link';
import { FormEvent, useState } from 'react';
import { useRouter } from 'next/router';
import Icon from '../common/Icon';

const Hero = () => {
	const router = useRouter();
	const [search, setSearch] = useState('');

	const searchHandler = (event: FormEvent<HTMLFormElement>) => {
		event.preventDefault();
		router.push(search.trim() ? `/doctor?search=${encodeURIComponent(search.trim())}` : '/doctor');
	};

	return (
		<section className="hero-section">
			<div className="container hero-grid">
				<div className="hero-copy">
					<span className="eyebrow"><Icon name="health_and_safety" /> A modern approach to better health</span>
					<h1>Professional care <em>you can trust.</em></h1>
					<p>Experienced doctors, thoughtful services, and care designed around you — all in one place.</p>
					<div className="hero-actions">
						<Link className="button button-primary" href="/appointment">Book an Appointment <span>→</span></Link>
						<Link className="button button-ghost" href="/about">About MN Hospital</Link>
					</div>
					<div className="hero-trust">
						<div className="rating"><strong>4.8</strong><span className="stars">★★★★★</span><small>from 2,000+ patients</small></div>
						<div className="trust-divider" />
						<div className="certification"><Icon name="verified" /><span>Certified Hospital<small>International Standards</small></span></div>
					</div>
				</div>
				<div className="hero-visual" aria-label="MN Hospital medical team">
					<div className="hero-image-overlay" />
					<div className="hero-visual-label"><Icon name="favorite" /><span>Care that feels human</span></div>
					<div className="hero-stat-card"><strong>24/7</strong><span>Emergency<br />support</span><Icon name="arrow_outward" /></div>
				</div>
			</div>
			<div className="container appointment-card" id="booking">
				<div className="appointment-title"><span className="appointment-icon"><Icon name="calendar_month" /></span><div><strong>Book an Appointment</strong><small>Find a time that works for you</small></div></div>
				<form className="appointment-form" onSubmit={searchHandler}>
					<label><span>Department</span><select defaultValue=""><option value="" disabled>Select Department</option><option>Cardiology</option><option>General Medicine</option><option>Neurology</option><option>Pediatrics</option></select></label>
					<label><span>Service</span><select defaultValue=""><option value="" disabled>Select Service</option><option>Consultation</option><option>Checkup</option><option>Diagnostics</option></select></label>
					<label><span>Date</span><input type="date" aria-label="Appointment date" /></label>
					<button className="button button-secondary" type="submit">View Available Times <span>→</span></button>
				</form>
			</div>
			<div className="container hero-search">
				<Icon name="search" />
				<form onSubmit={searchHandler}><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Find a doctor, specialty, or condition..." aria-label="Find a doctor" /><button type="submit">Search</button></form>
			</div>
		</section>
	);
};

export default Hero;
