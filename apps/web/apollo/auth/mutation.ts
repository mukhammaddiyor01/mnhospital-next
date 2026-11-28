import { gql } from '@apollo/client';
export const UPDATE_ACCOUNT_PROFILE = gql`
	mutation UpdateMyAccountProfile($input: AccountProfileInput!) {
		updateMyAccountProfile(input: $input) { accessToken }
	}
`;
export const CHANGE_ACCOUNT_PASSWORD = gql`
	mutation ChangeMyAccountPassword($input: AccountPasswordInput!) {
		changeMyAccountPassword(input: $input) { accessToken }
	}
`;
export const REFRESH_SESSION = gql`
	mutation RefreshSession {
		refreshSession {
			accessToken
		}
	}
`;
export const LOGOUT_SESSION = gql`
	mutation LogoutSession {
		logoutSession
	}
`;
