import React, { useEffect, useRef, useState } from 'react';
import { DocumentNode, useMutation, useReactiveVar } from '@apollo/client';
import { useRouter } from 'next/router';
import { userVar } from '@/apollo/store';
import Icon from './Icon';
import { useTranslation } from '@/libs/i18n/useTranslation';

interface LikeButtonProps { mutation: DocumentNode; id: string; variableName: string; initialLiked?: boolean; label?: string; onChanged?: () => Promise<unknown>; }
const LikeButton = ({ mutation, id, variableName, initialLiked = false, label, onChanged }: LikeButtonProps) => {
 const t = useTranslation(), router = useRouter(), user = useReactiveVar(userVar);
 const [liked, setLiked] = useState(initialLiked), [error, setError] = useState('');
 const lock = useRef(false);
 useEffect(() => { setLiked(initialLiked); setError(''); }, [initialLiked, id, user._id]);
 const [likeTarget, { loading }] = useMutation<Record<string, { meLiked?: Array<{ myFavorite: boolean }> }>>(mutation);
 const clickHandler = async (event: React.MouseEvent<HTMLButtonElement>) => {
  event.preventDefault(); event.stopPropagation();
  if (lock.current) return;
  if (!user._id) { await router.push(`/account/signin?redirect=${encodeURIComponent(router.asPath)}`); return; }
  lock.current = true; setError('');
  try {
   const { data } = await likeTarget({ variables: { [variableName]: id }, context: { expectedAccount: `${user.memberType}:${user._id}` } });
   const result = data && Object.values(data)[0];
   setLiked(result?.meLiked ? Boolean(result.meLiked[0]?.myFavorite) : !liked);
   await onChanged?.();
  } catch { setError(t('like.actionError')); }
  finally { lock.current = false; }
 };
 return <span className="clinical-like-control"><button type="button" className={`like-button ${liked ? 'liked' : ''}`} onClick={clickHandler} disabled={loading} aria-label={label ?? (liked ? t('like.remove') : t('like.add'))} aria-pressed={liked}><Icon name={liked ? 'favorite' : 'favorite_border'} /></button>{error && <small role="alert">{error}</small>}</span>;
};
export default LikeButton;
