import Link from 'next/link';
import ServiceDiscountManagement from '@/libs/components/workspace/ServiceDiscountManagement';
import { usePromotionText } from '@/libs/components/workspace/usePromotionText';
import WorkspacePage from '@/libs/components/workspace/WorkspacePage';
import ServiceManagement from '@/libs/components/workspace/ServiceManagement';
import { MemberType } from '@/libs/components/member/enums/member.enum';
import { useTranslation } from '@/libs/i18n/useTranslation';
export default function Page() {
	const t = useTranslation();
	const promoText = usePromotionText();
	return (
		<WorkspacePage role={MemberType.ADMIN} title={t('nav.services')}>
			<div className="clinical-resource-actions"><Link href="/admin/promo-codes">{promoText.promotions}</Link></div>
			<ServiceManagement role={MemberType.ADMIN} />
			<ServiceDiscountManagement />
		</WorkspacePage>
	);
}
