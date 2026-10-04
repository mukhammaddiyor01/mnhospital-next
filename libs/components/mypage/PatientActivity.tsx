import Link from 'next/link';
import { useQuery } from '@apollo/client';
import { GET_FAVORITE_SERVICES, GET_VISITED_SERVICES } from '@/apollo/service/query';

type ActivityService = { _id: string; serviceTitle: string; serviceDesc?: string; serviceType?: string };

const ActivityList = ({ title, items, loading, error }: { title: string; items: ActivityService[]; loading: boolean; error?: Error }) => <div>
	<h2>{title}</h2>
	{items.length ? <div className="clinical-profile-list">{items.map((service) => <Link key={service._id} href={`/service/${service._id}`}><strong>{service.serviceTitle}</strong><span>{service.serviceDesc || service.serviceType?.replaceAll('_', ' ') || 'View service details'}</span></Link>)}</div> : <p className="clinical-query-status">{loading ? 'Loading services…' : error ? 'Services are temporarily unavailable.' : 'No services yet.'}</p>}
</div>;

const PatientActivity = () => {
	const variables = { input: { page: 1, limit: 6 } };
	const visited = useQuery(GET_VISITED_SERVICES, { variables, fetchPolicy: 'cache-and-network' });
	const favorites = useQuery(GET_FAVORITE_SERVICES, { variables, fetchPolicy: 'cache-and-network' });
	return <section className="clinical-inner-section clinical-patient-activity">
		<span className="clinical-section-kicker">YOUR HOSPITAL ACTIVITY</span>
		<ActivityList title="Recently viewed services" items={visited.data?.getVisited?.list ?? []} loading={visited.loading} error={visited.error} />
		<ActivityList title="Liked services" items={favorites.data?.getFavorites?.list ?? []} loading={favorites.loading} error={favorites.error} />
	</section>;
};

export default PatientActivity;
