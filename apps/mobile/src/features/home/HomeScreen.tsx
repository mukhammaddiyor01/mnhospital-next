import { router, type Href } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { radius, spacing } from '@mnhospital/design-tokens';
import { Page, StateView, Title } from '../../ui/components';
import { useTheme } from '../../ui/theme';
import { DoctorCard } from '../doctors/DoctorCard';
import { LanguageSwitcher } from '../localization/LanguageSwitcher';
import { useMobileLocalization } from '../localization/MobileLocalizationProvider';
import { ServiceCard } from '../services/ServiceCard';
import { useHomeViewModel } from './useHomeViewModel';

export function HomeScreen() {
  const { services, doctors, loading, error, retry } = useHomeViewModel();
  const { t } = useMobileLocalization();
  const theme = useTheme();

  return (
    <Page>
      <LanguageSwitcher />
      <View style={[styles.hero, { backgroundColor: theme.primarySoft }]}>
        <Text style={[styles.eyebrow, { color: theme.primary }]}>MN HOSPITAL</Text>
        <Title>{t('home.title')}</Title>
        <Text style={[styles.description, { color: theme.text }]}>{t('home.description')}</Text>
      </View>
      {services.length > 0 && <SectionHeader title={t('tabs.services')} href="/services" />}
      {services.map((service) => <ServiceCard key={service.id} service={service} />)}
      {doctors.length > 0 && <SectionHeader title={t('tabs.doctors')} href="/doctors" />}
      {doctors.map((doctor) => <DoctorCard key={doctor.id} doctor={doctor} />)}
      <StateView loading={loading} error={error} onRetry={retry} />
    </Page>
  );
}

function SectionHeader({ title, href }: { title: string; href: Href }) {
  const theme = useTheme();
  const { t } = useMobileLocalization();
  return (
    <View style={styles.section}>
      <Text accessibilityRole="header" style={[styles.sectionTitle, { color: theme.navy }]}>{title}</Text>
      <Pressable
        accessibilityLabel={`${t('home.seeAll')}: ${title}`}
        accessibilityRole="link"
        onPress={() => router.navigate(href)}
        style={styles.seeAll}
      >
        <Text style={[styles.seeAllText, { color: theme.primary }]}>{t('home.seeAll')}</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  hero: { borderRadius: radius.card, padding: spacing.lg, gap: spacing.sm },
  eyebrow: { fontSize: 12, fontWeight: '700', letterSpacing: 1 },
  description: { fontSize: 15, lineHeight: 22 },
  section: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  sectionTitle: { fontSize: 20, fontWeight: '700' },
  seeAll: { minHeight: 44, justifyContent: 'center', paddingHorizontal: spacing.sm },
  seeAllText: { fontSize: 14, fontWeight: '700' },
});
