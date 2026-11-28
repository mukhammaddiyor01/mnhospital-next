import { MouseEvent, useEffect, useState } from 'react';
import Icon from './Icon';
import { useTranslation } from '@/libs/i18n/useTranslation';

const BackToTop = () => {
	const t = useTranslation();
	const [visible, setVisible] = useState(false);

	useEffect(() => {
		const updateVisibility = () => {
			const offset = window.scrollY;
			setVisible((current) => offset > (current ? 0 : 300));
		};
		updateVisibility();
		window.addEventListener('scroll', updateVisibility, { passive: true });
		return () => window.removeEventListener('scroll', updateVisibility);
	}, []);

	const scrollToTop = (event: MouseEvent<HTMLButtonElement>) => {
		event.currentTarget.blur();
		const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
		window.scrollTo({ top: 0, behavior: reducedMotion ? 'instant' : 'smooth' });
	};

	return (
		<button
			type="button"
			className={`clinical-back-to-top${visible ? ' is-visible' : ''}`}
			aria-label={t('nav.backToTop')}
			title={t('nav.backToTop')}
			aria-hidden={!visible}
			tabIndex={visible ? 0 : -1}
			onClick={scrollToTop}
		>
			<Icon name="arrow_upward" />
		</button>
	);
};

export default BackToTop;
