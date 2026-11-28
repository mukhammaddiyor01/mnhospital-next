import { router, useLocalSearchParams } from 'expo-router';
import { Badge, Body, Button, Card, CardText, Page, Photo, StateView, Title } from '../../ui/components';
import { formatPrice } from '../catalog/catalogModel';
import { useMobileLocalization } from '../localization/MobileLocalizationProvider';
import { useServiceDetailViewModel } from './useServiceDetailViewModel';

export function ServiceDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { item, error, retry, openWebsite } = useServiceDetailViewModel(id);
  const { t, label } = useMobileLocalization();

  if (!item) return <Page><StateView loading={!error} error={error} onRetry={retry} /></Page>;

  const { doctor } = item;
  return (
    <Page>
      <Photo uri={item.image} name={item.title} variant="hero" />
      {item.type && <Badge>{label(item.type)}</Badge>}
      <Title>{item.title}</Title>
      {item.price !== null && <Body>{t('services.price')}: {formatPrice(item.price)}</Body>}
      {item.discountPercent > 0 && <Body>{t('services.discount')}: {item.discountPercent}%</Body>}
      {item.duration && <Body>{t('services.duration')}: {item.duration} {t('common.minutes')}</Body>}
      {item.description && <Body muted>{item.description}</Body>}
      {doctor && (
        <Card onPress={() => router.push(`/doctor/${doctor.id}`)}>
          <CardText title={doctor.name} lines={[label(doctor.specialty)]} />
        </Card>
      )}
      {openWebsite && <Button hint={t('services.bookHint')} label={t('services.book')} onPress={openWebsite} />}
    </Page>
  );
}
