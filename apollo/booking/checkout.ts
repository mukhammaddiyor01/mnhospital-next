import { gql } from '@apollo/client';
const checkoutFields = gql`
	fragment CheckoutFields on BookingCheckout {
		order { _id orderCode bookingOrderStatus bookingOrderCurrency bookingOrderTotalAmount
			bookingOrderItems { serviceId doctorId serviceName servicePrice serviceDuration requestedStartAt appointmentId } }
		payments { _id serviceId doctorId bookingOrderId paymentProvider paymentStatus paymentAmount paymentCurrency testPayment createdAt }
		appointments { _id appointmentCode appointmentStatus startsAt endsAt holdExpiresAt roomId }
	}
`;
export const BOOKING_OPTIONS = gql`query BookingPaymentOptions { getBookingPaymentOptions { onlineMode timeZone currency } }`;
export const CREATE_APPOINTMENT_BOOKING = gql`
	mutation CreateAppointmentBooking($input: AppointmentBookingInput!) {
		createAppointmentBooking(input: $input) { _id orderCode bookingOrderStatus }
	}
`;
export const MY_CHECKOUT = gql`
	query MyBookingCheckout($bookingOrderId: String!) { getMyBookingCheckout(bookingOrderId: $bookingOrderId) { ...CheckoutFields } }
	${checkoutFields}
`;
export const CHOOSE_PAYMENT = gql`
	mutation ChooseBookingPayment($input: BookingCheckoutInput!) { chooseBookingPayment(input: $input) { ...CheckoutFields } }
	${checkoutFields}
`;
export const COMPLETE_TEST_PAYMENT = gql`
	mutation CompleteTestOnlinePayment($input: TestOnlinePaymentInput!) {
		completeTestOnlinePayment(input: $input) { _id paymentStatus testPayment }
	}
`;
