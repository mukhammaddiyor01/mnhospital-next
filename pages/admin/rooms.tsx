import { gql } from '@apollo/client';
import { operation } from '@/apollo/workspace/operations';
import WorkspacePage from '@/libs/components/workspace/WorkspacePage';
import ResourcePanel, {
	ResourceConfig,
} from '@/libs/components/workspace/ResourcePanel';
import { MemberType } from '@/libs/components/member/enums/member.enum';
import { useWorkspaceText } from '@/libs/components/workspace/useWorkspaceText';
const config: ResourceConfig = {
	role: MemberType.ADMIN,
	title: 'room',
	list: operation(
		'query',
		'getRooms',
		null,
		'_id roomNumber roomName roomType roomStatus floor',
	),
	listKey: 'getRooms',
	arrayResult: true,
	variables: () => ({}),
	columns: [
		{ name: 'roomNumber', label: 'code' },
		{ name: 'roomName', label: 'name' },
		{ name: 'roomType', label: 'type' },
		{ name: 'roomStatus', label: 'status' },
	],
	fields: [
		{ name: 'roomNumber', label: 'code', required: true, maxLength: 30 },
		{ name: 'roomName', label: 'name', maxLength: 100 },
		{
			name: 'roomType',
			label: 'type',
			required: true,
			options: [
				'CONSULTATION',
				'PROCEDURE',
				'OPERATING',
				'LABORATORY',
				'WAITING',
			],
		},
		{
			name: 'roomStatus',
			label: 'status',
			options: ['AVAILABLE', 'OCCUPIED', 'MAINTENANCE', 'INACTIVE'],
			defaultValue: 'AVAILABLE',
		},
		{ name: 'floor', label: 'room', type: 'number', min: 0, step: '1' },
	],
	create: operation('mutation', 'createRoom', 'HospitalRoomInput', '_id'),
	update: gql`
		mutation WorkspaceUpdateRoom($roomId: String!, $input: HospitalRoomInput!) {
			updateRoom(roomId: $roomId, input: $input) {
				_id
			}
		}
	`,
	updateVariables: (input, r) => ({ roomId: r._id, input }),
	search: true,
};
export default function Page() {
	const w = useWorkspaceText();
	return (
		<WorkspacePage role={MemberType.ADMIN} title={w('room')}>
			<ResourcePanel config={config} />
		</WorkspacePage>
	);
}
