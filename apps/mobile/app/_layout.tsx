import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { MobileLocalizationProvider } from '../src/features/localization/MobileLocalizationProvider';

export default function RootLayout() {
  return (
    <MobileLocalizationProvider>
      <Stack screenOptions={{ headerShown: false }} />
      <StatusBar style="auto" />
    </MobileLocalizationProvider>
  );
}
