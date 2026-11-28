import styles from '@/libs/components/article/ArticleDetail.module.scss';
import Image from 'next/image';
import Link from 'next/link';
import { useQuery } from '@apollo/client';
import { useRouter } from 'next/router';
import withLayoutMain from '@/libs/components/layout/LayoutHome';
import { GET_ARTICLE } from '@/apollo/article/query';
import { Article } from '@/libs/components/article/types/article';
import { articleImage, useArticleCategoryLabel } from '@/libs/components/article/ArticleCard';
import Icon from '@/libs/components/common/Icon';
import CommentsSection from '@/libs/components/comment/CommentsSection';
import { ReferenceGroup } from '@/libs/components/comment/enums/comment.enum';
import LikeButton from '@/libs/components/common/LikeButton';
import { LIKE_TARGET_ARTICLE } from '@/apollo/article/mutation';
import { useTranslation } from '@/libs/i18n/useTranslation';
import type { GetServerSideProps } from 'next';
import { publicDetailProps, type PublicDetailProps } from '@/libs/seo/server';

export const getServerSideProps: GetServerSideProps<PublicDetailProps<Article>> = async ({ params, res }) =>
	publicDetailProps<Article>('article', String(params?.articleId ?? ''), GET_ARTICLE, res);

const ArticleDetailPage = ({ initialDetail }: PublicDetailProps<Article>) => {
	const t = useTranslation();
	const categoryLabel = useArticleCategoryLabel();
	const router = useRouter();
	const articleId = typeof router.query.articleId === 'string' ? router.query.articleId.toLowerCase() : '';
	const localArticle = undefined;
	const { data, loading, error } = useQuery(GET_ARTICLE, { variables: { articleId }, skip: !router.isReady || !/^[a-f\d]{24}$/i.test(articleId), ssr: false });
	const article: Article | undefined = data?.getArticle?._id === articleId ? data.getArticle
		: !error && initialDetail?._id === articleId ? initialDetail : undefined;
	if (!article) return <div className="clinical-article-detail"><Link className="clinical-article-back" href="/article"><Icon name="arrow_back" /> {t('articles.all')}</Link><div className="clinical-inner-hero"><h1>{loading || !router.isReady ? t('articles.loading') : t('articles.notFound')}</h1></div></div>;
	const paragraphs = article.articleContent.replace(/<\/?(?:p|br|div)[^>]*>/gi, '\n').replace(/<[^>]*>/g, '').split(/\n+/).map((text) => text.trim()).filter(Boolean);
	return <article className="clinical-article-detail"><Link className="clinical-article-back" href="/article"><Icon name="arrow_back" /> {t('articles.all')}</Link><div className="clinical-inner-hero"><span className="clinical-eyebrow">{categoryLabel(article.articleCategory)}</span><h1>{article.articleTitle}</h1><p>{t('articles.journal')}</p>{!localArticle && <div className="clinical-article-actions"><LikeButton mutation={LIKE_TARGET_ARTICLE} id={article._id} variableName="articleId" initialLiked={Boolean(article.meLiked?.[0]?.myFavorite)} /><span>{article.articleLikes} {t('articles.likes')}</span></div>}</div><div className={styles.image}><Image src={articleImage(article)} alt={article.articleTitle} fill sizes="(max-width: 900px) calc(100vw - 48px), 760px" unoptimized={!articleImage(article).startsWith('/img/')} /></div><div className="clinical-article-copy">{paragraphs.map((paragraph, index) => <p key={index}>{paragraph}</p>)}</div>{!localArticle && <CommentsSection targetId={article._id} group={ReferenceGroup.ARTICLE} />}</article>;
};

export default withLayoutMain(ArticleDetailPage);
