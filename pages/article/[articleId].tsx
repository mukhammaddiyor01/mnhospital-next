import Image from 'next/image';
import Link from 'next/link';
import { useQuery } from '@apollo/client';
import { useRouter } from 'next/router';
import withLayoutMain from '@/libs/components/layout/LayoutHome';
import { GET_ARTICLE } from '@/apollo/article/query';
import { Article } from '@/libs/components/article/types/article';
import { articleImage, fallbackArticles } from '@/libs/components/article/ArticleCard';
import Icon from '@/libs/components/common/Icon';
import CommentsSection from '@/libs/components/comment/CommentsSection';
import { ReferenceGroup } from '@/libs/components/comment/enums/comment.enum';
import LikeButton from '@/libs/components/common/LikeButton';
import { LIKE_TARGET_ARTICLE } from '@/apollo/article/mutation';

const ArticleDetailPage = () => {
	const router = useRouter();
	const articleId = typeof router.query.articleId === 'string' ? router.query.articleId : '';
	const localArticle = fallbackArticles.find((article) => article._id === articleId);
	const { data, loading } = useQuery(GET_ARTICLE, { variables: { articleId }, skip: !articleId || !!localArticle || !process.env.NEXT_PUBLIC_API_GRAPHQL_URL });
	const article: Article | undefined = localArticle ?? data?.getArticle;
	if (!article) return <div className="clinical-article-detail"><Link className="clinical-article-back" href="/article"><Icon name="arrow_back" /> All articles</Link><div className="clinical-inner-hero"><h1>{loading || !router.isReady ? 'Loading article…' : 'Article not found'}</h1></div></div>;
	const paragraphs = article.articleContent.replace(/<\/?(?:p|br|div)[^>]*>/gi, '\n').replace(/<[^>]*>/g, '').split(/\n+/).map((text) => text.trim()).filter(Boolean);
	return <article className="clinical-article-detail"><Link className="clinical-article-back" href="/article"><Icon name="arrow_back" /> All articles</Link><div className="clinical-inner-hero"><span className="clinical-eyebrow">{article.articleCategory.replaceAll('_', ' ')}</span><h1>{article.articleTitle}</h1><p>MN Hospital Journal</p>{!localArticle && <div className="clinical-article-actions"><LikeButton mutation={LIKE_TARGET_ARTICLE} id={article._id} variableName="articleId" initialLiked={Boolean(article.meLiked?.[0]?.myFavorite)} /><span>{article.articleLikes} likes</span></div>}</div><div className="clinical-article-detail-image"><Image src={articleImage(article)} alt="" fill sizes="(max-width: 900px) calc(100vw - 48px), 760px" unoptimized={!article.articleImage?.startsWith('/')} /></div><div className="clinical-article-copy">{paragraphs.map((paragraph, index) => <p key={index}>{paragraph}</p>)}</div>{!localArticle && <CommentsSection targetId={article._id} group={ReferenceGroup.ARTICLE} />}</article>;
};

export default withLayoutMain(ArticleDetailPage);
