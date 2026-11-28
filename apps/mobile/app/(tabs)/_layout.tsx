import { Tabs } from 'expo-router';
import { Text } from 'react-native';
import { useMobileLocalization } from '../../src/features/localization/MobileLocalizationProvider';
import { useTheme } from '../../src/ui/theme';

// shortcut: text glyphs as tab icons, switch to @expo/vector-icons when brand icons are needed.
const tabs = [
  { name: 'index', key: 'tabs.home', glyph: '⌂' },
  { name: 'services', key: 'tabs.services', glyph: '✚' },
  { name: 'doctors', key: 'tabs.doctors', glyph: '◉' },
  { name: 'articles', key: 'tabs.articles', glyph: '≡' },
] as const;

export default function TabsLayout() {
  const theme = useTheme();
  const { t } = useMobileLocalization();
  return (
    <Tabs
      screenOptions={{
        headerStyle: { backgroundColor: theme.card },
        headerTitleStyle: { color: theme.navy },
        tabBarStyle: { backgroundColor: theme.card, borderTopColor: theme.line },
        tabBarActiveTintColor: theme.primary,
        tabBarInactiveTintColor: theme.muted,
      }}
    >
      {tabs.map(({ name, key, glyph }) => (
        <Tabs.Screen
          key={name}
          name={name}
          options={{
            title: t(key),
            tabBarIcon: ({ color }) => <Text style={{ color: String(color), fontSize: 20 }}>{glyph}</Text>,
          }}
        />
      ))}
    </Tabs>
  );
}
