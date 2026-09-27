import { gql } from '@apollo/client';

const MEMBER_FIELDS = `
	_id memberType memberStatus memberAuthType memberPhone memberMail memberNick memberFullName memberImage memberDesc
	memberConversation memberAddress memberServices memberArticles memberFollowers memberFollowings memberLikes memberViews
	memberComments memberPoints memberRank memberReports accessToken createdAt updatedAt
`;

export const LOGIN = gql`mutation Login($input: LoginInput!) { login(input: $input) { ${MEMBER_FIELDS} } }`;
export const SIGN_UP = gql`mutation Signup($input: MemberInput!) { signup(input: $input) { ${MEMBER_FIELDS} } }`;
export const SOCIAL_AUTHENTICATE = gql`mutation SocialAuthenticate($input: SocialAuthInput!) { socialAuthenticate(input: $input) { ${MEMBER_FIELDS} } }`;
export const UPDATE_MEMBER = gql`mutation UpdateMember($input: MemberUpdate!) { updateMember(input: $input) { ${MEMBER_FIELDS} } }`;
export const LIKE_TARGET_MEMBER = gql`mutation LikeTargetMember($memberId: String!) { likeTargetMember(memberId: $memberId) { ${MEMBER_FIELDS} } }`;
