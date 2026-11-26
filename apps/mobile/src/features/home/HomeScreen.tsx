import { SafeAreaView } from 'react-native-safe-area-context';
import { StyleSheet, Text, View } from 'react-native';
import { Link } from 'expo-router';
import { colors, spacing } from '@mnhospital/design-tokens';
import { useHomeViewModel } from './useHomeViewModel';

export function HomeScreen() {
  const { title, description, status } = useHomeViewModel();

  return (
    <SafeAreaView style={styles.screen}>
      <View style={styles.content}>
        <Text style={styles.eyebrow}>{status}</Text>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.description}>{description}</Text>
        <Link href="/services" style={styles.servicesLink}>Explore services</Link>
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
  servicesLink: { color: colors.primary, fontSize: 16, fontWeight: '700', paddingVertical: spacing.md },
});
