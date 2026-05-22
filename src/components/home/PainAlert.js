import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { SPACING, RADIUS } from '../../theme';

function PainAlert({ navigation }) {
  return (
    <TouchableOpacity style={styles.card} activeOpacity={0.9} onPress={() => navigation.navigate('Relatos')}>
      <View style={styles.iconBox}>
        <Text style={styles.icon}>📋</Text>
      </View>
      <View style={styles.textBlock}>
        <Text style={styles.title}>Como você está hoje?</Text>
        <Text style={styles.desc}>Por favor, registre seu nível de dor para acompanharmos sua evolução.</Text>
      </View>
      <Text style={styles.chevron}>›</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FEF2F2', marginHorizontal: SPACING.md, marginBottom: SPACING.lg, borderRadius: RADIUS.xl, padding: SPACING.md, borderWidth: 1, borderColor: '#FCA5A5' },
  iconBox: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#FEE2E2', alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  icon: { fontSize: 20 },
  textBlock: { flex: 1 },
  title: { fontSize: 15, fontWeight: '700', color: '#991B1B', marginBottom: 2 },
  desc: { fontSize: 13, color: '#B91C1C', lineHeight: 18 },
  chevron: { fontSize: 24, color: '#F87171', paddingLeft: 8 },
});

export default React.memo(PainAlert);
