import { FormEvent, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useMutation, useQuery, useReactiveVar } from '@apollo/client';
import { useRouter } from 'next/router';
import { ADD_CART_ITEM, CREATE_BOOKING_ORDER } from '@/apollo/booking/mutation';
import { GET_AVAILABLE_DOCTOR_SLOTS } from '@/apollo/booking/query';
import { GET_SERVICES } from '@/apollo/service/query';
import { userVar } from '@/apollo/store';
import withLayoutMain from '@/libs/components/layout/LayoutHome';
import Icon from '@/libs/components/common/Icon';
import { AppointmentDraft } from '@/libs/components/booking/types/booking';

const steps = ['Service', 'Specialist', 'Time', 'Review'];
const mongoId = /^[a-f\d]{24}$/i;
const demoServices = [
	{ _id: 'cardiology', memberId: 'azizbek-rahimov', serviceTitle: 'Cardiology consultation', serviceName: 'Cardiology', serviceDuration: '30', servicePrice: 250000, memberData: { _id: 'azizbek-rahimov', docFullName: 'Dr. Azizbek Rahimov', docSpecialty: 'CARDIOLOGIST' } },
	{ _id: 'general-medicine', memberId: 'madina-karimova', serviceTitle: 'General medicine consultation', serviceName: 'General Medicine', serviceDuration: '30', servicePrice: 180000, memberData: { _id: 'madina-karimova', docFullName: 'Dr. Madina Karimova', docSpecialty: 'GENERAL_PRACTITIONER' } },
	{ _id: 'pediatrics', memberId: 'sardor-ergashev', serviceTitle: 'Pediatric consultation', serviceName: 'Pediatrics', serviceDuration: '30', servicePrice: 200000, memberData: { _id: 'sardor-ergashev', docFullName: 'Dr. Sardor Ergashev', docSpecialty: 'PEDIATRICIAN' } },
];

const AppointmentPage = () => {
	const router = useRouter();
	const user = useReactiveVar(userVar);
	const apiEnabled = Boolean(process.env.NEXT_PUBLIC_API_GRAPHQL_URL);
	const [step, setStep] = useState(1);
	const [form, setForm] = useState<AppointmentDraft>({ serviceId: '', doctorId: '', date: '', startsAt: '', patientNote: '' });
	const [order, setOrder] = useState<{ orderCode: string; bookingOrderStatus: string } | null>(null);
	const [message, setMessage] = useState('');
	const servicesQuery = useQuery(GET_SERVICES, {
		variables: { input: { page: 1, limit: 50, sort: 'serviceRank', direction: 'DESC', search: { serviceStatusList: ['ACTIVE'] } } },
		skip: !apiEnabled,
		fetchPolicy: 'cache-and-network',
	});
	const services = servicesQuery.data?.getServices?.list?.length ? servicesQuery.data.getServices.list : demoServices;
	const selectedService = useMemo(() => services.find((service: any) => service._id === form.serviceId), [form.serviceId, services]);
	const canLoadSlots = apiEnabled && mongoId.test(form.serviceId) && mongoId.test(form.doctorId) && Boolean(form.date);
	const slotsQuery = useQuery(GET_AVAILABLE_DOCTOR_SLOTS, {
		variables: { input: { serviceId: form.serviceId, doctorId: form.doctorId, date: form.date } },
		skip: !canLoadSlots,
		fetchPolicy: 'network-only',
	});
	const slots = canLoadSlots ? (slotsQuery.data?.getAvailableDoctorSlots ?? []) : form.date ? ['09:00', '10:30', '14:00', '16:00'].map((time) => ({ startsAt: `${form.date}T${time}:00`, endsAt: '' })) : [];
	const [addCartItem, addState] = useMutation(ADD_CART_ITEM);
	const [createBookingOrder, orderState] = useMutation(CREATE_BOOKING_ORDER);

	useEffect(() => {
		if (!router.isReady) return;
		const requestedService = typeof router.query.service === 'string' ? services.find((service: any) => service._id === router.query.service) : undefined;
		const requestedDoctor = typeof router.query.doctor === 'string' ? router.query.doctor : '';
		const matchingService = requestedService ?? services.find((service: any) => service.memberId === requestedDoctor);
		if (matchingService || requestedDoctor) setForm((current) => ({ ...current, doctorId: matchingService?.memberId ?? requestedDoctor, ...(matchingService ? { serviceId: matchingService._id } : {}) }));
	}, [router.isReady, router.query.doctor, router.query.service, services]);

	const updateForm = (field: keyof AppointmentDraft, value: string) => {
		setMessage('');
		setForm((current) => ({ ...current, [field]: value, ...(field === 'date' ? { startsAt: '' } : {}) }));
	};
	const chooseService = (serviceId: string) => {
		const service = services.find((item: any) => item._id === serviceId);
		setForm((current) => ({ ...current, serviceId, doctorId: service?.memberId ?? '', startsAt: '' }));
	};
	const submitStep = async (event: FormEvent) => {
		event.preventDefault();
		setMessage('');
		if (step < steps.length) return setStep((current) => current + 1);
		if (!apiEnabled) return setMessage('Preview mode is active. Connect NEXT_PUBLIC_API_GRAPHQL_URL to place this booking order.');
		if (!user._id) return setMessage('Please sign in as a patient before placing the booking order.');
		try {
			await addCartItem({ variables: { input: { serviceId: form.serviceId, doctorId: form.doctorId, patientNote: form.patientNote || undefined, requestedStartAt: form.startsAt } } });
			const result = await createBookingOrder();
			setOrder(result.data?.createBookingOrder ?? null);
		} catch (error: any) {
			setMessage(error.message ?? 'The booking order could not be created. Please try another time.');
		}
	};
	const formatSlot = (value: string) => {
		const date = new Date(value);
		return Number.isNaN(date.getTime()) ? 'Unavailable' : new Intl.DateTimeFormat('en', { hour: '2-digit', minute: '2-digit' }).format(date);
	};
	const busy = addState.loading || orderState.loading;

	return <div className="clinical-inner-page">
		<section className="clinical-inner-hero"><div><div className="clinical-crumb"><Link href="/">Home</Link> / Appointments</div><span className="clinical-eyebrow">APPOINTMENT BOOKING</span><h1>Let’s find a time<br /><em>for your care.</em></h1><p>Select a live hospital service and an available specialist slot. Your booking order will be secured through the MN Hospital patient workflow.</p></div></section>
		<section className="clinical-inner-section clinical-appointment-section">
			{order ? <div className="clinical-booking-success"><Icon name="check_circle" /><span className="clinical-section-kicker">ORDER {order.orderCode}</span><h2>Your booking order is ready.</h2><p>Status: {order.bookingOrderStatus}. The appointment becomes confirmed after the required payment or reception approval.</p><Link className="clinical-primary-button" href="/doctor">Explore doctors</Link></div> : <form className="booking-wizard" onSubmit={submitStep}>
				<div className="wizard-steps">{steps.map((label, index) => <span className={step >= index + 1 ? 'active' : ''} key={label}><b>0{index + 1}</b>{label}</span>)}</div>
				{step === 1 && <label>Hospital service<select value={form.serviceId} onChange={(event) => chooseService(event.target.value)} required><option value="">Select a service</option>{services.map((service: any) => <option value={service._id} key={service._id}>{service.serviceTitle || service.serviceName}</option>)}</select>{servicesQuery.loading && <small>Refreshing services from the hospital API…</small>}</label>}
				{step === 2 && <div className="clinical-booking-review"><span className="clinical-service-detail-icon"><Icon name="stethoscope" /></span><div><small>Assigned specialist</small><h3>{selectedService?.memberData?.docFullName ?? 'Specialist assigned by service'}</h3><p>{String(selectedService?.memberData?.docSpecialty ?? 'Medical specialist').replaceAll('_', ' ')}</p></div><input type="hidden" value={form.doctorId} required readOnly /></div>}
				{step === 3 && <div className="booking-fields"><label>Date<input type="date" min={new Date().toISOString().slice(0, 10)} value={form.date} onChange={(event) => updateForm('date', event.target.value)} required /></label><label>Available time<select value={form.startsAt} onChange={(event) => updateForm('startsAt', event.target.value)} required disabled={!form.date || slotsQuery.loading}><option value="">{slotsQuery.loading ? 'Checking availability…' : 'Select time'}</option>{slots.map((slot: any) => <option value={slot.startsAt} key={slot.startsAt}>{formatSlot(slot.startsAt)}</option>)}</select></label>{form.date && !slotsQuery.loading && slots.length === 0 && <p className="clinical-form-error wide-field">No available slots on this date. Please choose another day.</p>}</div>}
				{step === 4 && <div className="clinical-booking-review clinical-booking-review-final"><div><small>Service</small><h3>{selectedService?.serviceTitle || selectedService?.serviceName}</h3><p>{selectedService?.memberData?.docFullName} · {form.startsAt ? new Date(form.startsAt).toLocaleString() : ''}</p></div><strong>{Number(selectedService?.servicePrice ?? 0).toLocaleString('uz-UZ')} UZS</strong><label>Note for the care team (optional)<textarea value={form.patientNote} onChange={(event) => updateForm('patientNote', event.target.value)} placeholder="Briefly describe the reason for your visit…" /></label></div>}
				{message && <div className="clinical-booking-message"><Icon name="info" /><span>{message} {!user._id && apiEnabled && <Link href="/account/signin">Sign in</Link>}</span></div>}
				<div className="clinical-booking-actions">{step > 1 && <button className="clinical-secondary-button" type="button" onClick={() => setStep((current) => current - 1)}>Back</button>}<button className="clinical-primary-button" type="submit" disabled={busy}>{busy ? 'Creating order…' : step === 4 ? 'Place booking order' : 'Next step'} <Icon name="arrow_forward" /></button></div>
			</form>}
		</section>
	</div>;
};

export default withLayoutMain(AppointmentPage);
