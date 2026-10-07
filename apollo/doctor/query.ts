import { gql } from '@apollo/client';

export const GET_DOCTORS = gql`
	query GetDoctors($input: DoctorsInquiry!) {
		getDoctors(input: $input) {
			list {
				_id
				docSpecialty
				docNick
				docFullName
				docImage
				docAddress
				docDesc
				docExperience
				docRoom
				docPoints
				docPatients
			}
			metaCounter {
				total
			}
		}
	}
`;

export const GET_DOCTOR = gql`
	query GetDoctor($doctorId: String!) {
		getDoctor(doctorId: $doctorId) {
			_id
			docSpecialty
			docNick
			docFullName
			docImage
			docAddress
			docDesc
			docExperience
			docRoom
			docPoints
			docPatients
			docServices
			docArticles
			docFollowers
			docFollowings
			docLikes
			meLiked {
				myFavorite
			}
			meFollowed {
				myFollowing
			}
		}
	}
`;
