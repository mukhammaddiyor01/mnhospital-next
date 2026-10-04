import { gql } from '@apollo/client';

export const GET_MEMBER = gql`
	query GetMember($memberId: String!) {
		getMember(memberId: $memberId) {
			_id memberType memberStatus memberNick memberFullName memberImage memberDesc
			memberFollowers memberFollowings meFollowed { myFollowing } createdAt
		}
	}
`;
