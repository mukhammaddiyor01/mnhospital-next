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
			metaCounter { total }
		}
	}
`;
