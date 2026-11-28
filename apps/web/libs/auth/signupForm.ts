import type { MessageKey } from '@/libs/i18n/messages';

export type SignupForm = {
	memberFullName: string;
	memberNick: string;
	memberPhone: string;
	memberPassword: string;
};

export function prepareSignup(form: SignupForm): {
	input: SignupForm;
	error?: MessageKey;
} {
	const input = {
		...form,
		memberFullName: form.memberFullName.trim(),
		memberNick: form.memberNick.trim(),
		memberPhone: form.memberPhone.replace(/[\s()-]/g, ''),
	};
	if (input.memberFullName.length < 2 || input.memberFullName.length > 100)
		return { input, error: 'auth.invalidFullName' };
	if (input.memberNick.length < 3 || input.memberNick.length > 30)
		return { input, error: 'auth.invalidUsername' };
	if (input.memberPassword.length < 8 || input.memberPassword.length > 32)
		return { input, error: 'auth.invalidPassword' };
	// Match the API MemberInput contract after removing display formatting.
	if (!/^(?:\+?[1-9]\d{7,14}|0\d{1,2}\d{3,4}\d{4})$/.test(input.memberPhone))
		return { input, error: 'auth.invalidPhone' };
	return { input };
}

export function authFormError(error: unknown, fallback: string, connectionError: string): string {
	const failure = error as { message?: unknown; networkError?: { message?: unknown }; graphQLErrors?: unknown[] } | null;
	const message = failure?.networkError?.message ?? failure?.message;
	if (!failure?.graphQLErrors?.length && typeof message === 'string' &&
		/failed to fetch|fetch failed|networkerror|network request failed|load failed/i.test(message))
		return connectionError;
	return typeof failure?.message === 'string' && failure.message !== 'Bad Request Exception'
		? failure.message
		: fallback;
}
