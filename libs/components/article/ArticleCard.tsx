import Link from 'next/link';
import Image from 'next/image';
import { Article } from './types/article';
import { ArticleCategory } from './enums/article.enum';
import { resolveApiAsset } from '@/libs/config';
import Icon from '../common/Icon';
import LikeButton from '../common/LikeButton';
import { LIKE_TARGET_ARTICLE } from '@/apollo/article/mutation';
import { useTranslation } from '@/libs/i18n/useTranslation';
import { MessageKey } from '@/libs/i18n/messages';

const categoryKeys: Record<ArticleCategory, MessageKey> = {
	[ArticleCategory.HEALTH]: 'articles.categoryHealth',
	[ArticleCategory.NEWS]: 'articles.categoryNews',
	[ArticleCategory.TIPS]: 'articles.categoryTips',
	[ArticleCategory.RESEARCH]: 'articles.categoryResearch',
	[ArticleCategory.ANNOUNCEMENT]: 'articles.categoryAnnouncement',
};

export const useArticleCategoryLabel = () => {
	const t = useTranslation();
	return (category: ArticleCategory) => categoryKeys[category] ? t(categoryKeys[category]) : String(category).replaceAll('_', ' ');
};

export const articleImage = (article: Article) => article.articleImage?.startsWith('/img/') ? article.articleImage : article.articleImage ? resolveApiAsset(article.articleImage) : '/img/hero-medical.svg';
export const articleExcerpt = (article: Article) => article.articleContent.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim().slice(0, 115);

export const ArticleCard = ({ article }: { article: Article }) => {
	const t = useTranslation();
	const categoryLabel = useArticleCategoryLabel();
	return <article className="clinical-article-card">
		<Link className="clinical-article-image" href={`/article/${article._id}`} aria-label={`${t('articles.readAria')} ${article.articleTitle}`}><Image src={articleImage(article)} alt="" fill sizes="(max-width: 680px) calc(100vw - 48px), 245px" unoptimized={!article.articleImage?.startsWith('/')} /></Link>
		<div className="clinical-article-body"><div className="clinical-article-card-top"><span className="clinical-article-category">{categoryLabel(article.articleCategory)}</span>{/^[a-f\d]{24}$/i.test(article._id) && <LikeButton mutation={LIKE_TARGET_ARTICLE} id={article._id} variableName="articleId" initialLiked={Boolean(article.meLiked?.[0]?.myFavorite)} label={`${t('articles.likeAria')} ${article.articleTitle}`} />}</div><h3><Link href={`/article/${article._id}`}>{article.articleTitle}</Link></h3><p>{articleExcerpt(article)}{article.articleContent.length > 115 ? '…' : ''}</p><Link className="clinical-article-read" href={`/article/${article._id}`}>{t('articles.read')} <Icon name="arrow_forward" /></Link></div>
	</article>;
};
