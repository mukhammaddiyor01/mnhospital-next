import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { MobileLocalizationProvider, useMobileLocalization } from '../src/features/localization/MobileLocalizationProvider';
import { useTheme } from '../src/ui/theme';

export default function RootLayout() {
  return (
    <MobileLocalizationProvider>
      <Navigator />
      <StatusBar style="auto" />
    </MobileLocalizationProvider>
  );
}

function Navigator() {
  const theme = useTheme();
  const { t } = useMobileLocalization();
  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: theme.card },
        headerTintColor: theme.primary,
        headerTitleStyle: { color: theme.navy },
        contentStyle: { backgroundColor: theme.page },
      }}
    >
      <Stack.Screen name="(tabs)" options={{ headerShown: false, title: t('tabs.home') }} />
      <Stack.Screen name="service/[id]" options={{ title: t('detail.service') }} />
      <Stack.Screen name="doctor/[id]" options={{ title: t('detail.doctor') }} />
      <Stack.Screen name="article/[id]" options={{ title: t('detail.article') }} />
    </Stack>
  );
}
