import { gql } from '@apollo/client';

export const UPDATE_MY_PREFERENCES = gql`
	mutation UpdateMyPreferences($input: UpdateMyPreferencesInput!) {
		updateMyPreferences(input: $input) {
			theme
			language
		}
	}
`;
