import { BookingOrderStatus, PaymentMethod, PaymentStatus } from '../enums/booking.enum';

export interface AppointmentDraft {
	serviceId: string;
	doctorId: string;
	date: string;
	startsAt: string;
	patientNote: string;
}

export interface BookingOrder {
	_id: string;
	orderCode: string;
	bookingOrderStatus: BookingOrderStatus;
	bookingOrderItems: Array<{
		serviceId: string;
		doctorId: string;
		serviceName: string;
		servicePrice: string;
		serviceDuration: string;
		requestedStartAt: string;
	}>;
	bookingOrderTotalAmount: number;
	bookingOrderCurrency: string;
	createdAt: string;
}

export interface Payment {
	_id: string;
	bookingOrderId: string;
	paymentMethod: PaymentMethod;
	paymentStatus: PaymentStatus;
	paymentAmount: number;
}
