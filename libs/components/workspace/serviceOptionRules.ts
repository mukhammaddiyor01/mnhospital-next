import { ServiceStatus } from '../service/enums/service.enum';

export type OptionIdentity = {
	_id: string;
	memberId: string;
	departmentId: string;
	serviceType: string;
	serviceStatus: ServiceStatus;
	packageBaseServiceId?: string | null;
};
// Creation capacity belongs to a doctor/category; booking choices additionally share a department.
export function getOptionScope<T extends OptionIdentity>(
	base: T | null,
	rows: T[],
) {
	const category = base
		? rows.filter(
				(row) =>
					row.memberId === base.memberId &&
					row.serviceType === base.serviceType &&
					row.serviceStatus !== ServiceStatus.DELETED,
			)
		: [];
	return {
		capacity: category.length,
		base: category.find((row) => row._id === base?._id) ?? base,
		variants: category.filter(
			(row) => row._id === base?._id || row.packageBaseServiceId === base?._id,
		),
	};
}
export function isValidOptionDraft(
	draft: {
		serviceTitle: string;
		servicePrice: string;
		serviceDuration: string;
		serviceDesc: string;
	},
	currency: string,
) {
	const price = Number(draft.servicePrice),
		duration = Number(draft.serviceDuration);
	return (
		draft.serviceTitle.trim().length >= 2 &&
		draft.serviceTitle.trim().length <= 150 &&
		draft.serviceDesc.trim().length > 0 &&
		draft.serviceDesc.trim().length <= 2000 &&
		Boolean(draft.servicePrice.trim()) &&
		Number.isFinite(price) &&
		price >= 0 &&
		price <= 1e9 &&
		(currency === 'KRW'
			? Number.isInteger(price)
			: Math.abs(price * 100 - Math.round(price * 100)) < 1e-5) &&
		Number.isInteger(duration) &&
		duration >= 1 &&
		duration <= 1440
	);
}
