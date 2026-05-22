import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { COLORS, SPACING, RADIUS } from '../../theme';

function ExercicioCard({ item, onPress }) {
  const concluido = item.concluido;

  return (
    <TouchableOpacity
      style={[styles.card, concluido && styles.cardConcluido]}
      onPress={() => onPress(item)}
      activeOpacity={0.85}
    >
      <View style={[styles.statusBar, { backgroundColor: concluido ? '#6FCF97' : COLORS.primary }]} />
      <View style={styles.body}>
        <View style={styles.headerRow}>
          <Text style={[styles.titulo, concluido && styles.tituloConcluido]} numberOfLines={1}>
            {item.titulo}
          </Text>
          {concluido ? (
            <View style={styles.badgeConcluido}>
              <Text style={styles.badgeConcluidoText}>✓</Text>
            </View>
          ) : (
            <View style={styles.badgePendente}>
              <Text style={styles.badgePendenteText}>Pendente</Text>
            </View>
          )}
        </View>

        {item.descricao ? (
          <Text style={styles.descricao} numberOfLines={2}>{item.descricao}</Text>
        ) : null}

        <View style={styles.metricRow}>
          {item.tempoMedio > 0 && (
            <View style={styles.metric}>
              <Text style={styles.metricIcon}>🕐</Text>
              <Text style={styles.metricText}>{item.tempoMedio} min</Text>
            </View>
          )}
          {item.series && (
            <View style={styles.metric}>
              <Text style={styles.metricIcon}>🔄</Text>
              <Text style={styles.metricText}>{item.series} séries</Text>
            </View>
          )}
          {item.repeticoes && (
            <View style={styles.metric}>
              <Text style={styles.metricIcon}>💪</Text>
              <Text style={styles.metricText}>{item.repeticoes} rep</Text>
            </View>
          )}
          {item.categoria && (
            <View style={styles.metric}>
              <Text style={styles.metricIcon}>🎯</Text>
              <Text style={styles.metricText}>{item.categoria}</Text>
            </View>
          )}
        </View>
      </View>

      {!concluido && (
        <Text style={styles.chevron} hitSlop={{ top: 15, bottom: 15, left: 15, right: 15 }}>›</Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: { flexDirection: 'row', backgroundColor: '#fff', borderRadius: RADIUS.xl, marginBottom: 10, overflow: 'hidden', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8, elevation: 3 },
  cardConcluido: { opacity: 0.72 },
  statusBar: { width: 5, borderTopLeftRadius: RADIUS.xl, borderBottomLeftRadius: RADIUS.xl },
  body: { flex: 1, padding: SPACING.md, paddingLeft: 12 },
  headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 },
  titulo: { fontSize: 16, fontWeight: '700', color: COLORS.textDark, flex: 1, marginRight: 8 },
  tituloConcluido: { textDecorationLine: 'line-through', color: COLORS.textMedium },
  badgeConcluido: { width: 24, height: 24, borderRadius: 12, backgroundColor: '#6FCF97', alignItems: 'center', justifyContent: 'center' },
  badgeConcluidoText: { color: '#fff', fontSize: 12, fontWeight: '800' },
  badgePendente: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6, backgroundColor: '#EDF7EE' },
  badgePendenteText: { fontSize: 11, fontWeight: '600', color: COLORS.primary },
  descricao: { fontSize: 13, color: COLORS.textMedium, lineHeight: 18, marginBottom: 8 },
  metricRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  metric: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  metricIcon: { fontSize: 12 },
  metricText: { fontSize: 12, color: COLORS.textMedium, fontWeight: '500' },
  chevron: { fontSize: 24, color: COLORS.textLight, alignSelf: 'center', paddingRight: 14, lineHeight: 28 },
});

export default React.memo(ExercicioCard);
