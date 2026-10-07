import Link from 'next/link';
import { useMemo, useState } from 'react';
import { useQuery } from '@apollo/client';
import { operation } from '@/apollo/workspace/operations';
import { MemberType } from '@/libs/components/member/enums/member.enum';
import { DoctorSpecialty } from './catalogEnums';
import ResourcePanel, {
	RecordItem,
	ResourceConfig,
	ResourceField,
} from './ResourcePanel';
import { useWorkspaceText } from './useWorkspaceText';
const availableRooms = operation(
	'query',
	'getAvailableDoctorRooms',
	null,
	'_id roomNumber roomName roomStatus',
);
const doctorDetail = operation(
	'query',
	'getDoctorByAdmin',
	'String',
	'_id docNick docFullName docPhone docMail docAddress docDesc docRoom docSpecialty docExperience memberStatus',
	'doctorId',
);
const receptionDetail = operation(
	'query',
	'getReceptionistByAdmin',
	'String',
	'_id receptionistNick receptionistFullName receptionistPhone receptionistMail receptionistAddress receptionistDesc memberStatus',
	'receptionistId',
);
const doctorStats = operation(
	'query',
	'getDoctorDashboardStatsByAdmin',
	'String',
	'serviceCount patientCount appointmentCount completedAppointmentCount reportCount',
	'doctorId',
);
const receptionStats = operation(
	'query',
	'getReceptionistDashboardStatsByAdmin',
	'String',
	'taskCount pendingTaskCount acceptedTaskCount inProgressTaskCount completedTaskCount cancelledTaskCount',
	'receptionistId',
);
export default function ActorManagement({
	kind,
}: {
	kind: 'doctor' | 'receptionist';
}) {
	const w = useWorkspaceText();
	const [selected, setSelected] = useState<RecordItem | null>(null);
	const doctor = kind === 'doctor';
	const prefix = doctor ? 'doc' : 'receptionist';
	const rooms = useQuery<{
		getAvailableDoctorRooms: { roomNumber: string; roomName?: string }[];
	}>(availableRooms, { skip: !doctor, fetchPolicy: 'network-only' });
	const roomOptions = useMemo(
		() =>
			(rooms.data?.getAvailableDoctorRooms ?? []).map((room) => ({
				value: room.roomNumber,
				label: room.roomName
					? `${room.roomNumber} · ${room.roomName}`
					: room.roomNumber,
			})),
		[rooms.data],
	);
	const arg = doctor ? 'doctorId' : 'receptionistId';
	const detail = useQuery(doctor ? doctorDetail : receptionDetail, {
		variables: { [arg]: selected?._id },
		skip: !selected,
		fetchPolicy: 'network-only',
	});
	const stats = useQuery(doctor ? doctorStats : receptionStats, {
		variables: { [arg]: selected?._id },
		skip: !selected,
		fetchPolicy: 'network-only',
	});
	const config = useMemo<ResourceConfig>(() => {
		const fields: ResourceField[] = [
			{
				name: `${prefix}Nick`,
				label: 'nickname',
				required: true,
				maxLength: 30,
				readonly: true,
			},
			{
				name: `${prefix}FullName`,
				label: 'fullName',
				required: !doctor,
				maxLength: 100,
				readonly: doctor,
			},
			{
				name: `${prefix}Phone`,
				label: 'phone',
				required: true,
				readonly: doctor,
			},
			{
				name: `${prefix}Mail`,
				label: 'email',
				type: 'email',
				required: !doctor,
				readonly: doctor,
			},
			{
				name: `${prefix}Password`,
				label: 'password',
				type: 'password',
				required: true,
				maxLength: 32,
				readonly: true,
			},
			{ name: `${prefix}Address`, label: 'address', readonly: doctor },
			{
				name: `${prefix}Desc`,
				label: 'description',
				type: 'textarea',
				readonly: doctor,
			},
			{
				name: `${prefix}Image`,
				label: 'image',
				readonly: doctor,
				imageTarget: doctor ? 'doctor' : 'receptionist',
			},
			...(doctor
				? ([
						{
							name: 'docRoom',
							label: 'room',
							required: true,
							readonly: true,
							options: roomOptions,
						},
						{
							name: 'docExperience',
							label: 'experience',
							type: 'number',
							required: true,
							min: 0,
							readonly: true,
						},
						{
							name: 'docSpecialty',
							label: 'specialty',
							options: [...DoctorSpecialty],
							readonly: true,
						},
					] as ResourceField[])
				: []),
			{
				name: 'memberStatus',
				label: 'status',
				options: ['ACTIVE', 'BLOCK'],
				defaultValue: 'ACTIVE',
			},
		];
		const selection = doctor
			? '_id docNick docFullName docPhone docMail docRoom docSpecialty docExperience memberStatus'
			: '_id receptionistNick receptionistFullName receptionistPhone receptionistMail receptionistAddress receptionistDesc receptionistImage memberStatus';
		return {
			role: MemberType.ADMIN,
			title: doctor ? 'doctor' : 'receptionist',
			list: operation(
				'query',
				doctor ? 'getDoctorsByAdmin' : 'getReceptionists',
				doctor ? 'AdminDoctorInquiry' : 'ReceptionistInquiry',
				`list { ${selection} } metaCounter { total }`,
			),
			listKey: doctor ? 'getDoctorsByAdmin' : 'getReceptionists',
			columns: [fields[0], fields[1], fields[2], fields[fields.length - 1]],
			fields,
			onSelect: setSelected,
			onSaved: doctor
				? async () => {
						await rooms.refetch().catch(() => undefined);
					}
				: undefined,
			create:
				doctor && (rooms.loading || rooms.error || !roomOptions.length)
					? undefined
					: operation(
							'mutation',
							doctor ? 'createDoctorByAdmin' : 'createReceptionist',
							doctor ? 'DoctorInput' : 'ReceptionistInput',
							'_id',
						),
			createVariables: (input) => {
				const { memberStatus, ...rest } = input;
				return { input: rest };
			},
			update: operation(
				'mutation',
				doctor ? 'updateDoctorStatusByAdmin' : 'updateReceptionistByAdmin',
				doctor ? 'DoctorStatusUpdateInput' : 'ReceptionistAdminUpdateInput',
				'_id memberStatus',
			),
			updateVariables: (input, r) => ({
				input: doctor
					? { _id: r._id, memberStatus: input.memberStatus }
					: {
							_id: r._id,
							...Object.fromEntries(
								Object.entries(input).filter(
									([key]) =>
										key !== 'receptionistPassword' &&
										key !== 'receptionistNick',
								),
							),
						},
			}),
			remove: doctor
				? operation(
						'mutation',
						'updateDoctorStatusByAdmin',
						'DoctorStatusUpdateInput',
						'_id',
					)
				: operation(
						'mutation',
						'removeReceptionistByAdmin',
						'String',
						'_id',
						'receptionistId',
					),
			removeVariables: (r) =>
				doctor
					? { input: { _id: r._id, memberStatus: 'DELETE' } }
					: { receptionistId: r._id },
			canEdit: (r) => r.memberStatus !== 'DELETE',
			canRemove: (r) => r.memberStatus !== 'DELETE',
			search: true,
		};
	}, [doctor, prefix, roomOptions, rooms.loading, rooms.error, rooms.refetch]);
	const record =
		detail.data?.[doctor ? 'getDoctorByAdmin' : 'getReceptionistByAdmin'];
	const metrics =
		stats.data?.[
			doctor
				? 'getDoctorDashboardStatsByAdmin'
				: 'getReceptionistDashboardStatsByAdmin'
		];
	return (
		<>
			{doctor && (
				<section className="clinical-staff-panel clinical-resource-panel">
					<button
						type="button"
						onClick={() => void rooms.refetch().catch(() => undefined)}
						disabled={rooms.loading}
					>
						{w('refresh')} · {w('room')}
					</button>
					{rooms.loading && <p role="status">{w('roomsLoading')}</p>}
					{rooms.error && <p role="alert">{w('roomsUnavailable')}</p>}
					{!rooms.loading && !rooms.error && !roomOptions.length && (
						<p>
							{w('noAvailableRooms')}{' '}
							<Link href="/admin/rooms">{w('room')}</Link>
						</p>
					)}
				</section>
			)}
			<ResourcePanel config={config} />
			{selected && (
				<section className="clinical-staff-panel clinical-admin-resource clinical-resource-panel">
					<header>
						<h2>{w('details')}</h2>
						<button onClick={() => setSelected(null)}>{w('cancel')}</button>
					</header>
					{detail.error && <p role="alert">{detail.error.message}</p>}
					{stats.error && <p role="alert">{stats.error.message}</p>}
					{record && (
						<dl>
							{config.fields
								?.filter((field) => !field.name.includes('Password'))
								.map((field) => (
									<div key={field.name}>
										<dt>{w(field.label)}</dt>
										<dd>{String(record[field.name] ?? '—')}</dd>
									</div>
								))}
						</dl>
					)}
					{metrics && (
						<dl>
							{Object.entries(metrics)
								.filter(([key]) => key !== '__typename')
								.map(([key, value]) => (
									<div key={key}>
										<dt>
											{key.replace(/Count$/, '').replace(/([A-Z])/g, ' $1')}
										</dt>
										<dd>{String(value)}</dd>
									</div>
								))}
						</dl>
					)}
				</section>
			)}
		</>
	);
}
