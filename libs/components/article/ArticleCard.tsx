import Link from 'next/link';
import Image from 'next/image';
import { Article } from './types/article';
import { ArticleCategory, ArticleStatus } from './enums/article.enum';
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

export const fallbackArticles: Article[] = [
	{ _id: 'heart-health-basics', memberId: '', articleCategory: ArticleCategory.HEALTH, articleStatus: ArticleStatus.PUBLISHED, articleTitle: 'Small Steps for a Healthier Heart', articleContent: 'Heart health is built through everyday choices. A regular walking routine, balanced meals, enough sleep, and routine blood pressure checks can help you understand and support your cardiovascular health. Start with a pace you can maintain and speak with a clinician about changes that fit your needs.', articleImage: '/img/hospital-care-2.png', articleLikes: 0, articleViews: 0, articleComments: 0, createdAt: '', updatedAt: '' },
	{ _id: 'prepare-for-your-visit', memberId: '', articleCategory: ArticleCategory.TIPS, articleStatus: ArticleStatus.PUBLISHED, articleTitle: 'How to Prepare for Your Appointment', articleContent: 'A little preparation can make your appointment more useful. Bring a list of medications, previous test results, and the questions you want to ask. Share when your symptoms began and what makes them better or worse. Before leaving, make sure you understand the next steps and who to contact if questions come up.', articleImage: '/img/hospital-care-3.png', articleLikes: 0, articleViews: 0, articleComments: 0, createdAt: '', updatedAt: '' },
	{ _id: 'working-together-for-care', memberId: '', articleCategory: ArticleCategory.NEWS, articleStatus: ArticleStatus.PUBLISHED, articleTitle: 'Why Team-Based Care Matters', articleContent: 'Good care often takes more than one specialty. Doctors, nurses, therapists, and support teams share information and coordinate a plan around each patient. This approach can make complex decisions clearer and help patients feel supported throughout treatment and recovery.', articleImage: '/img/hospital-care-1.png', articleLikes: 0, articleViews: 0, articleComments: 0, createdAt: '', updatedAt: '' },
];

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
