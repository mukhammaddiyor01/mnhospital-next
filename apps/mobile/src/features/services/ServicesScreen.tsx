import { Link } from 'expo-router';
import { ActivityIndicator, FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, spacing } from '@mnhospital/design-tokens';
import { LanguageSwitcher } from '../localization/LanguageSwitcher';
import { useMobileLocalization } from '../localization/MobileLocalizationProvider';
import type { PublicService } from './serviceModel';
import { useServicesViewModel } from './useServicesViewModel';

export function ServicesScreen() {
  const { services, loading, refreshing, error, hasMore, retry, refresh, loadMore } = useServicesViewModel();
  const { t } = useMobileLocalization();
  const errorMessage = error === 'configuration'
    ? t('services.configurationError')
    : t('services.unavailable');

  return (
    <SafeAreaView style={styles.screen}>
      <FlatList
        accessibilityLabel={t('services.listLabel')}
        accessibilityState={{ busy: loading || refreshing }}
        data={services}
        keyExtractor={(service) => service.id}
        contentContainerStyle={styles.content}
        onRefresh={refresh}
        refreshing={refreshing}
        ListHeaderComponent={
          <View style={styles.header}>
            <LanguageSwitcher />
            <Link
              accessibilityHint={t('services.homeHint')}
              accessibilityRole="link"
              href="/"
              style={styles.back}
            >
              ← {t('services.home')}
            </Link>
            <Text accessibilityRole="header" style={styles.title}>{t('services.title')}</Text>
            <Text style={styles.subtitle}>{t('services.subtitle')}</Text>
          </View>
        }
        renderItem={({ item }) => <ServiceCard service={item} />}
        ListEmptyComponent={!loading && !error
          ? <Text accessibilityLiveRegion="polite" style={styles.message}>{t('services.empty')}</Text>
          : undefined}
        ListFooterComponent={
          <View style={styles.footer}>
            {loading && !refreshing && <ActivityIndicator accessibilityLabel={t('services.loading')} color={colors.primary} />}
            {error && <Text accessibilityRole="alert" style={styles.message}>{errorMessage}</Text>}
            {error && <Action label={t('services.retry')} onPress={retry} />}
            {!loading && !error && hasMore && <Action label={t('services.loadMore')} onPress={loadMore} />}
          </View>
        }
      />
    </SafeAreaView>
  );
}

function ServiceCard({ service }: { service: PublicService }) {
  return (
    <View style={styles.card}>
      <Text accessibilityRole="header" style={styles.cardTitle}>{service.title}</Text>
      {service.description && <Text style={styles.description}>{service.description}</Text>}
    </View>
  );
}

function Action({ label, onPress }: { label: string; onPress: () => void }) {
  return (
    <Pressable accessibilityRole="button" onPress={onPress} style={styles.button}>
      <Text style={styles.buttonText}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.canvas },
  content: { padding: spacing.lg, gap: spacing.md },
  header: { gap: spacing.sm, marginBottom: spacing.md },
  back: {
    alignSelf: 'flex-start',
    color: colors.primary,
    fontSize: 16,
    justifyContent: 'center',
    minHeight: 44,
    paddingVertical: spacing.sm,
  },
  title: { color: colors.text, fontSize: 30, fontWeight: '700' },
  subtitle: { color: colors.muted, fontSize: 15 },
  card: { padding: spacing.lg, backgroundColor: '#fff', borderRadius: 16, gap: spacing.sm },
  cardTitle: { color: colors.text, fontSize: 18, fontWeight: '700' },
  description: { color: colors.muted, fontSize: 14, lineHeight: 21 },
  footer: { alignItems: 'center', gap: spacing.md, paddingVertical: spacing.lg },
  message: { color: colors.muted, textAlign: 'center', fontSize: 15 },
  button: { minHeight: 44, justifyContent: 'center', paddingHorizontal: spacing.lg,
    borderRadius: 10, backgroundColor: colors.primary },
  buttonText: { color: '#fff', fontSize: 15, fontWeight: '700' },
});
