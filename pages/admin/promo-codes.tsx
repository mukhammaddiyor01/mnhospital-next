import WorkspacePage from '@/libs/components/workspace/WorkspacePage';
import PromoCodeManagement from '@/libs/components/workspace/PromoCodeManagement';
import { usePromotionText } from '@/libs/components/workspace/usePromotionText';
import { MemberType } from '@/libs/components/member/enums/member.enum';
export default function Page() {
	const text = usePromotionText();
	return (
		<WorkspacePage role={MemberType.ADMIN} title={text.promotions}>
			<PromoCodeManagement />
		</WorkspacePage>
	);
}
