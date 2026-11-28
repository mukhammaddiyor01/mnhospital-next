import { useLocalSearchParams } from 'expo-router';
import { Badge, Body, Page, Photo, StateView, Title } from '../../ui/components';
import { formatByline } from '../catalog/catalogModel';
import { useCatalogItem } from '../catalog/useCatalog';
import { useMobileLocalization } from '../localization/MobileLocalizationProvider';

export function ArticleDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { item, error, retry } = useCatalogItem('articles', id);
  const { label, locale } = useMobileLocalization();

  if (!item) return <Page><StateView loading={!error} error={error} onRetry={retry} /></Page>;

  const byline = formatByline(item.author, item.createdAt, locale);
  return (
    <Page>
      <Photo uri={item.image} name={item.title} variant="hero" />
      {item.category && <Badge>{label(item.category)}</Badge>}
      <Title>{item.title}</Title>
      {byline ? <Body muted>{byline}</Body> : null}
      {item.paragraphs.map((paragraph, index) => <Body key={index}>{paragraph}</Body>)}
    </Page>
  );
}
