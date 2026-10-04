import { useEffect, useState } from 'react';
import { useMutation, useReactiveVar } from '@apollo/client';
import { useRouter } from 'next/router';
import { userVar } from '@/apollo/store';
import { SUBSCRIBE_DOCTOR, SUBSCRIBE_MEMBER, UNSUBSCRIBE_DOCTOR, UNSUBSCRIBE_MEMBER } from '@/apollo/follow/mutation';

const FollowButton = ({ targetId, kind, initialFollowing = false, onChanged }: { targetId: string; kind: 'doctor' | 'member'; initialFollowing?: boolean; onChanged?: () => Promise<unknown> }) => {
	const router = useRouter();
	const user = useReactiveVar(userVar);
	const [following, setFollowing] = useState(initialFollowing);
	const [error, setError] = useState('');
	const [subscribeDoctor, doctorSubscribeState] = useMutation(SUBSCRIBE_DOCTOR);
	const [unsubscribeDoctor, doctorUnsubscribeState] = useMutation(UNSUBSCRIBE_DOCTOR);
	const [subscribeMember, memberSubscribeState] = useMutation(SUBSCRIBE_MEMBER);
	const [unsubscribeMember, memberUnsubscribeState] = useMutation(UNSUBSCRIBE_MEMBER);
	useEffect(() => setFollowing(initialFollowing), [initialFollowing, targetId]);
	if (user._id === targetId) return null;
	const busy = doctorSubscribeState.loading || doctorUnsubscribeState.loading || memberSubscribeState.loading || memberUnsubscribeState.loading;
	const toggle = async () => {
		setError('');
		if (!user._id) { await router.push(`/account/signin?redirect=${encodeURIComponent(router.asPath)}`); return; }
		try {
			const mutation = kind === 'doctor' ? (following ? unsubscribeDoctor : subscribeDoctor) : (following ? unsubscribeMember : subscribeMember);
			await mutation({ variables: { input: targetId } });
			setFollowing((value) => !value);
			await onChanged?.();
		} catch (requestError) { setError(requestError instanceof Error ? requestError.message : 'Follow action failed.'); }
	};
	return <span className="clinical-follow-control"><button className={following ? 'clinical-secondary-button' : 'clinical-primary-button'} type="button" onClick={() => void toggle()} disabled={busy} aria-pressed={following}>{busy ? 'Saving…' : following ? 'Following' : 'Follow'}</button>{error && <small role="alert">{error}</small>}</span>;
};

export default FollowButton;
