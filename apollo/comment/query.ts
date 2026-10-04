import { gql } from '@apollo/client';

export const GET_COMMENTS = gql`
	query GetComments($input: CommentsInquiry!) {
		getComments(input: $input) {
			list { _id commentStatus commentGroup commentContent commentRefId memberId createdAt updatedAt memberData { memberNick memberFullName memberImage } doctorData { docFullName docImage } }
			metaCounter { total }
		}
	}
`;
