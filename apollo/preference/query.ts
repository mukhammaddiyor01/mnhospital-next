import { gql } from '@apollo/client';

export const GET_MY_PREFERENCES = gql`
	query GetMyPreferences {
		getMyPreferences {
			theme
			language
		}
	}
`;
