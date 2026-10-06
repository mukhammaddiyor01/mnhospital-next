import { operation } from '@/apollo/workspace/operations';
import { MemberType } from '@/libs/components/member/enums/member.enum';
import { ResourceConfig, ResourceField } from './ResourcePanel';
const statuses = ['ACTIVE', 'BLOCK', 'DELETE'];
export const patients: ResourceConfig = {
	role: MemberType.ADMIN,
	title: 'patients',
	list: operation(
		'query',
		'getPatientsByAdmin',
		'AdminPatientInquiry',
		'list { _id memberId patientFullName patientBirthDate patientGender patientBloodType patientAddress memberStatus } metaCounter { total }',
	),
	listKey: 'getPatientsByAdmin',
	columns: [
		{ name: 'patientFullName', label: 'fullName' },
		{ name: 'patientBirthDate', label: 'date' },
		{ name: 'memberStatus', label: 'status' },
	],
	fields: [
		{
			name: 'memberStatus',
			label: 'status',
			required: true,
			options: statuses,
		},
	],
	update: operation(
		'mutation',
		'updatePatientStatusByAdmin',
		'PatientStatusUpdateInput',
		'_id memberStatus',
	),
	canEdit: (r) => r.memberStatus !== 'DELETE',
	search: true,
};
const memberFields: ResourceField[] = [
	{ name: 'memberNick', label: 'nickname', maxLength: 30 },
	{ name: 'memberFullName', label: 'fullName', maxLength: 100 },
	{ name: 'memberPhone', label: 'phone' },
	{ name: 'memberMail', label: 'email', type: 'email' },
	{ name: 'memberDesc', label: 'description', type: 'textarea' },
	{ name: 'memberStatus', label: 'status', options: statuses },
];
export const accounts: ResourceConfig = {
	role: MemberType.ADMIN,
	title: 'accounts',
	list: operation(
		'mutation',
		'getAllMembersByAdmin',
		'MembersInquiry',
		'list { _id memberNick memberFullName memberPhone memberMail memberDesc memberStatus } metaCounter { total }',
	),
	listKey: 'getAllMembersByAdmin',
	mutationList: true,
	variables: (page) => ({
		input: { page, limit: 10, search: { memberType: 'PATIENT' } },
	}),
	columns: [memberFields[0], memberFields[1], memberFields[2], memberFields[5]],
	fields: memberFields,
	update: operation(
		'mutation',
		'updateMemberByAdmin',
		'MemberUpdate',
		'_id memberStatus',
	),
	canEdit: (r) => r.memberStatus !== 'DELETE',
	search: true,
};
export const bookingSelection =
	'list { _id patientId orderCode bookingOrderStatus bookingOrderCurrency bookingOrderTotalAmount bookingOrderItems { serviceId doctorId serviceName servicePrice serviceDuration requestedStartAt appointmentId } } metaCounter { total }';
export const bookings = (
	role: MemberType.ADMIN | MemberType.RECEPTIONIST,
): ResourceConfig => ({
	role,
	title: 'bookings',
	list: operation(
		'query',
		'getBookingOrders',
		'StaffBookingOrderInquiry',
		bookingSelection,
	),
	listKey: 'getBookingOrders',
	columns: [
		{ name: 'orderCode', label: 'code' },
		{ name: 'bookingOrderStatus', label: 'status' },
		{ name: 'bookingOrderTotalAmount', label: 'total' },
		{ name: 'bookingOrderCurrency', label: 'currency' },
	],
	search: true,
});
export const paymentSelection =
	'list { _id bookingOrderId paymentAmount paymentCurrency paymentProvider paymentMethod paymentStatus createdAt } metaCounter { total }';
export const payments = (
	role: MemberType.ADMIN | MemberType.RECEPTIONIST,
): ResourceConfig => ({
	role,
	title: 'payments',
	list: operation('query', 'getPayments', 'PaymentInquiry', paymentSelection),
	listKey: 'getPayments',
	columns: [
		{ name: 'createdAt', label: 'date' },
		{ name: 'paymentAmount', label: 'total' },
		{ name: 'paymentCurrency', label: 'currency' },
		{ name: 'paymentProvider', label: 'provider' },
		{ name: 'paymentStatus', label: 'status' },
	],
	search: true,
});
export const appointmentSelection =
	'list { _id appointmentCode appointmentStatus appointmentReason appointmentDesc appointmentType patientId doctorId serviceId startsAt endsAt roomId bookingOrderId } metaCounter { total }';
export const appointments: ResourceConfig = {
	role: MemberType.ADMIN,
	title: 'appointment',
	list: operation(
		'query',
		'getAppointments',
		'StaffAppointmentInquiry',
		appointmentSelection,
	),
	listKey: 'getAppointments',
	columns: [
		{ name: 'appointmentCode', label: 'code' },
		{ name: 'startsAt', label: 'start' },
		{ name: 'endsAt', label: 'end' },
		{ name: 'appointmentStatus', label: 'status' },
	],
	search: true,
};
