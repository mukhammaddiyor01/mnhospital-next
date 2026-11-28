import Link from 'next/link';
import { useTranslation } from '@/libs/i18n/useTranslation';

const MnLogo = ({ footer = false }: { footer?: boolean }) => {
	const t = useTranslation();
	return <Link className={`mn-logo${footer ? ' mn-logo--footer' : ''}`} href="/" aria-label={t('site.homeLink')}>
	<img className="mn-logo__mark" src="/img/mn-logo-mark.png" alt="" width={64} height={40} />
	<span className="mn-logo__name">MN Hospital</span>
</Link>;
};

export default MnLogo;
