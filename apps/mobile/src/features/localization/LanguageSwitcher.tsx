import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, spacing } from '@mnhospital/design-tokens';
import { languageOptions } from './localizationModel';
import { useMobileLocalization } from './MobileLocalizationProvider';

export function LanguageSwitcher() {
  const { language, setLanguage, t } = useMobileLocalization();

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
            style={[styles.option, selected && styles.selectedOption]}
          >
            <Text style={[styles.label, selected && styles.selectedLabel]}>{option.label}</Text>
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
    borderColor: colors.primary,
    borderRadius: 10,
    borderWidth: 1,
    justifyContent: 'center',
    minHeight: 44,
    minWidth: 52,
    paddingHorizontal: spacing.sm,
  },
  selectedOption: { backgroundColor: colors.primary },
  label: { color: colors.primary, fontSize: 14, fontWeight: '700' },
  selectedLabel: { color: '#fff' },
});
