import Link from 'next/link';
import { useQuery } from '@apollo/client';
import { GET_FAVORITE_SERVICES, GET_VISITED_SERVICES } from '@/apollo/service/query';
import { useTranslation } from '@/libs/i18n/useTranslation';
import { useServiceTypeLabel } from '@/libs/i18n/useServiceTypeLabel';
import { useWorkspaceText } from '@/libs/components/workspace/useWorkspaceText';

type ActivityService = { _id: string; serviceTitle: string; serviceDesc?: string; serviceType?: string };

const ActivityList = ({ title, items, loading, error }: { title: string; items: ActivityService[]; loading: boolean; error?: Error }) => {
	const t = useTranslation();
	const typeLabel = useServiceTypeLabel();
	return <div>
		<h3>{title}</h3>
		{items.length ? <div className="clinical-profile-list">{items.map((service) => <Link key={service._id} href={`/service/${service._id}`}><strong>{service.serviceTitle}</strong><span>{service.serviceDesc || (service.serviceType ? typeLabel(service.serviceType) : t('activity.viewDetails'))}</span></Link>)}</div> : <p className="clinical-query-status">{loading ? t('activity.loading') : error ? t('activity.unavailable') : t('activity.empty')}</p>}
	</div>;
};

const PatientActivity = () => {
	const t = useTranslation();
	const w = useWorkspaceText();
	const variables = { input: { page: 1, limit: 6 } };
	const visited = useQuery(GET_VISITED_SERVICES, { variables, fetchPolicy: 'cache-and-network' });
	const favorites = useQuery(GET_FAVORITE_SERVICES, { variables, fetchPolicy: 'cache-and-network' });
	return <section id="profile-activity" className="clinical-inner-section clinical-patient-activity mn-profile-activity">
		<h2>{w('profileActivity')}</h2>
		<ActivityList title={t('activity.recent')} items={visited.data?.getVisited?.list ?? []} loading={visited.loading} error={visited.error} />
		<ActivityList title={t('activity.liked')} items={favorites.data?.getFavorites?.list ?? []} loading={favorites.loading} error={favorites.error} />
	</section>;
};

export default PatientActivity;
