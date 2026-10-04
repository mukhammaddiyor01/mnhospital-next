import React, { useEffect } from 'react';
import { DocumentNode, useMutation, useReactiveVar } from '@apollo/client';
import { useRouter } from 'next/router';
import { userVar } from '@/apollo/store';
import Icon from './Icon';

interface LikeButtonProps { mutation: DocumentNode; id: string; variableName: string; initialLiked?: boolean; label?: string; }

const LikeButton = ({ mutation, id, variableName, initialLiked = false, label }: LikeButtonProps) => {
	const router = useRouter();
	const user = useReactiveVar(userVar);
	const [liked, setLiked] = React.useState(initialLiked);
	useEffect(() => setLiked(initialLiked), [initialLiked, id]);
	const [likeTarget, { loading }] = useMutation(mutation);

	const clickHandler = async (event: React.MouseEvent<HTMLButtonElement>) => {
		event.preventDefault(); event.stopPropagation();
		if (!user._id) { await router.push(`/account/signin?redirect=${encodeURIComponent(router.asPath)}`); return; }
		try { await likeTarget({ variables: { [variableName]: id } }); setLiked((value) => !value); } catch (error) { console.warn('Like action failed', error); }
	};

	return <button type="button" className={`like-button ${liked ? 'liked' : ''}`} onClick={clickHandler} disabled={loading} aria-label={label ?? (liked ? 'Remove like' : 'Like')} aria-pressed={liked}><Icon name={liked ? 'favorite' : 'favorite_border'} /></button>;
};

export default LikeButton;
