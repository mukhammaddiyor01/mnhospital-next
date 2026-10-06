import { jwtDecode } from 'jwt-decode';
import { initializeApollo } from '@/apollo/client';
import { userVar } from '@/apollo/store';
import { LOGIN, SIGN_UP, SOCIAL_AUTHENTICATE } from '@/apollo/member/mutation';
import { LOGIN_DOCTOR } from '@/apollo/doctor/mutation';
import { LOGIN_ADMIN, LOGIN_RECEPTIONIST } from '@/apollo/staff/mutation';
import { MemberSession } from '@/libs/components/member/types/member';
import { MemberType } from '@/libs/components/member/enums/member.enum';
import { getJwtToken, removeJwtToken, setJwtToken } from './token';

interface JwtPayload extends MemberSession { exp?: number; iat?: number; }
const emptySession: MemberSession = { _id: '', memberNick: '' };

const updateStorage = (token: string) => {
	setJwtToken(token);
	window.localStorage.setItem('login', Date.now().toString());
};

const syncSession = (token: string, member?: MemberSession) => {
	if (typeof window === 'undefined') return;
	const claims = jwtDecode<JwtPayload>(token);
	if (claims.exp && claims.exp * 1000 <= Date.now()) {
		removeJwtToken();
		userVar(emptySession);
		return;
	}
	updateStorage(token);
	const doctorClaims = claims as JwtPayload & { docNick?: string; docFullName?: string; docImage?: string };
	userVar({ ...claims, ...member, _id: String(member?._id ?? claims._id ?? ''), memberNick: member?.memberNick ?? claims.memberNick ?? doctorClaims.docNick ?? '', memberFullName: member?.memberFullName ?? claims.memberFullName ?? doctorClaims.docFullName, memberImage: member?.memberImage ?? claims.memberImage ?? doctorClaims.docImage ?? '' });
};

export const refreshMemberSession = (member: MemberSession) => {
	if (!member.accessToken) throw new Error('The server did not return an access token.');
	syncSession(member.accessToken, member);
};

export type SocialProvider = 'GOOGLE' | 'NAVER' | 'KAKAO';
export type SocialAuthMode = 'login' | 'register';

interface SocialAuthTransaction {
	provider: SocialProvider;
	mode: SocialAuthMode;
	state: string;
	codeVerifier?: string;
	createdAt: number;
}

const SOCIAL_TRANSACTION_KEY = 'mn-hospital-social-auth';
const SOCIAL_TRANSACTION_TTL = 10 * 60 * 1000;

const encodeBase64Url = (bytes: Uint8Array) => {
	let binary = '';
	bytes.forEach((byte) => { binary += String.fromCharCode(byte); });
	return window.btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
};

const randomToken = (length = 32) => {
	const bytes = new Uint8Array(length);
	window.crypto.getRandomValues(bytes);
	return encodeBase64Url(bytes);
};

const createCodeChallenge = async (verifier: string) => {
	const digest = await window.crypto.subtle.digest('SHA-256', new TextEncoder().encode(verifier));
	return encodeBase64Url(new Uint8Array(digest));
};

const getProviderClientId = (provider: SocialProvider) => {
	const clientIds: Record<SocialProvider, string | undefined> = {
		GOOGLE: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
		NAVER: process.env.NEXT_PUBLIC_NAVER_CLIENT_ID,
		KAKAO: process.env.NEXT_PUBLIC_KAKAO_REST_API_KEY,
	};
	return clientIds[provider]?.trim();
};

export const startSocialAuth = async (provider: SocialProvider, mode: SocialAuthMode) => {
	if (typeof window === 'undefined') throw new Error('Social authentication is only available in the browser.');
	const clientId = getProviderClientId(provider);
	if (!clientId) throw new Error(`${provider[0] + provider.slice(1).toLowerCase()} sign-in is not configured yet.`);

	const redirectUri = `${window.location.origin}/account/oauth/callback`;
	const state = randomToken();
	const codeVerifier = provider === 'GOOGLE' ? randomToken(48) : undefined;
	const transaction: SocialAuthTransaction = { provider, mode, state, codeVerifier, createdAt: Date.now() };
	window.sessionStorage.setItem(SOCIAL_TRANSACTION_KEY, JSON.stringify(transaction));

	const providerConfig = {
		GOOGLE: { endpoint: 'https://accounts.google.com/o/oauth2/v2/auth', scope: 'openid email profile' },
		NAVER: { endpoint: 'https://nid.naver.com/oauth2.0/authorize', scope: undefined },
		KAKAO: { endpoint: 'https://kauth.kakao.com/oauth/authorize', scope: undefined },
	}[provider];
	const params = new URLSearchParams({ response_type: 'code', client_id: clientId, redirect_uri: redirectUri, state });
	if (providerConfig.scope) params.set('scope', providerConfig.scope);
	if (codeVerifier) {
		params.set('code_challenge', await createCodeChallenge(codeVerifier));
		params.set('code_challenge_method', 'S256');
	}
	window.location.assign(`${providerConfig.endpoint}?${params.toString()}`);
};

export const readSocialAuthTransaction = (): SocialAuthTransaction | null => {
	if (typeof window === 'undefined') return null;
	try {
		const transaction = JSON.parse(window.sessionStorage.getItem(SOCIAL_TRANSACTION_KEY) ?? '') as SocialAuthTransaction;
		if (!transaction.state || !transaction.provider || Date.now() - transaction.createdAt > SOCIAL_TRANSACTION_TTL) return null;
		return transaction;
	} catch { return null; }
};

export const clearSocialAuthTransaction = () => {
	if (typeof window !== 'undefined') window.sessionStorage.removeItem(SOCIAL_TRANSACTION_KEY);
};

export const completeSocialAuth = async (transaction: SocialAuthTransaction, authorizationCode: string) => {
	const redirectUri = `${window.location.origin}/account/oauth/callback`;
	const result = await initializeApollo().mutate({
		mutation: SOCIAL_AUTHENTICATE,
		variables: { input: { provider: transaction.provider, authorizationCode, redirectUri, state: transaction.state, codeVerifier: transaction.codeVerifier } },
		fetchPolicy: 'network-only',
	});
	const member = result.data?.socialAuthenticate as MemberSession | undefined;
	if (!member?.accessToken) throw new Error('The server did not return an access token.');
	syncSession(member.accessToken, member);
	return member;
};

export { getJwtToken, setJwtToken } from './token';

export const updateUserInfo = (token = getJwtToken()) => {
	if (!token) return;
	try { syncSession(token); }
	catch (error) {
		console.warn('Unable to restore MN Hospital session', error);
		removeJwtToken();
		userVar(emptySession);
	}
};

const requestLogin = async (memberNick: string, memberPassword: string) => {
	const result = await initializeApollo().mutate({ mutation: LOGIN, variables: { input: { memberNick, memberPassword } }, fetchPolicy: 'network-only' });
	return result.data?.login as MemberSession | undefined;
};

export const logIn = async (memberNick: string, memberPassword: string) => {
	const member = await requestLogin(memberNick, memberPassword);
	if (!member?.accessToken) throw new Error('The server did not return an access token.');
	syncSession(member.accessToken, member);
	return member;
};

export const logInDoctor = async (docNick: string, docPassword: string) => {
	const result = await initializeApollo().mutate({ mutation: LOGIN_DOCTOR, variables: { input: { docNick, docPassword } }, fetchPolicy: 'network-only' });
	const doctor = result.data?.loginDoctor as { _id: string; memberType: MemberType; docNick: string; docFullName: string; docImage: string; accessToken: string } | undefined;
	if (!doctor?.accessToken) throw new Error('The server did not return an access token.');
	syncSession(doctor.accessToken, { _id: doctor._id, memberType: doctor.memberType, memberNick: doctor.docNick, memberFullName: doctor.docFullName, memberImage: doctor.docImage, accessToken: doctor.accessToken });
	return doctor;
};

export const logInAdmin = async (adminNick: string, adminPassword: string) => {
	const result = await initializeApollo().mutate({ mutation: LOGIN_ADMIN, variables: { input: { adminNick, adminPassword } }, fetchPolicy: 'network-only' });
	const admin = result.data?.loginAdmin as { _id: string; memberType: MemberType; adminNick: string; adminImage: string; accessToken: string } | undefined;
	if (!admin?.accessToken) throw new Error('The server did not return an access token.');
	syncSession(admin.accessToken, { _id: admin._id, memberType: admin.memberType, memberNick: admin.adminNick, memberImage: admin.adminImage, accessToken: admin.accessToken });
	return admin;
};

export const logInReceptionist = async (receptionistNick: string, receptionistPassword: string) => {
	const result = await initializeApollo().mutate({ mutation: LOGIN_RECEPTIONIST, variables: { input: { receptionistNick, receptionistPassword } }, fetchPolicy: 'network-only' });
	const receptionist = result.data?.loginReceptionist as { _id: string; memberType: MemberType; receptionistNick: string; receptionistFullName: string; receptionistImage: string; accessToken: string } | undefined;
	if (!receptionist?.accessToken) throw new Error('The server did not return an access token.');
	syncSession(receptionist.accessToken, { _id: receptionist._id, memberType: receptionist.memberType, memberNick: receptionist.receptionistNick, memberFullName: receptionist.receptionistFullName, memberImage: receptionist.receptionistImage, accessToken: receptionist.accessToken });
	return receptionist;
};

const requestSignUp = async (memberNick: string, memberPassword: string, memberPhone: string, memberFullName?: string) => {
	const result = await initializeApollo().mutate({ mutation: SIGN_UP, variables: { input: { memberNick, memberPassword, memberPhone, memberFullName, memberType: MemberType.PATIENT } }, fetchPolicy: 'network-only' });
	return result.data?.signup as MemberSession | undefined;
};

export const signUp = async (memberNick: string, memberPassword: string, memberPhone: string, memberFullName?: string) => {
	const member = await requestSignUp(memberNick, memberPassword, memberPhone, memberFullName);
	if (!member?.accessToken) throw new Error('The server did not return an access token.');
	syncSession(member.accessToken, member);
	return member;
};

export const logOut = async () => {
	if (typeof window === 'undefined') return;
	removeJwtToken();
	window.localStorage.setItem('logout', Date.now().toString());
	userVar(emptySession);
	await initializeApollo().clearStore();
	window.location.href = '/';
};
