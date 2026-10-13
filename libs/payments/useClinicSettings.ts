import { useQuery } from '@apollo/client';
import { BOOKING_OPTIONS } from '@/apollo/booking/checkout';
export function useClinicSettings() {
	const options = useQuery<{ getBookingPaymentOptions: { timeZone: string; currency: string; onlineMode: string } }>(BOOKING_OPTIONS);
	return { timeZone: options.data?.getBookingPaymentOptions.timeZone || process.env.NEXT_PUBLIC_CLINIC_TIME_ZONE || 'Asia/Seoul', currency: options.data?.getBookingPaymentOptions.currency || process.env.NEXT_PUBLIC_CLINIC_CURRENCY || 'KRW' };
}
