import { gql } from '@apollo/client';

export const GET_AVAILABLE_DOCTOR_SLOTS = gql`
	query GetAvailableDoctorSlots($input: AvailableDoctorSlotsInput!) {
		getAvailableDoctorSlots(input: $input) {
			startsAt
			endsAt
		}
	}
`;
