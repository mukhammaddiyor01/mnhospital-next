import { usePreferences } from '@/libs/components/preference/PreferenceProvider';
import { MessageKey, translate } from './messages';

export const useTranslation = () => {
	const { language } = usePreferences();
	return (key: MessageKey) => translate(language, key);
};
