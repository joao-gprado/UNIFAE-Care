import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS, SPACING } from '../../theme';

function HeaderSection({ nome, streak, nextVisitDate, painToday }) {
  const dataFormatada = nextVisitDate 
    ? new Date(nextVisitDate).toLocaleDateString('pt-BR') 
    : null;

  let subtitle = 'Seu cuidado diário faz toda a diferença na sua recuperação.';
  
  if (painToday && painToday.recorded && painToday.level !== undefined) {
    if (painToday.level >= 7) {
      subtitle = 'Vi que a dor estava forte. Tente focar em exercícios mais suaves hoje.';
    } else if (painToday.level <= 3) {
      subtitle = 'Que ótimo que a dor está controlada! Vamos manter o ótimo ritmo.';
    }
  } else if (streak >= 3) {
    subtitle = `Você já está numa ofensiva de ${streak} dias! Que dedicação incrível.`;
  }

  return (
    <View style={styles.container}>
      <View style={styles.textBlock}>
        <Text style={styles.greeting}>Olá, {nome}!</Text>
        <Text style={styles.subtitle}>{subtitle}</Text>
        {dataFormatada && (
          <View style={styles.visitRow}>
            <Text style={styles.visitIcon}>📅</Text>
            <Text style={styles.visitText}>Próx. Consulta: <Text style={{fontWeight: '700'}}>{dataFormatada}</Text></Text>
          </View>
        )}
      </View>
      <View style={styles.streakBox}>
        <Text style={styles.streakEmoji}>🔥</Text>
        <Text style={styles.streakNumber}>{streak}</Text>
        <Text style={styles.streakLabel}>dias</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', paddingHorizontal: SPACING.md, paddingTop: SPACING.md, paddingBottom: SPACING.lg },
  textBlock: { flex: 1, paddingRight: SPACING.md },
  greeting: { fontSize: 28, fontWeight: '800', color: '#1a5d38', letterSpacing: -0.5, marginBottom: 6 },
  subtitle: { fontSize: 14, color: COLORS.textMedium, lineHeight: 21, marginBottom: 8 },
  visitRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#EDF7EE', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8, alignSelf: 'flex-start' },
  visitIcon: { fontSize: 14, marginRight: 6 },
  visitText: { fontSize: 13, color: COLORS.primary },
  streakBox: { width: 56, height: 72, borderRadius: 16, backgroundColor: '#FFF7E6', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#FFE4B5', marginTop: 4 },
  streakEmoji: { fontSize: 20, marginBottom: 2 },
  streakNumber: { fontSize: 18, fontWeight: '800', color: '#E67E22', lineHeight: 20 },
  streakLabel: { fontSize: 10, fontWeight: '600', color: '#E67E22', textTransform: 'uppercase' },
});

export default React.memo(HeaderSection);
