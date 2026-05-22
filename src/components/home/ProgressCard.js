import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { COLORS, SPACING, RADIUS } from '../../theme';

function getMensagemProgresso(pct) {
  if (pct <= 40) return { texto: 'Você precisa se exercitar. Vamos começar?', emoji: '💪' };
  if (pct <= 79) return { texto: 'Você está indo bem!\nContinue assim.', emoji: '💚' };
  return { texto: 'Parabéns pelo resultado da semana!', emoji: '🏆' };
}

function ProgressRing({ percent, size = 90, stroke = 9 }) {
  const safe   = Math.min(100, Math.max(0, percent));
  const r      = (size - stroke) / 2;
  const circ   = 2 * Math.PI * r;
  const offset = circ - (safe / 100) * circ;
  const cx     = size / 2;
  const cy     = size / 2;

  return (
    <View style={{ width: size, height: size }}>
      <Svg width={size} height={size}>
        <Circle cx={cx} cy={cy} r={r} stroke="#DDE8DE" strokeWidth={stroke} fill="none" />
        <Circle cx={cx} cy={cy} r={r} stroke={COLORS.primary} strokeWidth={stroke} fill="none" strokeDasharray={circ} strokeDashoffset={offset} strokeLinecap="round" transform={`rotate(-90 ${cx} ${cy})`} />
      </Svg>
      <View style={StyleSheet.absoluteFill} pointerEvents="none">
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <Text style={{ fontSize: size * 0.2, fontWeight: '800', color: '#1a5d38' }}>{safe}%</Text>
        </View>
      </View>
    </View>
  );
}

function ProgressCard({ percent }) {
  const { texto, emoji } = getMensagemProgresso(percent);
  return (
    <View style={styles.card}>
      <Text style={styles.cardTitle}>Seu progresso da semana</Text>
      <View style={styles.row}>
        <ProgressRing percent={percent} size={90} stroke={9} />
        <View style={styles.messageBlock}>
          <Text style={styles.emoji}>{emoji}</Text>
          <Text style={styles.message}>{texto}</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: COLORS.backgroundWhite, borderRadius: RADIUS.xl, marginHorizontal: SPACING.md, marginBottom: SPACING.md, padding: SPACING.md, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.07, shadowRadius: 8, elevation: 3 },
  cardTitle: { fontSize: 16, fontWeight: '700', color: COLORS.textDark, marginBottom: SPACING.md },
  row: { flexDirection: 'row', alignItems: 'center', gap: SPACING.md },
  messageBlock: { flex: 1, gap: 4 },
  emoji: { fontSize: 22, marginBottom: 2 },
  message: { fontSize: 14, fontWeight: '600', color: COLORS.textDark, lineHeight: 20 },
});

export default React.memo(ProgressCard);
