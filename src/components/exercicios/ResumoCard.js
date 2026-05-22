import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS, SPACING, RADIUS } from '../../theme';

function ResumoCard({ total, concluidos }) {
  const pendentes = total - concluidos;
  const pct = total > 0 ? Math.round((concluidos / total) * 100) : 0;

  return (
    <View style={styles.card}>
      <View style={styles.col}>
        <Text style={styles.num}>{total}</Text>
        <Text style={styles.label}>Total</Text>
      </View>
      <View style={styles.divider} />
      <View style={styles.col}>
        <Text style={[styles.num, { color: '#6FCF97' }]}>{concluidos}</Text>
        <Text style={styles.label}>Feitos</Text>
      </View>
      <View style={styles.divider} />
      <View style={styles.col}>
        <Text style={[styles.num, { color: '#F2994A' }]}>{pendentes}</Text>
        <Text style={styles.label}>Pendentes</Text>
      </View>
      <View style={styles.divider} />
      <View style={styles.col}>
        <Text style={[styles.num, { color: COLORS.primary }]}>{pct}%</Text>
        <Text style={styles.label}>Progresso</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { flexDirection: 'row', backgroundColor: '#fff', borderRadius: RADIUS.xl, marginHorizontal: SPACING.md, marginBottom: SPACING.md, paddingVertical: 14, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8, elevation: 3 },
  col: { flex: 1, alignItems: 'center' },
  num: { fontSize: 22, fontWeight: '800', color: COLORS.textDark },
  label: { fontSize: 11, color: COLORS.textMedium, fontWeight: '500', marginTop: 2 },
  divider: { width: 1, backgroundColor: '#E5E7EB', marginVertical: 4 },
});

export default React.memo(ResumoCard);
