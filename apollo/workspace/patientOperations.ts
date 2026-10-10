import { gql } from '@apollo/client';
import { operation } from './operations';
import {
	bookingSelection,
	paymentSelection,
	appointmentSelection,
} from '@/libs/components/workspace/adminResources';
export const PATIENT_ORDERS = operation(
	'query',
	'getMyBookingOrders',
	'BookingOrderInquiry',
	bookingSelection,
);
export const PATIENT_ORDER = operation(
	'query',
	'getMyBookingOrder',
	'String',
	bookingSelection
		.replace(/^list \{ /, '')
		.replace(/ \} metaCounter \{ total \}$/, ''),
	'bookingOrderId',
);
export const CANCEL_ORDER = operation(
	'mutation',
	'cancelBookingOrder',
	'String',
	'_id bookingOrderStatus',
	'bookingOrderId',
);
export const MY_CART = operation(
	'query',
	'getMyCart',
	null,
	'_id cartStatus currency totalAmount items { _id serviceName serviceId doctorId servicePrice serviceDuration requestedStartAt patientNote }',
);
export const CREATE_CART = operation(
	'mutation',
	'createCart',
	'CartInput',
	'_id',
);
export const REMOVE_CART_ITEM = operation(
	'mutation',
	'removeCartItem',
	'String',
	'_id',
	'cartItemId',
);
export const MY_PAYMENTS = operation(
	'query',
	'getMyPayments',
	'PaymentInquiry',
	paymentSelection,
);
export const MY_PAYMENT = operation(
	'query',
	'getMyPayment',
	'String',
	'_id bookingOrderId paymentAmount paymentCurrency paymentStatus paymentMethod paymentProvider testPayment paidAt refundedAt',
	'paymentId',
);
export const CREATE_PAYMENT = operation(
	'mutation',
	'createPayment',
	'PaymentInput',
	'_id paymentAmount paymentCurrency paymentStatus',
);
export const PREPARE_EXIMBAY = operation(
	'mutation',
	'prepareEximbayPayment',
	'EximbayPrepareInput',
	'fgkey payment { transaction_type order_id currency amount lang } merchant { mid } buyer { name email } url { return_url status_url } settings { display_type }',
);
export const MY_APPOINTMENTS = operation(
	'query',
	'getMyAppointments',
	'AppointmentInquiry',
	appointmentSelection,
);
export const CANCEL_APPOINTMENT = operation(
	'mutation',
	'cancelAppointment',
	'String',
	'_id appointmentStatus',
	'appointmentId',
);
export const CREATE_APPOINTMENT = operation(
	'mutation',
	'createAppointment',
	'AppointmentInput',
	'_id appointmentCode appointmentStatus',
);
export const MY_REPORTS = operation(
	'query',
	'getMyPatientReports',
	'DoctorReportInquiry',
	'list { _id appointmentId appointmentCode serviceName visitAt docReportDiagnosis docReportSymptoms docReportMedication docReportFollowUp docReportFollowUpDate createdAt } metaCounter { total }',
);
export const MY_REPORT = operation(
	'query',
	'getMyPatientReport',
	'String',
	'_id docReportDiagnosis docReportSymptoms docReportObservations docReportRecommendation docReportMedication docReportFollowUp docReportFollowUpDate createdAt',
	'reportId',
);
export const ROOMS = operation(
	'query',
	'getRooms',
	null,
	'_id roomNumber roomName roomStatus',
);
