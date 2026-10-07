import { operation } from '@/apollo/workspace/operations';
import { MemberType } from '@/libs/components/member/enums/member.enum';
import { ResourceConfig } from './ResourcePanel';
export const doctorBookings: ResourceConfig = {
	role: MemberType.DOCTOR,
	title: 'bookings',
	list: operation('query', 'getMyDoctorBookingRequests', 'BookingOrderInquiry',
		'list { _id bookingOrderId orderCode bookingOrderStatus serviceId serviceName serviceDuration requestedStartAt appointmentId } metaCounter { total }'),
	listKey: 'getMyDoctorBookingRequests',
	columns: [
		{ name: 'orderCode', label: 'code' },
		{ name: 'serviceName', label: 'service' },
		{ name: 'requestedStartAt', label: 'start' },
		{ name: 'serviceDuration', label: 'duration' },
		{ name: 'bookingOrderStatus', label: 'status' },
	],
	search: true,
};
export const departments: ResourceConfig = {
	role: MemberType.DOCTOR,
	title: 'departments',
	list: operation(
		'query',
		'getDepartments',
		null,
		'_id departmentName departmentTitle departmentStatus departmentDesc departmentImage',
	),
	listKey: 'getDepartments',
	arrayResult: true,
	variables: () => ({}),
	columns: [
		{ name: 'departmentName', label: 'name' },
		{ name: 'departmentTitle', label: 'title' },
		{ name: 'departmentStatus', label: 'status' },
	],
	fields: [
		{ name: 'departmentName', label: 'name', required: true, maxLength: 100 },
		{ name: 'departmentTitle', label: 'title', maxLength: 150 },
		{ name: 'departmentDesc', label: 'description', type: 'textarea' },
		{ name: 'departmentImage', label: 'image', imageTarget: 'department' },
		{
			name: 'departmentStatus',
			label: 'status',
			options: ['ACTIVE', 'INACTIVE'],
			defaultValue: 'ACTIVE',
		},
	],
	create: operation('mutation', 'createDepartment', 'DepartmentInput', '_id'),
	search: true,
};
export const doctorSchedule = (doctorId: string): ResourceConfig => ({
	role: MemberType.DOCTOR,
	title: 'schedule',
	list: operation(
		'query',
		'getDoctorSchedules',
		'String',
		'_id weekday startTime endTime breakStart breakEnd slotDurationMinutes isActive',
		'doctorId',
	),
	listKey: 'getDoctorSchedules',
	arrayResult: true,
	variables: () => ({ doctorId }),
	columns: [
		{ name: 'weekday', label: 'weekday' },
		{ name: 'startTime', label: 'start' },
		{ name: 'endTime', label: 'end' },
		{ name: 'isActive', label: 'active' },
	],
	fields: [
		{
			name: 'weekday',
			label: 'weekday',
			options: [
				'MONDAY',
				'TUESDAY',
				'WEDNESDAY',
				'THURSDAY',
				'FRIDAY',
				'SATURDAY',
				'SUNDAY',
			],
			required: true,
		},
		{ name: 'startTime', label: 'start', type: 'time', required: true },
		{ name: 'endTime', label: 'end', type: 'time', required: true },
		{ name: 'breakStart', label: 'breakStart', type: 'time' },
		{ name: 'breakEnd', label: 'breakEnd', type: 'time' },
		{
			name: 'slotDurationMinutes',
			label: 'slot',
			type: 'number',
			min: 1,
			max: 1440,
			required: true,
		},
		{ name: 'isActive', label: 'active', type: 'checkbox', defaultValue: true },
	],
	create: operation(
		'mutation',
		'upsertMyDoctorSchedule',
		'DoctorScheduleInput',
		'_id',
	),
	update: operation(
		'mutation',
		'upsertMyDoctorSchedule',
		'DoctorScheduleInput',
		'_id',
	),
	updateVariables: (input) => ({ input }),
});
