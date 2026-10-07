import { gql } from '@apollo/client';

export const LOGIN_DOCTOR = gql`
	mutation LoginDoctor($input: DoctorLoginInput!) {
		loginDoctor(input: $input) {
			_id
			memberType
			docNick
			docFullName
			docImage
			accessToken
		}
	}
`;

export const LIKE_TARGET_DOCTOR = gql`
	mutation LikeTargetDoctor($doctorId: String!) {
		likeTargetDoctor(doctorId: $doctorId) {
			_id
			docLikes
			meLiked {
				myFavorite
			}
		}
	}
`;
