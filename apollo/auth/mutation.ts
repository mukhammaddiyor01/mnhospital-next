import { gql } from '@apollo/client';
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
