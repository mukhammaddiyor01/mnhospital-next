import { CatalogList } from '../../ui/components';
import { useCatalogList } from '../catalog/useCatalog';
import { useMobileLocalization } from '../localization/MobileLocalizationProvider';
import { DoctorCard } from './DoctorCard';

export function DoctorsScreen() {
  const list = useCatalogList('doctors');
  const { t } = useMobileLocalization();
  return <CatalogList label={t('doctors.listLabel')} list={list} renderCard={(item) => <DoctorCard doctor={item} />} />;
}
