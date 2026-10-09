import { gql } from '@apollo/client';

export const GET_MEMBER = gql`
	query GetMember($memberId: String!) {
		getMember(memberId: $memberId) {
			_id
			memberType
			memberStatus
			memberNick
			memberFullName
			memberImage
			memberDesc
			memberFollowers
			memberLikes
			memberViews
			memberFollowings
			meLiked {
				memberId
				likeRefId
				myFavorite
			}
			meFollowed {
				myFollowing
			}
			createdAt
		}
	}
`;

export const GET_MY_MEMBER_PROFILE = gql`
	query GetMyMemberProfile {
		getMyMemberProfile {
			_id
			memberType
			memberNick
			memberFullName
			memberImage
			memberDesc
			memberPhone
			memberMail
		}
	}
`;
