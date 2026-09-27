import { jwtDecode } from 'jwt-decode';
import { initializeApollo } from '@/apollo/client';
import { userVar } from '@/apollo/store';
import { LOGIN, SIGN_UP } from '@/apollo/member/mutation';
import { MemberSession } from '@/libs/components/member/types/member';
import { MemberType } from '@/libs/components/member/enums/member.enum';

interface JwtPayload extends MemberSession { exp?: number; iat?: number; }

export const getJwtToken = () => (typeof window === 'undefined' ? '' : localStorage.getItem('accessToken') ?? '');
export const setJwtToken = (token: string) => localStorage.setItem('accessToken', token);

const syncSession = (token: string, member?: MemberSession) => {
	if (typeof window === 'undefined') return;
	setJwtToken(token);
	localStorage.setItem('login', Date.now().toString());
	try {
		const claims = jwtDecode<JwtPayload>(token);
		userVar({ ...claims, ...member, _id: String(member?._id ?? claims._id ?? ''), memberNick: member?.memberNick ?? claims.memberNick ?? '' });
	} catch (error) { console.warn('Unable to decode MN Hospital session', error); }
};

export const updateUserInfo = (token = getJwtToken()) => {
	if (!token) return;
	try { const claims = jwtDecode<JwtPayload>(token); userVar({ ...claims, _id: String(claims._id ?? ''), memberNick: claims.memberNick ?? '' }); }
	catch (error) { console.warn('Unable to restore session', error); }
};

export const logIn = async (memberNick: string, memberPassword: string) => {
	const result = await initializeApollo().mutate({ mutation: LOGIN, variables: { input: { memberNick, memberPassword } }, fetchPolicy: 'no-cache' });
	const member = result.data?.login as MemberSession | undefined;
	if (!member?.accessToken) throw new Error('Login failed');
	syncSession(member.accessToken, member);
	return member;
};

export const signUp = async (memberNick: string, memberPassword: string, memberPhone: string, memberFullName?: string) => {
	const result = await initializeApollo().mutate({ mutation: SIGN_UP, variables: { input: { memberNick, memberPassword, memberPhone, memberFullName, memberType: MemberType.PATIENT } }, fetchPolicy: 'no-cache' });
	const member = result.data?.signup as MemberSession | undefined;
	if (!member?.accessToken) throw new Error('Registration failed');
	syncSession(member.accessToken, member);
	return member;
};

export const logOut = () => {
	if (typeof window === 'undefined') return;
	localStorage.removeItem('accessToken');
	localStorage.setItem('logout', Date.now().toString());
	userVar({ _id: '', memberNick: '' });
	window.location.href = '/';
};
