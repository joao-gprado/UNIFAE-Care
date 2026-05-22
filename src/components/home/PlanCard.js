import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { COLORS, SPACING, RADIUS } from '../../theme';

function PlanCard({ nextExercise, plan, onStart }) {
  const handleIniciar = () => {
    if (!nextExercise) return;
    onStart?.(nextExercise);
  };

  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Text style={styles.cardTitle}>Próximo passo</Text>
        {plan && (
          <Text style={styles.badge}>
            {plan.completedExercises}/{plan.totalExercises} concluídos
          </Text>
        )}
      </View>

      {nextExercise ? (
        <View style={styles.exerciseBlock}>
          <View style={styles.exerciseInfo}>
            <Text style={styles.exerciseTitle}>{nextExercise.exerciseName || nextExercise.title}</Text>
            {nextExercise.axis || nextExercise.problem ? (
              <Text style={styles.exerciseDesc}>{(nextExercise.axis ? nextExercise.axis + ' • ' : '') + (nextExercise.problem || '')}</Text>
            ) : null}
            {nextExercise.objective ? (
              <View style={styles.timeRow}>
                <Text style={styles.clockIcon}>🎯</Text>
                <Text style={styles.timeText}>{nextExercise.objective}</Text>
              </View>
            ) : null}
          </View>
        </View>
      ) : (
        <View style={styles.emptyBlock}>
          <Text style={styles.emptyText}>🎉 Todos os exercícios de hoje foram concluídos!</Text>
        </View>
      )}

      <TouchableOpacity
        style={[styles.startButton, !nextExercise && styles.startButtonDisabled]}
        onPress={handleIniciar}
        activeOpacity={0.85}
        disabled={!nextExercise}
      >
        <Text style={styles.startButtonText}>
          {nextExercise ? 'Iniciar exercício' : 'Plano completo'}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: COLORS.backgroundWhite, borderRadius: RADIUS.xl, marginHorizontal: SPACING.md, marginBottom: SPACING.md, padding: SPACING.md, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.07, shadowRadius: 8, elevation: 3 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: SPACING.md },
  cardTitle: { fontSize: 16, fontWeight: '700', color: COLORS.textDark },
  badge: { fontSize: 13, fontWeight: '600', color: COLORS.primary },
  exerciseBlock: { backgroundColor: '#F8FAF8', borderRadius: RADIUS.lg, padding: SPACING.md, marginBottom: SPACING.md, borderLeftWidth: 3, borderLeftColor: COLORS.primary },
  exerciseInfo: {},
  exerciseTitle: { fontSize: 17, fontWeight: '700', color: '#1a5d38', marginBottom: 4 },
  exerciseDesc: { fontSize: 13, color: COLORS.textMedium, marginBottom: 10 },
  timeRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  clockIcon: { fontSize: 13 },
  timeText: { fontSize: 13, color: COLORS.textMedium, fontWeight: '500' },
  emptyBlock: { backgroundColor: '#F0FBF3', borderRadius: RADIUS.lg, padding: SPACING.md, marginBottom: SPACING.md, alignItems: 'center' },
  emptyText: { fontSize: 14, color: COLORS.primary, fontWeight: '600', textAlign: 'center' },
  startButton: { backgroundColor: '#1a5d38', borderRadius: RADIUS.lg, paddingVertical: 16, alignItems: 'center' },
  startButtonDisabled: { backgroundColor: COLORS.textLight },
  startButtonText: { color: COLORS.white, fontSize: 16, fontWeight: '700', letterSpacing: 0.3 },
});

export default React.memo(PlanCard);
