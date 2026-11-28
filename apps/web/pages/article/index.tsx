import { useQuery } from '@apollo/client';
import withLayoutMain from '@/libs/components/layout/LayoutHome';
import { GET_ARTICLES } from '@/apollo/article/query';
import { ArticleStatus } from '@/libs/components/article/enums/article.enum';
import { Article } from '@/libs/components/article/types/article';
import { ArticleCard } from '@/libs/components/article/ArticleCard';
import { useTranslation } from '@/libs/i18n/useTranslation';
import type { GetServerSideProps } from 'next';
import { publicCatalogProps, type PublicCatalogProps } from '@/libs/seo/server';

type ArticleCatalog = { list: Article[]; metaCounter: Array<{ total: number }> };
const inquiry = { page: 1, limit: 12, sort: 'createdAt', direction: 'DESC', search: { articleStatus: ArticleStatus.PUBLISHED } };
export const getServerSideProps: GetServerSideProps<PublicCatalogProps<ArticleCatalog>> = async ({ res }) => ({
	props: await publicCatalogProps<ArticleCatalog>(GET_ARTICLES, 'getArticles', inquiry, res),
});

const ArticlePage = ({ initialCatalog }: PublicCatalogProps<ArticleCatalog>) => {
	const t = useTranslation();
	const { data, loading, error } = useQuery(GET_ARTICLES, { variables: { input: inquiry }, fetchPolicy: 'cache-and-network', ssr: false });
	const articles: Article[] = data?.getArticles?.list ?? (!error ? initialCatalog?.list : undefined) ?? [];
	return <div className="clinical-article-page"><div className="clinical-inner-hero"><span className="clinical-eyebrow">{t('articles.journal')}</span><h1>{t('articles.hero')}</h1><p>{t('articles.intro')}</p></div><section className="clinical-content-section"><div className="clinical-section-heading"><div><span className="clinical-section-kicker">{t('articles.explore')}</span><h2>{t('articles.latest')}</h2></div></div><div>{loading && <p role="status">{t('articles.loading')}</p>}{error && <p role="alert">{t('activity.unavailable')}</p>}{!loading && !error && !articles.length && <p role="status">{t('articles.notFound')}</p>}</div><div className="clinical-article-grid">{articles.map((article) => <ArticleCard article={article} key={article._id} />)}</div></section></div>;
};

export default withLayoutMain(ArticlePage);
