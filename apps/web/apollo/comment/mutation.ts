import { gql } from '@apollo/client';

export const CREATE_COMMENT = gql`
	mutation CreateComment($input: CommentInput!) {
		createComment(input: $input) {
			_id commentStatus commentGroup commentContent commentRefId memberId createdAt updatedAt
		}
	}
`;
