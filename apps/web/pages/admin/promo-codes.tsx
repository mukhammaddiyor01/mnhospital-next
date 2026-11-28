import Link from 'next/link';
import WorkspacePage from '@/libs/components/workspace/WorkspacePage';
import PromoCodeManagement from '@/libs/components/workspace/PromoCodeManagement';
import { usePromotionText } from '@/libs/components/workspace/usePromotionText';
import { MemberType } from '@/libs/components/member/enums/member.enum';
import Icon from '@/libs/components/common/Icon';
import styles from '@/libs/components/promotions/Promotions.module.scss';
export default function Page() {
	const text = usePromotionText();
	return (
		<WorkspacePage role={MemberType.ADMIN} title={text.promotions}>
			<div className={styles.workspaceIntro}>
				<p>{text.adminHelp}</p>
				<Link className={styles.secondary} href="/admin/services">
					<Icon name="price_change" />
					{text.manageDiscounts}
				</Link>
			</div>
			<PromoCodeManagement />
		</WorkspacePage>
	);
}
