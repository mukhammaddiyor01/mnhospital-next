import { FormEvent, useState } from 'react';
import { useRouter } from 'next/router';
import withLayoutMain from '@/libs/components/layout/LayoutHome';
import Icon from '@/libs/components/common/Icon';
import { BookingOrderInput } from '@/libs/components/booking/types/booking';

const AppointmentPage = () => {
	const router = useRouter();
	const [step, setStep] = useState(1);
	const [form, setForm] = useState<BookingOrderInput>({ serviceId: '', doctorId: String(router.query.doctor ?? ''), bookingDate: '', bookingTime: '', patientName: '', patientPhone: '', reason: '' });
	const [submitted, setSubmitted] = useState(false);

	const updateForm = (field: keyof BookingOrderInput, value: string) => setForm((current) => ({ ...current, [field]: value }));
	const nextStep = (event: FormEvent) => { event.preventDefault(); if (step < 4) setStep(step + 1); else setSubmitted(true); };

	return <div className="inner-page"><div className="container"><div className="page-intro"><span className="eyebrow"><Icon name="calendar_month" /> Appointment booking</span><h1>Let’s find a time for your care.</h1><p>Choose a department, specialist, and a convenient time. You can review everything before confirming your request.</p></div>{submitted ? <div className="placeholder-panel"><Icon name="check_circle" /><h2>Your request is ready.</h2><p>Thank you, {form.patientName || 'patient'}. The booking mutation will submit this request to the MN Hospital API once the backend is connected.</p></div> : <form className="placeholder-panel booking-wizard" onSubmit={nextStep}><div className="wizard-steps">{['Department', 'Doctor', 'Time', 'Details'].map((label, index) => <span className={step >= index + 1 ? 'active' : ''} key={label}><b>0{index + 1}</b>{label}</span>)}</div>{step === 1 && <label>Department<select value={form.serviceId} onChange={(event) => updateForm('serviceId', event.target.value)} required><option value="">Select Department</option><option value="cardiology">Cardiology</option><option value="general-medicine">General Medicine</option><option value="neurology">Neurology</option><option value="pediatrics">Pediatrics</option></select></label>}{step === 2 && <label>Doctor<select value={form.doctorId} onChange={(event) => updateForm('doctorId', event.target.value)} required><option value="">Select Doctor</option><option value="azizbek-rahimov">Dr. Azizbek Rahimov</option><option value="madina-karimova">Dr. Madina Karimova</option><option value="sardor-ergashev">Dr. Sardor Ergashev</option></select></label>}{step === 3 && <div className="booking-fields"><label>Date<input type="date" value={form.bookingDate} onChange={(event) => updateForm('bookingDate', event.target.value)} required /></label><label>Time<select value={form.bookingTime} onChange={(event) => updateForm('bookingTime', event.target.value)} required><option value="">Select time</option><option>09:00 AM</option><option>10:30 AM</option><option>02:00 PM</option><option>04:00 PM</option></select></label></div>}{step === 4 && <div className="booking-fields"><label>Full name<input value={form.patientName} onChange={(event) => updateForm('patientName', event.target.value)} placeholder="Jane Doe" required /></label><label>Phone number<input value={form.patientPhone} onChange={(event) => updateForm('patientPhone', event.target.value)} placeholder="+998 90 000 00 00" required /></label><label className="wide-field">Reason for visit (optional)<textarea value={form.reason} onChange={(event) => updateForm('reason', event.target.value)} placeholder="Briefly describe your symptoms..." /></label></div>}<button className="button button-primary" type="submit">{step === 4 ? 'Confirm appointment' : 'Next step'} <span>→</span></button></form>}</div></div>;
};

export default withLayoutMain(AppointmentPage);
