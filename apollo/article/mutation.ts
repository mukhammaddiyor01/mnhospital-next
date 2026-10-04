import { gql } from '@apollo/client';

export const LIKE_TARGET_ARTICLE = gql`
	mutation LikeTargetArticle($articleId: String!) {
		likeTargetArticle(articleId: $articleId) { _id articleLikes }
	}
`;
