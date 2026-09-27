const ACCESS_TOKEN_KEY = 'accessToken';

export const getJwtToken = () => {
	if (typeof window === 'undefined') return '';
	return window.localStorage.getItem(ACCESS_TOKEN_KEY) ?? '';
};

export const setJwtToken = (token: string) => {
	if (typeof window === 'undefined') return;
	window.localStorage.setItem(ACCESS_TOKEN_KEY, token);
};

export const removeJwtToken = () => {
	if (typeof window === 'undefined') return;
	window.localStorage.removeItem(ACCESS_TOKEN_KEY);
};
