import { useQuery } from '@apollo/client';
import withLayoutMain from '@/libs/components/layout/LayoutHome';
import { GET_ARTICLES } from '@/apollo/article/query';
import { ArticleStatus } from '@/libs/components/article/enums/article.enum';
import { Article } from '@/libs/components/article/types/article';
import { ArticleCard, fallbackArticles } from '@/libs/components/article/ArticleCard';

const ArticlePage = () => {
	const { data } = useQuery(GET_ARTICLES, { variables: { input: { page: 1, limit: 12, sort: 'createdAt', direction: 'DESC', search: { articleStatus: ArticleStatus.PUBLISHED } } }, skip: !process.env.NEXT_PUBLIC_API_GRAPHQL_URL, fetchPolicy: 'cache-and-network' });
	const articles: Article[] = data?.getArticles?.list?.length ? data.getArticles.list : fallbackArticles;
	return <div className="clinical-article-page"><div className="clinical-inner-hero"><span className="clinical-eyebrow">MN HOSPITAL JOURNAL</span><h1>Care beyond the appointment.</h1><p>Practical health information and updates from our clinical community.</p></div><section className="clinical-content-section"><div className="clinical-section-heading"><div><span className="clinical-section-kicker">EXPLORE THE JOURNAL</span><h2>Latest Articles</h2></div></div><div className="clinical-article-grid">{articles.map((article) => <ArticleCard article={article} key={article._id} />)}</div></section></div>;
};

export default withLayoutMain(ArticlePage);
