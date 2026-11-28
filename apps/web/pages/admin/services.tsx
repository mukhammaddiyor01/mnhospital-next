import Link from 'next/link';
import { useRouter } from 'next/router';
import ServiceOptionManagement from '@/libs/components/workspace/ServiceOptionManagement';
import { useServiceOptionText } from '@/libs/components/workspace/useServiceOptionText';
import ServiceDiscountManagement from '@/libs/components/workspace/ServiceDiscountManagement';
import { usePromotionText } from '@/libs/components/workspace/usePromotionText';
import WorkspacePage from '@/libs/components/workspace/WorkspacePage';
import ServiceManagement from '@/libs/components/workspace/ServiceManagement';
import { MemberType } from '@/libs/components/member/enums/member.enum';
import { useTranslation } from '@/libs/i18n/useTranslation';
import Icon from '@/libs/components/common/Icon';
import styles from '@/libs/components/promotions/Promotions.module.scss';
export default function Page() {
	const t = useTranslation(),
		text = usePromotionText(),
		optionsText = useServiceOptionText(),
		router = useRouter();
	const catalog = router.query.view === 'catalog';
	const options = router.query.view === 'options';
	return (
		<WorkspacePage role={MemberType.ADMIN} title={t('nav.services')}>
			<div className={styles.workspaceIntro}>
				<p>{text.catalogHelp}</p>
				<Link href="/admin/promo-codes" className={styles.secondary}>
					<Icon name="local_offer" />
					{text.manage}
				</Link>
			</div>
			<nav className={styles.tabs} aria-label={t('nav.services')}>
				<Link
					href="/admin/services"
					aria-current={!catalog && !options ? 'page' : undefined}
				>
					<Icon name="price_change" />
					{text.pricing}
				</Link>
				<Link
					href="/admin/services?view=catalog"
					aria-current={catalog ? 'page' : undefined}
				>
					<Icon name="medical_services" />
					{text.catalog}
				</Link>
				<Link href="/admin/services?view=options" aria-current={options ? 'page' : undefined}><Icon name="format_list_bulleted"/>{optionsText.title}</Link>
			</nav>
			{options ? <ServiceOptionManagement /> : catalog ? (
				<ServiceManagement role={MemberType.ADMIN} />
			) : (
				<ServiceDiscountManagement />
			)}
		</WorkspacePage>
	);
}
