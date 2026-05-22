import React from 'react';
import { Text, StyleSheet, TouchableOpacity } from 'react-native';
import { COLORS } from '../../theme';
import * as Haptics from 'expo-haptics';

function CategoryChip({ label, active, onPress }) {
  const handlePress = () => {
    Haptics.selectionAsync();
    if (onPress) onPress();
  };
  return (
    <TouchableOpacity
      style={[styles.chip, active && styles.chipActive]}
      onPress={handlePress}
      activeOpacity={0.75}
    >
      <Text style={[styles.label, active && styles.labelActive]}>{label}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  chip: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 999, backgroundColor: '#fff', borderWidth: 1, borderColor: '#E5E7EB', marginRight: 8 },
  chipActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  label: { fontSize: 13, fontWeight: '600', color: COLORS.textMedium },
  labelActive: { color: '#fff' },
});

export default React.memo(CategoryChip);
