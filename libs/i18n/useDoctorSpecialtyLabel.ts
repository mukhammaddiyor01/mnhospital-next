import { DoctorSpecialty } from '@/libs/components/doctor/enums/doctor.enum';
import { MessageKey } from './messages';
import { useTranslation } from './useTranslation';

const specialtyKeys: Record<DoctorSpecialty, MessageKey> = {
	[DoctorSpecialty.GENERAL_PRACTITIONER]: 'doctors.general',
	[DoctorSpecialty.CARDIOLOGIST]: 'doctors.cardiology',
	[DoctorSpecialty.DENTIST]: 'doctors.dentistry',
	[DoctorSpecialty.PEDIATRICIAN]: 'doctors.pediatrics',
	[DoctorSpecialty.DERMATOLOGIST]: 'doctors.dermatology',
	[DoctorSpecialty.NEUROLOGIST]: 'doctors.neurology',
	[DoctorSpecialty.SURGEON]: 'doctors.surgery',
};

export const useDoctorSpecialtyLabel = () => {
	const t = useTranslation();
	return (specialty?: string) => {
		if (!specialty) return t('doctors.specialtyFallback');
		const key = specialtyKeys[specialty as DoctorSpecialty];
		return key ? t(key) : specialty.replaceAll('_', ' ');
	};
};
