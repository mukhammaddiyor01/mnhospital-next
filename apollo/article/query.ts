import { gql } from '@apollo/client';

export const GET_ARTICLES = gql`
	query GetArticles($input: ArticlesInquiry!) {
		getArticles(input: $input) {
			list { _id memberId articleCategory articleStatus articleTitle articleContent articleImage articleLikes articleViews articleComments createdAt updatedAt meLiked { memberId likeRefId myFavorite } }
			metaCounter { total }
		}
	}
`;

export const GET_ARTICLE = gql`
	query GetArticle($articleId: String!) {
		getArticle(articleId: $articleId) {
			_id memberId articleCategory articleStatus articleTitle articleContent articleImage articleLikes articleViews articleComments createdAt updatedAt meLiked { memberId likeRefId myFavorite }
		}
	}
`;
