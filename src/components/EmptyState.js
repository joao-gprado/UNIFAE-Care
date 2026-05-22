import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS, SPACING, RADIUS } from '../theme';

function EmptyState({ iconName, title, description, onRetry, retryText = "Tentar Novamente" }) {
  return (
    <View style={styles.container}>
      <MaterialCommunityIcons name={iconName || "cloud-off-outline"} size={48} color="#9CA3AF" style={{ marginBottom: 12 }} />
      <Text style={styles.title}>{title || "Você está offline"}</Text>
      <Text style={styles.desc}>
        {description || "Verifique sua conexão e tente novamente."}
      </Text>
      {onRetry && (
        <TouchableOpacity onPress={onRetry} style={styles.retryBtn}>
          <Text style={styles.retryText}>{retryText}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { backgroundColor: '#F3F4F6', marginHorizontal: SPACING.md, marginVertical: SPACING.lg, borderRadius: RADIUS.xl, padding: SPACING.xl, alignItems: 'center', borderWidth: 1, borderColor: '#E5E7EB', borderStyle: 'dashed' },
  title: { fontSize: 18, fontWeight: '800', color: COLORS.textDark, marginBottom: 8, textAlign: 'center' },
  desc: { fontSize: 14, color: COLORS.textMedium, textAlign: 'center', lineHeight: 22, marginBottom: 20 },
  retryBtn: { backgroundColor: COLORS.white, paddingHorizontal: 24, paddingVertical: 12, borderRadius: 99, borderWidth: 1, borderColor: '#D1D5DB' },
  retryText: { fontSize: 14, fontWeight: '700', color: COLORS.textDark },
});

export default React.memo(EmptyState);
