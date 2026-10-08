import { useQuery } from '@apollo/client';
import { BOOKING_OPTIONS } from '@/apollo/booking/checkout';
export function useClinicSettings() {
	const options = useQuery<{ getBookingPaymentOptions: { timeZone: string; currency: string; onlineMode: string } }>(BOOKING_OPTIONS);
	return { timeZone: options.data?.getBookingPaymentOptions.timeZone || 'Asia/Tashkent', currency: options.data?.getBookingPaymentOptions.currency || 'UZS' };
}
