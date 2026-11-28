import { useLocalSearchParams } from 'expo-router';
import { Badge, Body, Page, Photo, StateView, Title } from '../../ui/components';
import { useCatalogItem } from '../catalog/useCatalog';
import { useMobileLocalization } from '../localization/MobileLocalizationProvider';

export function DoctorDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { item, error, retry } = useCatalogItem('doctors', id);
  const { t, label } = useMobileLocalization();

  if (!item) return <Page><StateView loading={!error} error={error} onRetry={retry} /></Page>;

  return (
    <Page>
      <Photo uri={item.image} name={item.name} variant="hero" />
      {item.specialty && <Badge>{label(item.specialty)}</Badge>}
      <Title>{item.name}</Title>
      {item.experience !== null && <Body>{t('doctors.experience')}: {item.experience}</Body>}
      {item.address && <Body>{t('doctors.address')}: {item.address}</Body>}
      {item.description && <Body muted>{item.description}</Body>}
    </Page>
  );
}
