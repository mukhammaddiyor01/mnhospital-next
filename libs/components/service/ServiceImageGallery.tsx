import { useState } from 'react';
import { resolveApiAsset } from '@/libs/config';
import { usePreferences } from '@/libs/components/preference/PreferenceProvider';
import styles from './ServiceImageGallery.module.scss';

export default function ServiceImageGallery({ images = [], title }: { images?: string[]; title: string }) {
 const { language } = usePreferences();
 const [selected, setSelected] = useState('');
 const [failed, setFailed] = useState<string[]>([]);
 const sources = Array.from(new Set(images.map(resolveApiAsset).filter(Boolean))).filter(source => !failed.includes(source));
 const active = sources.includes(selected) ? selected : sources[0];
 const labels = { EN: { gallery: 'Service images', image: 'Image' }, UZ: { gallery: 'Xizmat rasmlari', image: 'Rasm' }, KR: { gallery: '서비스 사진', image: '사진' } }[language];
 if (!active) return null;
 const onError = (source: string) => setFailed(current => current.includes(source) ? current : [...current, source]);
 return <section className={styles.gallery} aria-label={labels.gallery}>
  <div className={styles.main}><img src={active} alt={title} width={960} height={600} decoding="async" onError={() => onError(active)} /></div>
  {sources.length > 1 && <div className={styles.thumbnails}>{sources.map((source,index) => <button type="button" key={source} aria-label={`${labels.image} ${index+1}: ${title}`} aria-pressed={active === source} onClick={() => setSelected(source)}><img src={source} alt="" width={72} height={60} loading="lazy" decoding="async" onError={() => onError(source)} /></button>)}</div>}
 </section>;
}
