import { useState } from 'react';
import { resolveApiAsset } from '@/libs/config';
import styles from './ProfileAvatar.module.scss';

export default function ProfileAvatar({ image, name, className = '' }: { image?: string | null; name: string; className?: string }) {
 const source = resolveApiAsset(image);
 const [failed, setFailed] = useState('');
 const initials = name.trim().split(/\s+/).filter(Boolean).slice(0,2).map(word => word[0]).join('').toUpperCase() || 'MN';
 return <span className={`${className} ${styles.avatar}`} aria-hidden="true">
  {source && source !== failed ? <img src={source} alt="" width={96} height={96} decoding="async" onError={() => setFailed(source)} /> : initials}
 </span>;
}
