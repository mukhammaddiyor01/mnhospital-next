import Link from 'next/link';
import { useQuery } from '@apollo/client';
import { GET_SERVICES } from '@/apollo/service/query';
import { GET_ARTICLES } from '@/apollo/article/query';
import { ArticleStatus } from '@/libs/components/article/enums/article.enum';
import { Article } from '@/libs/components/article/types/article';
import { ArticleCard } from '@/libs/components/article/ArticleCard';
import { Service } from '@/libs/components/service/types/service';
import FollowLists from '@/libs/components/follow/FollowLists';

const DoctorProfileExtras = ({ doctorId }: { doctorId: string }) => {
	const services = useQuery(GET_SERVICES, { variables: { input: { page: 1, limit: 6, sort: 'createdAt', direction: 'DESC', search: { memberId: doctorId } } }, skip: !process.env.NEXT_PUBLIC_API_GRAPHQL_URL });
	const articles = useQuery(GET_ARTICLES, { variables: { input: { page: 1, limit: 6, sort: 'createdAt', direction: 'DESC', search: { memberId: doctorId, articleStatus: ArticleStatus.PUBLISHED } } }, skip: !process.env.NEXT_PUBLIC_API_GRAPHQL_URL });
	const serviceList: Service[] = services.data?.getServices?.list ?? [];
	const articleList: Article[] = articles.data?.getArticles?.list ?? [];
	return <>
		<FollowLists profileId={doctorId} kind="doctor" />
		<section className="clinical-inner-section"><h2>Services</h2>{serviceList.length ? <div className="clinical-profile-list">{serviceList.map((service) => <Link href={`/service/${service._id}`} key={service._id}><strong>{service.serviceTitle}</strong><span>{service.serviceDesc}</span></Link>)}</div> : <p className="clinical-query-status">{services.loading ? 'Loading services…' : 'No services published yet.'}</p>}</section>
		<section className="clinical-inner-section"><h2>Articles</h2>{articleList.length ? <div className="clinical-article-grid">{articleList.map((article) => <ArticleCard article={article} key={article._id} />)}</div> : <p className="clinical-query-status">{articles.loading ? 'Loading articles…' : 'No articles published yet.'}</p>}</section>
	</>;
};

export default DoctorProfileExtras;
