import Link from 'next/link';
import { useQuery } from '@apollo/client';
import { GET_ARTICLES } from '@/apollo/article/query';
import Icon from '../common/Icon';
import SectionHeading from '../common/SectionHeading';

const fallbackArticles = [
	{ _id: 'new-wing', articleCategory: 'ANNOUNCEMENT', articleTitle: 'A new wing for a better patient experience', articleContent: 'Expanding our capacity to care for you with more comfortable spaces and faster access.', articleViews: 420, articleLikes: 98 },
	{ _id: 'heart-health', articleCategory: 'HEALTH', articleTitle: 'Five simple ways to support your heart health', articleContent: 'Small, consistent choices can make a meaningful difference in your long-term wellbeing.', articleViews: 306, articleLikes: 72 },
	{ _id: 'care-team', articleCategory: 'NEWS', articleTitle: 'Meet the team behind connected care', articleContent: 'Learn how our specialists work together so every visit feels more personal.', articleViews: 212, articleLikes: 51 },
];

const HospitalUpdates = () => {
	const { data, loading } = useQuery(GET_ARTICLES, {
		variables: { input: { page: 1, limit: 3, sort: 'createdAt', direction: 'DESC', search: { articleStatus: 'PUBLISHED' } } },
		skip: !process.env.NEXT_PUBLIC_API_GRAPHQL_URL,
		fetchPolicy: 'cache-and-network',
	});
	const articles = data?.getArticles?.list?.length ? data.getArticles.list.map((article: any) => ({ ...article, articleTitle: article.articleTitle ?? article.articleName ?? 'MN Hospital update', articleContent: article.articleContent ?? article.articleDesc ?? 'News and practical guidance from the MN Hospital team.' })) : fallbackArticles;

	return <section className="updates-section section-light"><div className="container"><SectionHeading eyebrow="MN Hospital journal" title="Care beyond the appointment." description="Practical health information and updates from our clinical community." linkLabel="Read all updates" linkHref="/article" /><div className="updates-grid">{articles.map((article: any) => <article className="update-card" key={article._id}><div className="update-card-top"><span><Icon name="auto_stories" /> {String(article.articleCategory).replaceAll('_', ' ')}</span><small>{article.articleViews ?? 0} reads</small></div><h3>{article.articleTitle}</h3><p>{article.articleContent}</p><Link href={`/article/${article._id}`}>Read article <span>→</span></Link></article>)}</div>{loading && <span className="query-status">Loading the latest hospital updates…</span>}</div></section>;
};

export default HospitalUpdates;
