import { ServiceType } from '@/libs/components/service/enums/service.enum';
import { MessageKey } from './messages';
import { useTranslation } from './useTranslation';

const typeKeys: Record<ServiceType, MessageKey> = {
	[ServiceType.CONSULTATION]: 'services.consultation',
	[ServiceType.DIAGNOSTIC]: 'services.diagnostic',
	[ServiceType.PROCEDURE]: 'services.procedure',
	[ServiceType.THERAPY]: 'services.therapy',
	[ServiceType.LABORATORY]: 'services.laboratory',
	[ServiceType.DENTISTRY]: 'services.dentistry',
	[ServiceType.PEDIATRICS]: 'services.pediatrics',
	[ServiceType.NEUROLOGY]: 'services.neurology',
	[ServiceType.CARDIOLOGY]: 'services.cardiology',
	[ServiceType.DERMATOLOGY]: 'services.dermatology',
};

export const useServiceTypeLabel = () => {
	const t = useTranslation();
	return (type?: string) => {
		if (!type) return t('services.clinicalCare');
		const key = typeKeys[type as ServiceType];
		return key ? t(key) : type.replaceAll('_', ' ');
	};
};
