import { CatalogList } from '../../ui/components';
import { useCatalogList } from '../catalog/useCatalog';
import { useMobileLocalization } from '../localization/MobileLocalizationProvider';
import { ServiceCard } from './ServiceCard';

export function ServicesScreen() {
  const list = useCatalogList('services');
  const { t } = useMobileLocalization();
  return (
    <CatalogList label={t('services.listLabel')} list={list} renderCard={(item) => <ServiceCard service={item} />} />
  );
}
