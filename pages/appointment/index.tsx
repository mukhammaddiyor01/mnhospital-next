import { FormEvent, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useMutation, useQuery, useReactiveVar } from '@apollo/client';
import { useRouter } from 'next/router';
import { CREATE_APPOINTMENT_BOOKING } from '@/apollo/booking/checkout';
import { GET_AVAILABLE_DOCTOR_SLOTS } from '@/apollo/booking/query';
import { GET_SERVICES } from '@/apollo/service/query';
import { userVar } from '@/apollo/store';
import withLayoutMain from '@/libs/components/layout/LayoutHome';
import Icon from '@/libs/components/common/Icon';
import { AppointmentDraft } from '@/libs/components/booking/types/booking';
import { Service, Services } from '@/libs/components/service/types/service';
import { MemberType } from '@/libs/components/member/enums/member.enum';
import { useTranslation } from '@/libs/i18n/useTranslation';
import { useWorkspaceText } from '@/libs/components/workspace/useWorkspaceText';
import { usePreferences } from '@/libs/components/preference/PreferenceProvider';
import { clinicToday, clinicDateTime } from '@/libs/payments/clinic';
import { useClinicSettings } from '@/libs/payments/useClinicSettings';
import { formatMoney } from '@/libs/components/common/currency';

const draftKey = 'mn-appointment-draft-v1';
const emptyDraft: AppointmentDraft = { serviceId: '', doctorId: '', date: '', startsAt: '', patientNote: '' };
function AppointmentPage() {
	const t = useTranslation();
	const w = useWorkspaceText();
	const clinic = useClinicSettings();
	const { language } = usePreferences();
	const locale = language === 'KR' ? 'ko-KR' : language === 'UZ' ? 'uz-UZ' : 'en-US';
	const router = useRouter();
	const user = useReactiveVar(userVar);
	const [form, setForm] = useState(emptyDraft);
	const [message, setMessage] = useState('');
	const [page, setPage] = useState(1);
	const [search, setSearch] = useState('');
	const restored = useRef(false);
	const preselected = useRef(false);
	const lock = useRef(false);
	const requestKey = useRef('');
	const [create, creating] = useMutation<{ createAppointmentBooking: { _id: string } }>(CREATE_APPOINTMENT_BOOKING);
	const catalog = useQuery<{ getServices: Services }>(GET_SERVICES, {
		variables: { input: { page, limit: 50, sort: 'serviceRank', direction: 'DESC', search: { ...(search ? { text: search } : {}), ...(typeof router.query.doctor === 'string' && /^[a-f\d]{24}$/i.test(router.query.doctor) ? { memberId: router.query.doctor } : {}) } } },
		fetchPolicy: 'network-only',
	});
	const services = catalog.data?.getServices.list ?? [];
	const selected = services.find((service) => service._id === form.serviceId);
	const slotsQuery = useQuery<{ getAvailableDoctorSlots: Array<{ startsAt: string; endsAt: string }> }>(GET_AVAILABLE_DOCTOR_SLOTS, {
		variables: { input: { serviceId: form.serviceId, doctorId: form.doctorId, date: form.date } },
		skip: !selected || !form.date,
		fetchPolicy: 'network-only',
	});
	const slots = slotsQuery.data?.getAvailableDoctorSlots ?? [];
	useEffect(() => {
		if (!router.isReady || restored.current) return;
		restored.current = true;
		try {
			const saved = JSON.parse(sessionStorage.getItem(draftKey) || 'null');
			if (saved && Object.keys(emptyDraft).every((key) => typeof saved[key] === 'string')) setForm(saved);
		} catch { /* A malformed or unavailable draft does not block booking. */ }
	}, [router.isReady]);
	useEffect(() => {
		if (!router.isReady || preselected.current || !catalog.data) return;
		preselected.current = true;
		const requested = services.find((service) => service._id === router.query.service) || services.find((service) => service.memberId === router.query.doctor);
		if (requested) setForm((current) => ({ ...current, serviceId: requested._id, doctorId: requested.memberId, startsAt: '' }));
	}, [router.isReady, router.query.service, router.query.doctor, catalog.data, services]);
	const update = (patch: Partial<AppointmentDraft>) => {
		setForm((current) => ({ ...current, ...patch }));
		requestKey.current = '';
		setMessage('');
	};
	const submit = async (event: FormEvent) => {
		event.preventDefault();
		if (lock.current || !selected || !slots.some((slot) => slot.startsAt === form.startsAt)) return;
		if (!user._id) {
			try { sessionStorage.setItem(draftKey, JSON.stringify(form)); } catch { /* Keep the in-page draft. */ }
			await router.push('/account/signin?redirect=%2Fappointment');
			return;
		}
		if (user.memberType !== MemberType.PATIENT) return setMessage(w('patientBookingOnly'));
		lock.current = true;
		setMessage('');
		if (!requestKey.current) requestKey.current = crypto.randomUUID();
		try {
			const result = await create({ variables: { input: { serviceId: selected._id, doctorId: selected.memberId, requestedStartAt: form.startsAt,
				patientNote: form.patientNote || undefined, idempotencyKey: requestKey.current } } });
			if (!result.data) throw new Error(t('booking.orderError'));
			try { sessionStorage.removeItem(draftKey); } catch { /* Storage is optional. */ }
			await router.push(`/booking/${result.data.createAppointmentBooking._id}/payment`);
		} catch (error) { setMessage(error instanceof Error ? error.message : t('booking.orderError')); }
		finally { lock.current = false; }
	};
	return <div className="clinical-inner-page">
		<section className="clinical-inner-hero"><div><div className="clinical-crumb"><Link href="/">{t('nav.home')}</Link> / {t('nav.appointments')}</div>
			<span className="clinical-eyebrow">{t('booking.eyebrow')}</span><h1>{t('booking.hero1')}<br /><em>{t('booking.hero2')}</em></h1><p>{w('simpleBookingIntro')}</p></div></section>
		<section className="clinical-inner-section clinical-appointment-section">
			<form className="booking-wizard" onSubmit={submit}>
				<div className="wizard-steps"><span className="active"><b>01</b>{w('chooseVisit')}</span><span><b>02</b>{w('payments')}</span></div>
				<div className="booking-fields">
					<label>{t('booking.date')}<input type="date" min={clinicToday(clinic.timeZone)} value={form.date} required onChange={(event) => update({ date: event.target.value, startsAt: '' })} /></label>
					<label>{w('searchService')}<input type="search" value={search} onChange={(event) => { setSearch(event.target.value); setPage(1); update({ serviceId: '', doctorId: '', startsAt: '' }); }} /></label>
					<label className="wide-field">{t('booking.hospitalService')}<select value={form.serviceId} required disabled={catalog.loading || !services.length} onChange={(event) => {
						const service = services.find((item) => item._id === event.target.value);
						update({ serviceId: service?._id || '', doctorId: service?.memberId || '', startsAt: '' });
					}}><option value="">{t('booking.selectService')}</option>{services.map((service: Service) => <option value={service._id} key={service._id}>{service.serviceTitle || service.serviceName} · {service.memberData?.docFullName} · {formatMoney(service.servicePrice, clinic.currency)}</option>)}</select></label>
					<label>{t('booking.availableTime')}<select value={form.startsAt} required disabled={!selected || !form.date || slotsQuery.loading} onChange={(event) => update({ startsAt: event.target.value })}>
						<option value="">{slotsQuery.loading ? t('booking.checking') : t('booking.selectTime')}</option>{slots.map((slot) => <option key={slot.startsAt} value={slot.startsAt}>{new Intl.DateTimeFormat(locale, { timeZone: clinic.timeZone, hour: '2-digit', minute: '2-digit' }).format(new Date(slot.startsAt))}</option>)}
					</select><small>{w('clinicTime')} · {clinic.timeZone}</small></label>
					<label>{t('booking.note')}<textarea maxLength={1000} value={form.patientNote} onChange={(event) => update({ patientNote: event.target.value })} placeholder={t('booking.notePlaceholder')} /></label>
				</div>
				{catalog.loading && <p role="status">{t('booking.refreshing')}</p>}
				{catalog.error && <p role="alert">{w('servicesUnavailable')} <button type="button" onClick={() => void catalog.refetch().catch(() => undefined)}>{w('refresh')}</button></p>}
				{!catalog.loading && !catalog.error && !services.length && <p role="status">{w('servicesEmpty')}</p>}
				{(page > 1 || (catalog.data?.getServices.metaCounter[0]?.total || 0) > 50) && <div className="clinical-booking-actions"><button type="button" disabled={page <= 1 || catalog.loading} onClick={() => setPage((value) => value - 1)}>←</button><span>{page}</span><button type="button" disabled={page * 50 >= (catalog.data?.getServices.metaCounter[0]?.total || 0) || catalog.loading} onClick={() => setPage((value) => value + 1)}>→</button></div>}
				{slotsQuery.error && <p role="alert">{slotsQuery.error.message}</p>}
				{selected && form.date && !slotsQuery.loading && !slotsQuery.error && !slots.length && <p role="status">{t('booking.noSlots')}</p>}
				{selected && <div className="clinical-booking-review"><div><h3>{selected.serviceTitle}</h3><p>{selected.memberData?.docFullName}{form.startsAt ? ` · ${clinicDateTime(form.startsAt, locale, clinic.timeZone)}` : ''}</p></div><strong>{formatMoney(selected.servicePrice, clinic.currency)}</strong></div>}
				{message && <p className="clinical-form-error" role="alert">{message}</p>}
				<div className="clinical-booking-actions"><button className="clinical-primary-button" type="submit" disabled={creating.loading || catalog.loading || slotsQuery.loading || !selected || !slots.some((slot) => slot.startsAt === form.startsAt)}>{creating.loading ? t('booking.creating') : w('continuePayment')} <Icon name="arrow_forward" /></button></div>
			</form>
		</section>
	</div>;
}
export default withLayoutMain(AppointmentPage);
