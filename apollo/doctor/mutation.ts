import { gql } from '@apollo/client';

export const LOGIN_DOCTOR = gql`
	mutation LoginDoctor($input: DoctorLoginInput!) {
		loginDoctor(input: $input) { _id memberType docNick docFullName docImage accessToken }
	}
`;
