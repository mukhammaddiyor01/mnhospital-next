import WorkspacePage from '@/libs/components/workspace/WorkspacePage';
import ResourcePanel from '@/libs/components/workspace/ResourcePanel';
import { advertisements } from '@/libs/components/workspace/contentResources';
import { MemberType } from '@/libs/components/member/enums/member.enum';
import { useWorkspaceText } from '@/libs/components/workspace/useWorkspaceText';
export default function Page() { const w=useWorkspaceText(); return <WorkspacePage role={MemberType.ADMIN} title={w(advertisements.title)}><ResourcePanel config={advertisements}/></WorkspacePage>; }
