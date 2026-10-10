import { useState } from 'react';
import { useQuery } from '@apollo/client';
import Link from 'next/link';
import { GET_AVAILABLE_DOCTOR_DATES } from '@/apollo/booking/query';
import { clinicToday } from '@/libs/payments/clinic';
import { usePreferences } from '../preference/PreferenceProvider';
import Icon from '../common/Icon';
import styles from './BookingDatePicker.module.scss';

const copy = {
	EN: {
		title: 'Choose a date',
		previous: 'Previous month',
		next: 'Next month',
		loading: 'Checking available dates…',
		empty:
			'No appointments are available this month. Try another month or service.',
		schedule:
			'This doctor has not published a working schedule yet. Please choose another service or contact the clinic.',
		room: 'Booking is unavailable until the clinic assigns an available room to this doctor.',
		ended:
			'This service’s booking period has ended. Please choose another service.',
		invalid:
			'The clinic needs to update this service’s booking dates before appointments can be made.',
		error: 'Available dates could not be loaded.',
		retry: 'Try again',
		help: 'Highlighted dates have an available appointment. Times use the clinic’s time zone.',
		doctor: 'View doctor',
	},
	UZ: {
		title: 'Sanani tanlang',
		previous: 'Oldingi oy',
		next: 'Keyingi oy',
		loading: 'Bo‘sh qabul sanalari tekshirilmoqda…',
		empty: 'Bu oyda bo‘sh qabul yo‘q. Boshqa oy yoki xizmatni tanlang.',
		schedule:
			'Shifokor hali ish jadvalini e’lon qilmagan. Boshqa xizmatni tanlang yoki klinikaga murojaat qiling.',
		room: 'Klinika shifokorga bo‘sh xona biriktirgach, qabulga yozilish mumkin bo‘ladi.',
		ended: 'Bu xizmat uchun qabul muddati tugagan. Boshqa xizmatni tanlang.',
		invalid:
			'Qabulga yozilish uchun klinika bu xizmat sanalarini tuzatishi kerak.',
		error: 'Qabul sanalarini yuklab bo‘lmadi.',
		retry: 'Qayta urinish',
		help: 'Belgilangan sanalarda bo‘sh qabul vaqti bor. Vaqtlar klinika vaqt zonasida ko‘rsatiladi.',
		doctor: 'Shifokorni ko‘rish',
	},
	KR: {
		title: '날짜 선택',
		previous: '이전 달',
		next: '다음 달',
		loading: '예약 가능한 날짜 확인 중…',
		empty:
			'이번 달에는 예약 가능한 시간이 없습니다. 다른 달이나 서비스를 선택하세요.',
		schedule:
			'의사가 아직 근무 일정을 등록하지 않았습니다. 다른 서비스를 선택하거나 병원에 문의하세요.',
		room: '병원에서 담당 의사에게 이용 가능한 진료실을 배정해야 예약할 수 있습니다.',
		ended: '이 서비스의 예약 기간이 종료되었습니다. 다른 서비스를 선택하세요.',
		invalid: '예약하려면 병원에서 이 서비스의 예약 기간을 수정해야 합니다.',
		error: '예약 가능한 날짜를 불러오지 못했습니다.',
		retry: '다시 시도',
		help: '표시된 날짜에 예약 가능한 시간이 있습니다. 시간은 병원 시간대를 기준으로 표시됩니다.',
		doctor: '의사 보기',
	},
};
export default function BookingDatePicker({
	serviceId,
	doctorId,
	value,
	onChange,
	timeZone,
}: {
	serviceId: string;
	doctorId: string;
	value: string;
	onChange: (date: string) => void;
	timeZone: string;
}) {
	const { language } = usePreferences(),
		text = copy[language];
	const locale =
		language === 'KR' ? 'ko-KR' : language === 'UZ' ? 'uz-UZ' : 'en-US';
	const today = clinicToday(timeZone),
		firstMonth = today.slice(0, 7);
	const [monthOverride, setMonth] = useState('');
	const month =
		monthOverride || (value >= today ? value.slice(0, 7) : firstMonth);
	const availability = useQuery<{
		getAvailableDoctorDates: { dates: string[]; reason: string };
	}>(GET_AVAILABLE_DOCTOR_DATES, {
		variables: { input: { serviceId, doctorId, month } },
		fetchPolicy: 'network-only',
		pollInterval: 60000,
	});
	const available = new Set(
		!availability.loading && !availability.error
			? availability.data?.getAvailableDoctorDates.dates
			: [],
	);
	const first = new Date(`${month}-01T12:00:00Z`),
		count = new Date(
			Date.UTC(first.getUTCFullYear(), first.getUTCMonth() + 1, 0),
		).getUTCDate();
	const shift = (amount: number) => {
		setMonth(
			new Date(
				Date.UTC(first.getUTCFullYear(), first.getUTCMonth() + amount, 1),
			)
				.toISOString()
				.slice(0, 7),
		);
		onChange('');
	};
	const reason = availability.data?.getAvailableDoctorDates.reason;
	const problem =
		reason === 'NO_SCHEDULE'
			? text.schedule
			: reason === 'NO_ROOM'
				? text.room
				: reason === 'SERVICE_ENDED'
					? text.ended
					: reason === 'INVALID_SERVICE_WINDOW'
						? text.invalid
						: text.empty;
	const label = (date: string) =>
		new Intl.DateTimeFormat(locale, {
			timeZone: 'UTC',
			year: 'numeric',
			month: 'long',
			day: 'numeric',
		}).format(new Date(`${date}T12:00:00Z`));
	return (
		<fieldset className={styles.calendar} aria-busy={availability.loading}>
			<legend>{text.title}</legend>
			<div className={styles.heading}>
				<button
					type="button"
					aria-label={text.previous}
					disabled={month <= firstMonth || availability.loading}
					onClick={() => shift(-1)}
				>
					<Icon name="chevron_left" />
				</button>
				<strong>
					{new Intl.DateTimeFormat(locale, {
						month: language === 'UZ' ? '2-digit' : 'long',
						year: 'numeric',
						timeZone: 'UTC',
					}).format(first)}
				</strong>
				<button
					type="button"
					aria-label={text.next}
					disabled={availability.loading}
					onClick={() => shift(1)}
				>
					<Icon name="chevron_right" />
				</button>
			</div>
			<div className={styles.grid}>
				{Array.from({ length: 7 }, (_, n) => (
					<span key={`weekday-${n}`}>
						{new Intl.DateTimeFormat(locale, {
							weekday: 'short',
							timeZone: 'UTC',
						}).format(new Date(Date.UTC(2026, 0, 4 + n)))}
					</span>
				))}
				{Array.from({ length: first.getUTCDay() }, (_, n) => (
					<span key={`space-${n}`} aria-hidden="true" />
				))}
				{Array.from({ length: count }, (_, n) => {
					const date = `${month}-${String(n + 1).padStart(2, '0')}`;
					return (
						<button
							type="button"
							key={date}
							disabled={date < today || !available.has(date)}
							aria-label={label(date)}
							aria-pressed={value === date}
							onClick={() => onChange(date)}
						>
							{n + 1}
						</button>
					);
				})}
			</div>
			{availability.loading ? (
				<p role="status">{text.loading}</p>
			) : availability.error ? (
				<p role="alert">
					{text.error}{' '}
					<button
						type="button"
						onClick={() => void availability.refetch().catch(() => undefined)}
					>
						{text.retry}
					</button>
				</p>
			) : !available.size ? (
				<p role="status">
					{problem}{' '}
					{reason !== 'NO_DATES' && (
						<Link href={`/doctor/${doctorId}`}>{text.doctor}</Link>
					)}
				</p>
			) : (
				<p>{text.help}</p>
			)}
		</fieldset>
	);
}
