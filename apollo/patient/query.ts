import { gql } from '@apollo/client';

export const GET_MY_PATIENT_PROFILE = gql`
	query GetMyPatientProfile {
		getMyPatientProfile {
			_id memberId memberType memberStatus patientBloodType patientGender patientBirthDate patientIdNumber
			patientFullName patientImage patientDesc patientAddress createdAt updatedAt
		}
	}
`;
