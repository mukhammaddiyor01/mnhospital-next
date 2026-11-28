import { useEffect, useState, type ReactNode } from 'react';
import { ActivityIndicator, FlatList, Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { radius, spacing } from '@mnhospital/design-tokens';
import type { CatalogError } from '../features/catalog/catalogModel';
import { useMobileLocalization } from '../features/localization/MobileLocalizationProvider';
import { useTheme } from './theme';

export function Title({ children }: { children: ReactNode }) {
  const theme = useTheme();
  return <Text accessibilityRole="header" style={[styles.title, { color: theme.navy }]}>{children}</Text>;
}

export function Body({ children, muted }: { children: ReactNode; muted?: boolean }) {
  const theme = useTheme();
  return <Text style={[styles.body, { color: muted ? theme.muted : theme.text }]}>{children}</Text>;
}

export function Badge({ children }: { children: ReactNode }) {
  const theme = useTheme();
  return (
    <Text style={[styles.badge, { color: theme.primary, backgroundColor: theme.primarySoft }]}>{children}</Text>
  );
}

export function Button({ label, onPress, hint }: { label: string; onPress: () => void; hint?: string }) {
  const theme = useTheme();
  return (
    <Pressable
      accessibilityHint={hint}
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [styles.button, { backgroundColor: theme.primary, opacity: pressed ? 0.8 : 1 }]}
    >
      <Text style={[styles.buttonText, { color: theme.onPrimary }]}>{label}</Text>
    </Pressable>
  );
}

// Decorative: the card or screen title already names the subject.
export function Photo({ uri, name, variant }: { uri: string | null; name: string; variant: 'thumb' | 'hero' }) {
  const theme = useTheme();
  const [failed, setFailed] = useState(false);
  useEffect(() => setFailed(false), [uri]);
  const frame = [variant === 'hero' ? styles.hero : styles.thumb, { backgroundColor: theme.primarySoft }];

  if (!uri || failed) {
    return (
      <View style={[frame, styles.center]}>
        <Text style={[styles.initials, { color: theme.primary }]}>{name.slice(0, 1).toUpperCase()}</Text>
      </View>
    );
  }
  return <Image onError={() => setFailed(true)} source={{ uri }} style={frame} />;
}

export function Card({ children, onPress }: { children: ReactNode; onPress?: () => void }) {
  const theme = useTheme();
  const frame = [styles.card, { backgroundColor: theme.card, borderColor: theme.line }];
  if (!onPress) return <View style={frame}>{children}</View>;
  return (
    <Pressable
      accessibilityRole="link"
      onPress={onPress}
      style={({ pressed }) => [...frame, { opacity: pressed ? 0.8 : 1 }]}
    >
      {children}
    </Pressable>
  );
}

export function CardText({ title, lines, badge }: { title: string; lines: (string | null)[]; badge?: string | null }) {
  const theme = useTheme();
  return (
    <View style={styles.cardText}>
      {badge ? <Badge>{badge}</Badge> : null}
      <Text accessibilityRole="header" style={[styles.cardTitle, { color: theme.navy }]}>{title}</Text>
      {lines.filter(Boolean).map((line, index) => (
        <Text key={index} numberOfLines={2} style={[styles.meta, { color: theme.muted }]}>{line}</Text>
      ))}
    </View>
  );
}

export function StateView({ loading, error, onRetry }: {
  loading: boolean; error: CatalogError | null; onRetry: () => void;
}) {
  const theme = useTheme();
  const { t } = useMobileLocalization();
  return (
    <View style={styles.state}>
      {loading && <ActivityIndicator accessibilityLabel={t('common.loading')} color={theme.primary} />}
      {error && (
        <Text accessibilityRole="alert" style={[styles.stateText, { color: theme.muted }]}>
          {t(error === 'configuration' ? 'common.configurationError' : 'common.unavailable')}
        </Text>
      )}
      {error && <Button label={t('common.retry')} onPress={onRetry} />}
    </View>
  );
}

interface ListState<T> {
  items: T[]; loading: boolean; refreshing: boolean; error: CatalogError | null; hasMore: boolean;
  retry: () => void; refresh: () => void; loadMore: () => void;
}

export function CatalogList<T extends { id: string }>({ list, label, renderCard }: {
  list: ListState<T>; label: string; renderCard: (item: T) => ReactNode;
}) {
  const theme = useTheme();
  const { t } = useMobileLocalization();
  const { items, loading, refreshing, error, hasMore } = list;
  return (
    <FlatList
      accessibilityLabel={label}
      accessibilityState={{ busy: loading || refreshing }}
      style={{ backgroundColor: theme.page }}
      contentContainerStyle={styles.content}
      data={items}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => <>{renderCard(item)}</>}
      onRefresh={list.refresh}
      refreshing={refreshing}
      ListEmptyComponent={!loading && !error
        ? <Text accessibilityLiveRegion="polite" style={[styles.stateText, { color: theme.muted }]}>{t('common.empty')}</Text>
        : undefined}
      ListFooterComponent={
        <View style={styles.footer}>
          <StateView loading={loading && !refreshing} error={error} onRetry={list.retry} />
          {!loading && !error && hasMore && <Button label={t('common.loadMore')} onPress={list.loadMore} />}
        </View>
      }
    />
  );
}

export function Page({ children }: { children: ReactNode }) {
  const theme = useTheme();
  return (
    <ScrollView style={{ backgroundColor: theme.page }} contentContainerStyle={styles.content}>
      {children}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: { padding: spacing.md, gap: spacing.md, width: '100%', maxWidth: 720, alignSelf: 'center' },
  title: { fontSize: 24, fontWeight: '700' },
  body: { fontSize: 16, lineHeight: 24 },
  badge: { alignSelf: 'flex-start', borderRadius: radius.control, overflow: 'hidden', fontSize: 12,
    fontWeight: '700', paddingHorizontal: spacing.sm, paddingVertical: spacing.xs },
  button: { minHeight: 44, alignItems: 'center', justifyContent: 'center', paddingHorizontal: spacing.lg,
    borderRadius: radius.control },
  buttonText: { fontSize: 15, fontWeight: '700' },
  center: { alignItems: 'center', justifyContent: 'center' },
  thumb: { width: 80, height: 80, borderRadius: radius.control },
  hero: { width: '100%', aspectRatio: 4 / 3, borderRadius: radius.card },
  initials: { fontSize: 28, fontWeight: '700' },
  card: { flexDirection: 'row', gap: spacing.md, padding: spacing.md, borderWidth: 1,
    borderRadius: radius.card, minHeight: 44 },
  cardText: { flex: 1, gap: spacing.xs },
  cardTitle: { fontSize: 17, fontWeight: '700' },
  meta: { fontSize: 14, lineHeight: 20 },
  state: { alignItems: 'center', gap: spacing.md },
  stateText: { textAlign: 'center', fontSize: 15 },
  footer: { alignItems: 'center', gap: spacing.md, paddingVertical: spacing.md },
});
