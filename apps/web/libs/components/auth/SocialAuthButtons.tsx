import { SocialAuthMode, SocialProvider, startSocialAuth } from '@/libs/auth';
import { useTranslation } from '@/libs/i18n/useTranslation';

const providers: Array<{ id: SocialProvider; label: string; mark: string }> = [
	{ id: 'GOOGLE', label: 'Google', mark: 'G' },
	{ id: 'NAVER', label: 'Naver', mark: 'N' },
	{ id: 'KAKAO', label: 'Kakao', mark: 'K' },
];

interface SocialAuthButtonsProps {
	mode: SocialAuthMode;
	disabled?: boolean;
	onError: (message: string) => void;
}

const SocialAuthButtons = ({ mode, disabled, onError }: SocialAuthButtonsProps) => {
	const t = useTranslation();
	const connect = async (provider: SocialProvider) => {
		onError('');
		try { await startSocialAuth(provider, mode); }
		catch (error: unknown) { onError(error instanceof Error ? error.message : t('auth.socialError')); }
	};

	return <div className="clinical-social-auth">
		<div className="clinical-auth-divider"><span>{t('auth.socialDivider')}</span></div>
		<div className="clinical-social-grid">
			{providers.map((provider) => <button key={provider.id} type="button" className={`clinical-social-button is-${provider.id.toLowerCase()}`} onClick={() => connect(provider.id)} disabled={disabled} aria-label={`${mode === 'login' ? t('auth.socialSignin') : t('auth.socialSignup')} ${t('auth.socialWith')} ${provider.label}`}>
				<span aria-hidden="true">{provider.mark}</span>{provider.label}
			</button>)}
		</div>
	</div>;
};

export default SocialAuthButtons;
