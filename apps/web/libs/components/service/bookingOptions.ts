import { Service } from './types/service';
import { ServiceStatus } from './enums/service.enum';
import { MemberStatus } from '../member/enums/member.enum';

export type BookingOption = Pick<
	Service,
	| '_id'
	| 'memberId'
	| 'departmentId'
	| 'serviceType'
	| 'serviceStatus'
	| 'serviceTitle'
	| 'serviceName'
	| 'servicePrice'
	| 'serviceDuration'
	| 'serviceDiscountPercent'
	| 'packageBaseServiceId'
	| 'packageRegularPrice'
	| 'packageItems'
> & {
	memberData?: { memberStatus?: MemberStatus } | null;
};

// A package is an explicitly linked service with a total price and combined appointment duration.
export function getBookingOptions(
	current: BookingOption,
	candidates: BookingOption[],
): BookingOption[] {
	if (current.serviceStatus !== ServiceStatus.ACTIVE || current.memberData?.memberStatus !== MemberStatus.ACTIVE
		|| !Number.isFinite(current.servicePrice) || current.servicePrice < 0) return [];
	const rootId = current.packageBaseServiceId || current._id;
	const seen = new Set<string>();
	return [
		...candidates.filter((row) => row._id === rootId),
		current,
		...candidates,
	].filter((option) => {
		if (
			seen.has(option._id) || !/^[a-f\d]{24}$/i.test(option._id)
			|| option.memberId !== current.memberId ||
			(option._id !== rootId &&
				(option.packageBaseServiceId !== rootId ||
					(option.packageItems?.length ?? 0) < 2)) ||
			option.serviceStatus !== ServiceStatus.ACTIVE ||
			option.memberData?.memberStatus !== MemberStatus.ACTIVE ||
			!Number.isFinite(option.servicePrice) ||
			option.servicePrice < 0
		)
			return false;
		seen.add(option._id);
		return true;
	});
}

export const optionBookingHref = (option: BookingOption) => `/appointment?service=${encodeURIComponent(option._id)}`;
