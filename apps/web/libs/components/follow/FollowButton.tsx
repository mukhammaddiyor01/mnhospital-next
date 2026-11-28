import { useEffect, useRef, useState } from 'react';
import { useApolloClient, useMutation, useReactiveVar } from '@apollo/client';
import { useRouter } from 'next/router';
import { userVar } from '@/apollo/store';
import { SUBSCRIBE_DOCTOR, SUBSCRIBE_MEMBER, UNSUBSCRIBE_DOCTOR, UNSUBSCRIBE_MEMBER } from '@/apollo/follow/mutation';
import { useTranslation } from '@/libs/i18n/useTranslation';
import { refreshFollowViews } from './refreshFollowViews';

const FollowButton = ({ targetId, kind, initialFollowing = false, onChanged }: { targetId: string; kind: 'doctor' | 'member'; initialFollowing?: boolean; onChanged?: () => Promise<unknown> }) => {
	const t = useTranslation();
	const router = useRouter();
	const client = useApolloClient();
	const user = useReactiveVar(userVar);
	const [following, setFollowing] = useState(initialFollowing);
	const [error, setError] = useState('');
	const [refreshing, setRefreshing] = useState(false);
	const lock = useRef(false);
	const [subscribeDoctor, doctorSubscribeState] = useMutation(SUBSCRIBE_DOCTOR);
	const [unsubscribeDoctor, doctorUnsubscribeState] = useMutation(UNSUBSCRIBE_DOCTOR);
	const [subscribeMember, memberSubscribeState] = useMutation(SUBSCRIBE_MEMBER);
	const [unsubscribeMember, memberUnsubscribeState] = useMutation(UNSUBSCRIBE_MEMBER);
	useEffect(() => { setFollowing(initialFollowing); setError(''); }, [initialFollowing, targetId, user._id]);
	if (user._id === targetId || (user._id && !['PATIENT', 'DOCTOR'].includes(String(user.memberType)))) return null;
	const busy = refreshing || doctorSubscribeState.loading || doctorUnsubscribeState.loading || memberSubscribeState.loading || memberUnsubscribeState.loading;
	const toggle = async () => {
		if (busy || lock.current) return;
		setError('');
		if (!user._id) { await router.push(`/account/signin?redirect=${encodeURIComponent(router.asPath)}`); return; }
		lock.current = true;
		setRefreshing(true);
		try {
			const mutation = kind === 'doctor' ? (following ? unsubscribeDoctor : subscribeDoctor) : (following ? unsubscribeMember : subscribeMember);
			await mutation({ variables: { input: targetId }, context: { expectedAccount: `${user.memberType}:${user._id}` } });
			setFollowing((value) => !value);
			await refreshFollowViews(client, kind, onChanged).catch(() => setError(t('follow.refreshError')));
		} catch (requestError) { setError(requestError instanceof Error ? requestError.message : t('follow.actionError')); }
		finally { lock.current = false; setRefreshing(false); }
	};
	return <span className="clinical-follow-control"><button className={following ? 'clinical-secondary-button' : 'clinical-primary-button'} type="button" onClick={() => void toggle()} disabled={busy} aria-pressed={following}>{busy ? t('follow.saving') : following ? t('follow.followingAction') : t('follow.action')}</button>{error && <small role="alert">{error}</small>}</span>;
};

export default FollowButton;
