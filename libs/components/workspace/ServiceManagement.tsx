import { useMemo } from 'react';
import { gql, useQuery, useReactiveVar } from '@apollo/client';
import { userVar } from '@/apollo/store';
import { operation } from '@/apollo/workspace/operations';
import { MemberType } from '@/libs/components/member/enums/member.enum';
import ResourcePanel, { ResourceConfig, ResourceField } from './ResourcePanel';
import { ServiceRoom, ServiceRoomName, ServiceType } from './catalogEnums';
import { useServiceTypeLabel } from '@/libs/i18n/useServiceTypeLabel';
import { useWorkspaceText } from './useWorkspaceText';
const MY_SERVICE_TYPES = gql`query GetMyDoctorServiceTypes { getMyDoctorServiceTypes }`;
const DEPARTMENTS = operation(
	'query',
	'getDepartments',
	null,
	'_id departmentName departmentStatus',
);
const selection =
	'list { _id departmentId serviceName serviceTitle serviceType serviceStatus servicePrice serviceRoom serviceRoomName serviceImages serviceDesc serviceDuration availabilityDates openedAt closedAt } metaCounter { total }';
const doctorList = operation(
	'query',
	'getDoctorServices',
	'DoctorServicesInquiry',
	selection,
);
const adminList = operation(
	'mutation',
	'getAllServicesByAdmin',
	'ServicesInquiry',
	selection,
);
const create = operation('mutation', 'createService', 'ServiceInput', '_id');
const doctorUpdate = operation(
	'mutation',
	'updateService',
	'ServiceUpdate',
	'_id',
);
const adminUpdate = operation(
	'mutation',
	'updateServiceByAdmin',
	'ServiceUpdate',
	'_id',
);
const adminRemove = operation(
	'mutation',
	'removeServiceByAdmin',
	'String',
	'_id',
	'serviceId',
);
export default function ServiceManagement({
	role,
}: {
	role: MemberType.ADMIN | MemberType.DOCTOR;
}) {
	const session = useReactiveVar(userVar);
	const w = useWorkspaceText();
	const typeLabel = useServiceTypeLabel();
	const types = useQuery<{ getMyDoctorServiceTypes: string[] }>(MY_SERVICE_TYPES, {
		skip: !session._id || session.memberType !== MemberType.DOCTOR || role !== MemberType.DOCTOR,
		fetchPolicy: 'network-only',
	});
	const { data, error } = useQuery(DEPARTMENTS, {
		skip: !session._id || session.memberType !== role,
	});
	const config = useMemo<ResourceConfig>(() => {
		const fields: ResourceField[] = [
			{ name: 'serviceName', label: 'name', required: true, maxLength: 100 },
			{ name: 'serviceTitle', label: 'title', required: true, maxLength: 150 },
			{
				name: 'serviceType',
				label: 'type',
				required: true,
				options: (role === MemberType.ADMIN ? [...ServiceType] : (types.data?.getMyDoctorServiceTypes ?? []))
					.map((value) => ({ value, label: typeLabel(value) })),
			},
			{
				name: 'departmentId',
				label: 'department',
				required: true,
				options: (data?.getDepartments ?? [])
					.filter((d: any) => d.departmentStatus === 'ACTIVE')
					.map((d: any) => ({ value: d._id, label: d.departmentName })),
			},
			{
				name: 'serviceRoomName',
				label: 'roomName',
				required: true,
				options: [...ServiceRoomName],
			},
			{
				name: 'serviceRoom',
				label: 'room',
				required: true,
				options: [...ServiceRoom],
			},
			{
				name: 'servicePrice',
				label: 'price',
				type: 'number',
				min: 0,
				step: '0.01',
				required: true,
			},
			{
				name: 'serviceDuration',
				label: 'duration',
				required: true,
				maxLength: 50,
			},
			{
				name: 'serviceDesc',
				label: 'description',
				type: 'textarea',
				required: true,
				maxLength: 2000,
			},
			{
				name: 'serviceImages',
				label: 'images',
				type: 'array',
				required: true,
				imageTarget: 'service',
			},
			{ name: 'availabilityDates', label: 'schedule', type: 'calendar-dates', defaultValue: [] },
			{ name: 'openedAt', label: 'start', type: 'datetime-local' },
			{ name: 'closedAt', label: 'end', type: 'datetime-local' },
			{
				name: 'serviceStatus',
				label: 'status',
				options: ['ACTIVE', 'INACTIVE', 'UNAVAILABLE'],
				defaultValue: 'ACTIVE',
			},
		];
		return {
			role,
			title: 'service',
			list: role === MemberType.ADMIN ? adminList : doctorList,
			listKey:
				role === MemberType.ADMIN
					? 'getAllServicesByAdmin'
					: 'getDoctorServices',
			mutationList: role === MemberType.ADMIN,
			variables: (page) => ({
				input: {
					page,
					limit: 10,
					...(role === MemberType.ADMIN ? { search: {} } : {}),
				},
			}),
			columns: [fields[0], fields[2], fields[6], fields.find(field => field.name === 'serviceStatus')!, fields.find(field => field.name === 'availabilityDates')!],
			fields,
			create: role === MemberType.DOCTOR ? create : undefined,
			createDisabled: role === MemberType.DOCTOR && (types.loading || Boolean(types.error) || !types.data?.getMyDoctorServiceTypes.length),
			createDisabledReason: 'specialtyServicesHelp',
			update: role === MemberType.ADMIN ? adminUpdate : doctorUpdate,
			remove: role === MemberType.ADMIN ? adminRemove : doctorUpdate,
			removeVariables: (r) =>
				role === MemberType.ADMIN
					? { serviceId: r._id }
					: { input: { _id: r._id, serviceStatus: 'DELETED' } },
			canEdit: (r) =>
				role === MemberType.ADMIN
					? r.serviceStatus !== 'DELETED'
					: r.serviceStatus === 'ACTIVE',
			canRemove: (r) =>
				role === MemberType.ADMIN
					? r.serviceStatus !== 'DELETED'
					: r.serviceStatus === 'ACTIVE',
			search: true,
		};
	}, [role, data, types.data, types.loading, types.error, typeLabel]);
	return (
		<>
			<p>{w('specialtyServicesHelp')}</p>
			{role === MemberType.DOCTOR && <button type="button" disabled={types.loading} onClick={() => void types.refetch().catch(() => undefined)}>{w('refresh')} · {w('specialty')}</button>}
			{types.error && <p role="alert" className="clinical-form-error">{types.error.message}</p>}
			{error && (
				<p role="alert" className="clinical-form-error">
					{error.message}
				</p>
			)}
			<ResourcePanel config={config} />
		</>
	);
}
