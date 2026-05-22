import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, Animated } from 'react-native';
import { COLORS } from '../../theme';

function MilestoneModal({ visible, streak, onClose }) {
  const scaleAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 4,
        useNativeDriver: true,
      }).start();
    } else {
      scaleAnim.setValue(0);
    }
  }, [visible, scaleAnim]);

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        <Animated.View style={[styles.card, { transform: [{ scale: scaleAnim }] }]}>
          <Text style={styles.emoji}>🔥</Text>
          <Text style={styles.title}>Que Incrível!</Text>
          <Text style={styles.desc}>
            Você atingiu uma ofensiva de <Text style={{fontWeight: '800', color: '#E67E22'}}>{streak} dias</Text> consecutivos se cuidando!
          </Text>
          <TouchableOpacity style={styles.btn} onPress={onClose} activeOpacity={0.8}>
            <Text style={styles.btnText}>Continuar</Text>
          </TouchableOpacity>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', alignItems: 'center' },
  card: { backgroundColor: '#fff', borderRadius: 24, padding: 32, alignItems: 'center', width: '85%', shadowColor: '#000', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.1, shadowRadius: 20, elevation: 10 },
  emoji: { fontSize: 64, marginBottom: 16 },
  title: { fontSize: 24, fontWeight: '800', color: '#1a5d38', marginBottom: 8 },
  desc: { fontSize: 15, color: COLORS.textMedium, textAlign: 'center', lineHeight: 22, marginBottom: 24 },
  btn: { backgroundColor: '#E67E22', paddingVertical: 14, paddingHorizontal: 32, borderRadius: 99 },
  btnText: { color: '#fff', fontSize: 16, fontWeight: '800' },
});

export default React.memo(MilestoneModal);
