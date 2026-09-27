import { jwtDecode } from 'jwt-decode';
import { initializeApollo } from '@/apollo/client';
import { userVar } from '@/apollo/store';
import { LOGIN, SIGN_UP } from '@/apollo/member/mutation';
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
	userVar({ ...claims, ...member, _id: String(member?._id ?? claims._id ?? ''), memberNick: member?.memberNick ?? claims.memberNick ?? '' });
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
