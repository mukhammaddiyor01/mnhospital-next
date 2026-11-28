import { DoctorSpecialty } from '@/libs/components/doctor/enums/doctor.enum';
import { MessageKey } from './messages';
import { useTranslation } from './useTranslation';
import { useWorkspaceText, WorkspaceTextKey } from '@/libs/components/workspace/useWorkspaceText';

const specialtyKeys: Partial<Record<DoctorSpecialty, MessageKey>> = {
	[DoctorSpecialty.GENERAL_PRACTITIONER]: 'doctors.general',
	[DoctorSpecialty.CARDIOLOGIST]: 'doctors.cardiology',
	[DoctorSpecialty.DENTIST]: 'doctors.dentistry',
	[DoctorSpecialty.PEDIATRICIAN]: 'doctors.pediatrics',
	[DoctorSpecialty.DERMATOLOGIST]: 'doctors.dermatology',
	[DoctorSpecialty.NEUROLOGIST]: 'doctors.neurology',
	[DoctorSpecialty.SURGEON]: 'doctors.surgery',
};
const extendedKeys: Partial<Record<DoctorSpecialty, WorkspaceTextKey>> = {
	[DoctorSpecialty.UROLOGIST]: 'specialtyUrology',
	[DoctorSpecialty.OPHTHALMOLOGIST]: 'specialtyOphthalmology',
	[DoctorSpecialty.NEUROSURGEON]: 'specialtyNeurosurgery',
	[DoctorSpecialty.PLASTIC_SURGEON]: 'specialtyPlasticSurgery',
	[DoctorSpecialty.OBSTETRICIAN_GYNECOLOGIST]: 'specialtyObstetrics',
	[DoctorSpecialty.FAMILY_PHYSICIAN]: 'specialtyFamilyMedicine',
};

export const useDoctorSpecialtyLabel = () => {
	const t = useTranslation();
	const w = useWorkspaceText();
	return (specialty?: string) => {
		if (!specialty) return t('doctors.specialtyFallback');
		const key = specialtyKeys[specialty as DoctorSpecialty];
		const extended = extendedKeys[specialty as DoctorSpecialty];
		if (extended) return w(extended);
		return key ? t(key) : specialty.replaceAll('_', ' ');
	};
};
