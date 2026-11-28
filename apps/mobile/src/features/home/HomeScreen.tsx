import { SafeAreaView } from 'react-native-safe-area-context';
import { StyleSheet, Text, View } from 'react-native';
import { Link } from 'expo-router';
import { colors, spacing } from '@mnhospital/design-tokens';
import { LanguageSwitcher } from '../localization/LanguageSwitcher';
import { useMobileLocalization } from '../localization/MobileLocalizationProvider';
import { useHomeViewModel } from './useHomeViewModel';

export function HomeScreen() {
  const { status } = useHomeViewModel();
  const { t } = useMobileLocalization();

  return (
    <SafeAreaView style={styles.screen}>
      <View style={styles.content}>
        <LanguageSwitcher />
        <Text style={styles.eyebrow}>{status}</Text>
        <Text accessibilityRole="header" style={styles.title}>{t('home.title')}</Text>
        <Text style={styles.description}>{t('home.description')}</Text>
        <Link
          accessibilityHint={t('home.servicesHint')}
          accessibilityRole="link"
          href="/services"
          style={styles.servicesLink}
        >
          {t('home.services')}
        </Link>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.canvas },
  content: { flex: 1, justifyContent: 'center', padding: spacing.xl, gap: spacing.md },
  eyebrow: { color: colors.primary, fontSize: 14, fontWeight: '700' },
  title: { color: colors.text, fontSize: 32, fontWeight: '700' },
  description: { color: colors.muted, fontSize: 16, lineHeight: 24 },
  servicesLink: {
    alignSelf: 'flex-start',
    color: colors.primary,
    fontSize: 16,
    fontWeight: '700',
    justifyContent: 'center',
    minHeight: 44,
    paddingVertical: spacing.sm,
  },
});
