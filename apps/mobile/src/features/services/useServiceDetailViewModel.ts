import { Linking } from 'react-native';
import { websiteUrl } from '../catalog/catalogApi';
import { useCatalogItem } from '../catalog/useCatalog';

export function useServiceDetailViewModel(id: string) {
  const state = useCatalogItem('services', id);
  const website = state.item ? websiteUrl(`/service/${state.item.id}`) : null;
  return {
    ...state,
    openWebsite: website ? () => { Linking.openURL(website).catch(() => {}); } : null,
  };
}
