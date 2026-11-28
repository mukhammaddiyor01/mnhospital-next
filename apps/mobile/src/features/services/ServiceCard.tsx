import { router } from 'expo-router';
import { Card, CardText, Photo } from '../../ui/components';
import { formatPrice, type Service } from '../catalog/catalogModel';
import { useMobileLocalization } from '../localization/MobileLocalizationProvider';

export function ServiceCard({ service }: { service: Service }) {
  const { t, label } = useMobileLocalization();
  // The list price and discount are shown as returned; the server computes the amount to pay.
  const price = service.price === null ? null : formatPrice(service.price);
  const discount = service.discountPercent > 0 ? `−${service.discountPercent}%` : null;
  return (
    <Card onPress={() => router.push(`/service/${service.id}`)}>
      <Photo uri={service.image} name={service.title} variant="thumb" />
      <CardText
        badge={label(service.type)}
        title={service.title}
        lines={[
          service.doctor?.name ?? null,
          [price, discount, service.duration && `${service.duration} ${t('common.minutes')}`].filter(Boolean).join(' · '),
        ]}
      />
    </Card>
  );
}
