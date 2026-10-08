export const CLINIC_TIME_ZONE = 'Asia/Tashkent';
export const clinicToday = (timeZone = CLINIC_TIME_ZONE) => {
	const parts = new Intl.DateTimeFormat('en-CA', { timeZone, year: 'numeric', month: '2-digit', day: '2-digit' }).formatToParts(new Date());
	const part = (type: string) => parts.find((entry) => entry.type === type)?.value || '';
	return `${part('year')}-${part('month')}-${part('day')}`;
};
export const clinicDateTime = (date: string, locale = 'en-US', timeZone = CLINIC_TIME_ZONE) => new Intl.DateTimeFormat(locale, {
	timeZone, dateStyle: 'medium', timeStyle: 'short',
}).format(new Date(date));
export interface CheckoutState {
	order: { _id: string; orderCode: string; bookingOrderStatus: string; bookingOrderCurrency: string; bookingOrderTotalAmount: number;
		bookingOrderItems: Array<{ serviceId: string; doctorId: string; serviceName: string; servicePrice: string; serviceDuration: string; requestedStartAt: string; appointmentId?: string }> };
	payments: Array<{ _id: string; serviceId: string; doctorId: string; bookingOrderId: string; paymentProvider: string; paymentStatus: string; paymentAmount: number; paymentCurrency: string; testPayment: boolean; createdAt: string }>;
	appointments: Array<{ _id: string; appointmentCode: string; appointmentStatus: string; startsAt: string; endsAt: string; holdExpiresAt?: string; roomId: string }>;
}
