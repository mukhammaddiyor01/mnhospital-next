import { ArticleCategory, ArticleStatus } from '../enums/article.enum';

export interface Article {
	_id: string;
	memberId: string;
	articleCategory: ArticleCategory;
	articleStatus: ArticleStatus;
	articleTitle: string;
	articleContent: string;
	articleImage?: string;
	articleLikes: number;
	articleViews: number;
	articleComments: number;
	createdAt: string;
	updatedAt: string;
}

export interface ArticlesInquiry {
	page: number;
	limit: number;
	sort?: string;
	direction?: 'ASC' | 'DESC';
	search: { articleCategoryList?: ArticleCategory[]; articleStatus?: ArticleStatus; text?: string };
}
