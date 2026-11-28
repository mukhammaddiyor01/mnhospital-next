import { gql } from '@apollo/client';

export const GET_MEMBER_FOLLOWERS = gql`
	query GetMemberFollowers($input: FollowInquiry!) {
		getMemberFollowers(input: $input) {
			list { _id followerId followerData { _id memberNick memberFullName memberImage memberType } followerDoctorData { _id docFullName docImage docSpecialty } }
			metaCounter { total }
		}
	}
`;

export const GET_MEMBER_FOLLOWINGS = gql`
	query GetMemberFollowings($input: FollowInquiry!) {
		getMemberFollowings(input: $input) {
			list { _id followingId followingData { _id memberNick memberFullName memberImage memberType } }
			metaCounter { total }
		}
	}
`;

export const GET_DOCTOR_FOLLOWERS = gql`
	query GetDoctorFollowers($input: DoctorFollowInquiry!) {
		getDoctorFollowers(input: $input) {
			list { _id memberId memberData { _id memberNick memberFullName memberImage memberType } followerDoctorData { _id docFullName docImage docSpecialty } }
			metaCounter { total }
		}
	}
`;

export const GET_DOCTOR_FOLLOWINGS = gql`
	query GetDoctorFollowings($input: DoctorFollowInquiry!) {
		getDoctorFollowings(input: $input) {
			list { _id doctorId doctorData { _id docFullName docImage docSpecialty } }
			metaCounter { total }
		}
	}
`;
