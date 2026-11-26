import { Link } from 'expo-router';
import { ActivityIndicator, FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, spacing } from '@mnhospital/design-tokens';
import type { PublicService } from './serviceModel';
import { useServicesViewModel } from './useServicesViewModel';

export function ServicesScreen() {
  const { services, loading, error, hasMore, retry, loadMore } = useServicesViewModel();

  return (
    <SafeAreaView style={styles.screen}>
      <FlatList
        accessibilityLabel="Hospital services"
        accessibilityState={{ busy: loading }}
        data={services}
        keyExtractor={(service) => service.id}
        contentContainerStyle={styles.content}
        ListHeaderComponent={
          <View style={styles.header}>
            <Link
              accessibilityHint="Returns to the MN Hospital welcome screen"
              accessibilityRole="link"
              href="/"
              style={styles.back}
            >
              ← Home
            </Link>
            <Text accessibilityRole="header" style={styles.title}>Services</Text>
            <Text style={styles.subtitle}>Explore current hospital services.</Text>
          </View>
        }
        renderItem={({ item }) => <ServiceCard service={item} />}
        ListEmptyComponent={!loading && !error
          ? <Text accessibilityLiveRegion="polite" style={styles.message}>No services are available right now.</Text>
          : undefined}
        ListFooterComponent={
          <View style={styles.footer}>
            {loading && <ActivityIndicator accessibilityLabel="Loading services" color={colors.primary} />}
            {error && <Text accessibilityRole="alert" style={styles.message}>{error}</Text>}
            {error && <Action label="Retry" onPress={retry} />}
            {!loading && !error && hasMore && <Action label="Load more" onPress={loadMore} />}
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
