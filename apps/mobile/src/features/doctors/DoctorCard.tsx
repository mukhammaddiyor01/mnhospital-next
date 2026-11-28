import { router } from 'expo-router';
import { Card, CardText, Photo } from '../../ui/components';
import type { Doctor } from '../catalog/catalogModel';
import { useMobileLocalization } from '../localization/MobileLocalizationProvider';

export function DoctorCard({ doctor }: { doctor: Doctor }) {
  const { t, label } = useMobileLocalization();
  return (
    <Card onPress={() => router.push(`/doctor/${doctor.id}`)}>
      <Photo uri={doctor.image} name={doctor.name} variant="thumb" />
      <CardText
        badge={label(doctor.specialty)}
        title={doctor.name}
        lines={[doctor.experience === null ? null : `${t('doctors.experience')}: ${doctor.experience}`]}
      />
    </Card>
  );
}
