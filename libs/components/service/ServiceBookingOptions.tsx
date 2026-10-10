import { servicePriceForDisplay } from './service-price';
import Link from 'next/link';
import { BookingOption, optionBookingHref } from './bookingOptions';
import { formatMoney } from '../common/currency';
import { usePreferences } from '../preference/PreferenceProvider';
import styles from './ServiceBookingOptions.module.scss';

const copy = {
	EN: {
		title: 'Select an option',
		standard: 'Standard',
		save: 'Save',
		includes: 'Includes',
		minutes: 'min',
		booking: 'Book appointment',
		loading: 'Loading available options…',
		failed: 'Other options could not be loaded.',
		retry: 'Try again',
		selected: 'Selected option',
	},
	UZ: {
		title: 'Xizmat variantini tanlang',
		standard: 'Standart',
		save: 'Tejaysiz',
		includes: 'Paket tarkibi',
		minutes: 'daqiqa',
		booking: 'Qabulga yozilish',
		loading: 'Mavjud variantlar yuklanmoqda…',
		failed: 'Boshqa variantlarni yuklab bo‘lmadi.',
		retry: 'Qayta urinish',
		selected: 'Tanlangan variant',
	},
	KR: {
		title: '옵션 선택',
		standard: '기본',
		save: '절약',
		includes: '포함 서비스',
		minutes: '분',
		booking: '진료 예약',
		loading: '예약 옵션을 불러오는 중…',
		failed: '다른 옵션을 불러오지 못했습니다.',
		retry: '다시 시도',
		selected: '선택한 옵션',
	},
};

export default function ServiceBookingOptions({
	options,
	selected,
	baseId,
	currency,
	loading,
	failed,
	onChange,
	onRetry,
	preview = false,
}: {
	options: BookingOption[]; selected: BookingOption; baseId: string; currency: string;
	loading: boolean; failed: boolean; onChange: (id: string) => void; onRetry: () => void; preview?: boolean;
}) {
	const { language } = usePreferences();
	const text = copy[language];
	return (
		<section className={styles.section}>
			<fieldset className={styles.options}>
				<legend>{text.title}</legend>
				{options.map((option) => (
					<label className={styles.option} data-selected={selected._id === option._id} key={option._id}>
						<input type="radio" name={`service-option-${baseId}`} value={option._id} checked={selected._id === option._id} onChange={() => onChange(option._id)} />
						<span className={styles.description}>
							<strong>
								{option._id === baseId
									? text.standard
									: option.packageItems
											?.map((item) => item.title)
											.join(' + ') ||
										option.serviceTitle ||
										option.serviceName}
							</strong>
							<small>
								{option._id === baseId && (
									<span>{option.serviceTitle || option.serviceName}</span>
								)}
								{option.packageRegularPrice &&
								option.packageRegularPrice >
									servicePriceForDisplay(option, currency) ? (
									<span className={styles.saving}>
										{text.save}{' '}
										{formatMoney(
											option.packageRegularPrice -
												servicePriceForDisplay(option, currency),
											currency,
										)}
									</span>
								) : null}
								{option.serviceDuration && (
									<span>
										{option.serviceDuration} {text.minutes}
									</span>
								)}
							</small>
						</span>
						<span className={styles.price}>
							{option.packageRegularPrice &&
							option.packageRegularPrice >
								servicePriceForDisplay(option, currency) ? (
								<small>
									<s>{formatMoney(option.packageRegularPrice, currency)}</s>
								</small>
							) : null}
							{(option.serviceDiscountPercent ?? 0) > 0 && (
								<small>
									<s>{formatMoney(option.servicePrice, currency)}</s> (−
									{option.serviceDiscountPercent}%)
								</small>
							)}
							{formatMoney(servicePriceForDisplay(option, currency), currency)}
						</span>
					</label>
				))}
			</fieldset>
			{loading && (
				<p className={styles.status} role="status">
					{text.loading}
				</p>
			)}
			{failed && (
				<p className={styles.status} role="alert">
					{text.failed}{' '}
					<button type="button" onClick={onRetry}>
						{text.retry}
					</button>
				</p>
			)}
			<div className={styles.summary}>
				<div className={styles.total} aria-live="polite" aria-atomic="true">
					<span>
						<small>{text.selected}</small>
						<strong>{selected.serviceTitle || selected.serviceName}</strong>
					</span>
					<b>
						{formatMoney(servicePriceForDisplay(selected, currency), currency)}
					</b>
				</div>
				{!preview && (
					<Link className={styles.book} href={optionBookingHref(selected)}>
						{text.booking}
					</Link>
				)}
			</div>
		</section>
	);
}
