import { operation } from '@/apollo/workspace/operations';
import WorkspacePage from '@/libs/components/workspace/WorkspacePage';
import ResourcePanel, {
	ResourceConfig,
} from '@/libs/components/workspace/ResourcePanel';
import { MemberType } from '@/libs/components/member/enums/member.enum';
import { useWorkspaceText } from '@/libs/components/workspace/useWorkspaceText';
const config: ResourceConfig = {
	role: MemberType.ADMIN,
	title: 'comments',
	list: operation(
		'query',
		'getCommentsByAdmin',
		'OrdinaryInquiry',
		'list { _id commentContent commentGroup commentStatus createdAt } metaCounter { total }',
	),
	listKey: 'getCommentsByAdmin',
	columns: [
		{ name: 'commentContent', label: 'content' },
		{ name: 'commentGroup', label: 'type' },
		{ name: 'createdAt', label: 'date' },
	],
	remove: operation(
		'mutation',
		'removeCommentByAdmin',
		'String',
		'_id',
		'commentId',
	),
	removeVariables: (r) => ({ commentId: r._id }),
	search: true,
};
export default function Page() {
	const w = useWorkspaceText();
	return (
		<WorkspacePage role={MemberType.ADMIN} title={w('comments')}>
			<ResourcePanel config={config} />
		</WorkspacePage>
	);
}
