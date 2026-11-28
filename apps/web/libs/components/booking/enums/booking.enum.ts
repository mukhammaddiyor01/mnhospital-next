export enum BookingOrderStatus {
	PENDING = 'PENDING',
	CONFIRMED = 'CONFIRMED',
	COMPLETED = 'COMPLETED',
	CANCELLED = 'CANCELLED',
}

export enum PaymentMethod {
	CARD = 'CARD',
	CASH = 'CASH',
	BANK_TRANSFER = 'BANK_TRANSFER',
}

export enum PaymentStatus {
	PENDING = 'PENDING',
	PAID = 'PAID',
	FAILED = 'FAILED',
	REFUNDED = 'REFUNDED',
	CANCELLED = 'CANCELLED',
}
