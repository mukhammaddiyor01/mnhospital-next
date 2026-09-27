import { gql } from '@apollo/client';

const PATIENT_FIELDS = `
	_id memberId memberType memberStatus patientBloodType patientGender patientBirthDate patientIdNumber
	patientFullName patientImage patientDesc patientAddress createdAt updatedAt
`;

export const CREATE_PATIENT_PROFILE = gql`
	mutation CreatePatientProfile($input: PatientProfileInput!) {
		createPatientProfile(input: $input) { ${PATIENT_FIELDS} }
	}
`;

export const UPDATE_MY_PATIENT_PROFILE = gql`
	mutation UpdateMyPatientProfile($input: PatientProfileInput!) {
		updateMyPatientProfile(input: $input) { ${PATIENT_FIELDS} }
	}
`;
