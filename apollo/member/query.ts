import { gql } from '@apollo/client';

export const GET_MEMBER = gql`
	query GetMember($memberId: String!) {
		getMember(memberId: $memberId) {
			_id memberType memberStatus memberAuthType memberPhone memberMail memberNick memberFullName memberImage memberDesc
			memberConversation memberAddress memberServices memberArticles memberFollowers memberFollowings memberLikes memberViews
			memberComments memberPoints memberRank memberReports accessToken createdAt updatedAt
		}
	}
`;
