import { gql } from '@apollo/client';

export const GET_AVAILABLE_DOCTOR_SLOTS = gql`
	query GetAvailableDoctorSlots($input: AvailableDoctorSlotsInput!) {
		getAvailableDoctorSlots(input: $input) {
			startsAt
			endsAt
		}
	}
`;

export const GET_AVAILABLE_DOCTOR_DATES = gql`
 query GetAvailableDoctorDates($input: AvailableDoctorDatesInput!) {
  getAvailableDoctorDates(input: $input) { dates reason }
 }
`;
