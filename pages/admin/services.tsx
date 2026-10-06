import WorkspacePage from '@/libs/components/workspace/WorkspacePage';
import ServiceManagement from '@/libs/components/workspace/ServiceManagement';
import { MemberType } from '@/libs/components/member/enums/member.enum';
import { useTranslation } from '@/libs/i18n/useTranslation';
export default function Page() {
	const t = useTranslation();
	return (
		<WorkspacePage role={MemberType.ADMIN} title={t('nav.services')}>
			<ServiceManagement role={MemberType.ADMIN} />
		</WorkspacePage>
	);
}
