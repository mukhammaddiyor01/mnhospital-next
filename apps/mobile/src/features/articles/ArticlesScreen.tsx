import { router } from 'expo-router';
import { CatalogList, Card, CardText, Photo } from '../../ui/components';
import { useCatalogList } from '../catalog/useCatalog';
import { useMobileLocalization } from '../localization/MobileLocalizationProvider';

export function ArticlesScreen() {
  const list = useCatalogList('articles');
  const { t, label } = useMobileLocalization();
  return (
    <CatalogList
      label={t('articles.listLabel')}
      list={list}
      renderCard={(article) => (
        <Card onPress={() => router.push(`/article/${article.id}`)}>
          <Photo uri={article.image} name={article.title} variant="thumb" />
          <CardText badge={label(article.category)} title={article.title} lines={[article.paragraphs[0] ?? null]} />
        </Card>
      )}
    />
  );
}
