import { Service } from './types/service';
import { ServiceStatus } from './enums/service.enum';
import { MemberStatus } from '../member/enums/member.enum';

export type BookingOption = Pick<Service, '_id' | 'memberId' | 'departmentId' | 'serviceType' | 'serviceStatus' | 'serviceTitle' | 'serviceName' | 'servicePrice' | 'serviceDuration' | 'serviceDiscountPercent'> & {
	memberData?: { memberStatus?: MemberStatus } | null;
};

// Options are existing services: each keeps its own server-side price and calendar.
export function getBookingOptions(current: BookingOption, candidates: BookingOption[]): BookingOption[] {
	if (current.serviceStatus !== ServiceStatus.ACTIVE || current.memberData?.memberStatus !== MemberStatus.ACTIVE
		|| !Number.isFinite(current.servicePrice) || current.servicePrice < 0) return [];
	const seen = new Set<string>();
	return [current, ...candidates].filter((option) => {
		if (seen.has(option._id) || !/^[a-f\d]{24}$/i.test(option._id)
			|| option.memberId !== current.memberId || option.departmentId !== current.departmentId || option.serviceType !== current.serviceType
			|| option.serviceStatus !== ServiceStatus.ACTIVE || option.memberData?.memberStatus !== MemberStatus.ACTIVE
			|| !Number.isFinite(option.servicePrice) || option.servicePrice < 0) return false;
		seen.add(option._id);
		return true;
	});
}

export const optionBookingHref = (option: BookingOption) => `/appointment?service=${encodeURIComponent(option._id)}`;
