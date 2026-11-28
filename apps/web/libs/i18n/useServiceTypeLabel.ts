import { ServiceType } from '@/libs/components/service/enums/service.enum';
import { MessageKey } from './messages';
import { useTranslation } from './useTranslation';
import { useWorkspaceText, WorkspaceTextKey } from '@/libs/components/workspace/useWorkspaceText';

const typeKeys: Partial<Record<ServiceType, MessageKey>> = {
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
const extendedKeys: Partial<Record<ServiceType, WorkspaceTextKey>> = {
	[ServiceType.UROLOGY]: 'specialtyUrology',
	[ServiceType.OPHTHAL]: 'specialtyOphthalmology',
	[ServiceType.NEUROSURGERY]: 'specialtyNeurosurgery',
	[ServiceType.PLASTIC_SURGERY]: 'specialtyPlasticSurgery',
	[ServiceType.OBSTETRICS_GYNECOLOGY]: 'specialtyObstetrics',
	[ServiceType.FAMILY_MEDICINE]: 'specialtyFamilyMedicine',
};

export const useServiceTypeLabel = () => {
	const t = useTranslation();
	const w = useWorkspaceText();
	return (type?: string) => {
		if (!type) return t('services.clinicalCare');
		const key = typeKeys[type as ServiceType];
		const extended = extendedKeys[type as ServiceType];
		if (extended) return w(extended);
		return key ? t(key) : type.replaceAll('_', ' ');
	};
};
