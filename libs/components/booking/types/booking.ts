import { BookingOrderStatus, PaymentMethod, PaymentStatus } from '../enums/booking.enum';

export interface BookingOrderInput {
	serviceId: string;
	doctorId: string;
	bookingDate: string;
	bookingTime: string;
	patientName: string;
	patientPhone: string;
	reason?: string;
}

export interface BookingOrder {
	_id: string;
	status: BookingOrderStatus;
	serviceId: string;
	doctorId: string;
	bookingDate: string;
	bookingTime: string;
	patientName: string;
	patientPhone: string;
	totalPrice: number;
	createdAt: string;
}

export interface Payment {
	_id: string;
	bookingOrderId: string;
	method: PaymentMethod;
	status: PaymentStatus;
	amount: number;
}
