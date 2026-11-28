import { Pressable, StyleSheet, Text, View } from 'react-native';
import { radius, spacing } from '@mnhospital/design-tokens';
import { useTheme } from '../../ui/theme';
import { languageOptions } from './localizationModel';
import { useMobileLocalization } from './MobileLocalizationProvider';

export function LanguageSwitcher() {
  const { language, setLanguage, t } = useMobileLocalization();
  const theme = useTheme();

  return (
    <View accessibilityLabel={t('language.label')} style={styles.container}>
      {languageOptions.map((option) => {
        const selected = option.code === language;
        return (
          <Pressable
            accessibilityLabel={`${t('language.label')}: ${option.label}`}
            accessibilityRole="button"
            accessibilityState={{ selected }}
            key={option.code}
            onPress={() => setLanguage(option.code)}
            style={[styles.option, { borderColor: theme.primary }, selected && { backgroundColor: theme.primary }]}
          >
            <Text style={[styles.label, { color: selected ? theme.onPrimary : theme.primary }]}>{option.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flexDirection: 'row', gap: spacing.sm },
  option: {
    alignItems: 'center',
    borderRadius: radius.control,
    borderWidth: 1,
    justifyContent: 'center',
    minHeight: 44,
    minWidth: 52,
    paddingHorizontal: spacing.sm,
  },
  label: { fontSize: 14, fontWeight: '700' },
});
