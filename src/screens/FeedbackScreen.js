// src/screens/FeedbackScreen.js
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Alert,
  Image,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import ViewShot from 'react-native-view-shot';
import * as Sharing from 'expo-sharing';
import { ROUTES, buildHeaders } from '../services/api';
import { COLORS, SPACING, RADIUS } from '../theme';

const FEEDBACK_OPTIONS = [
  { score: 0,  title: 'Sem Dor', description: 'Absolutamente confortável', icon: 'emoticon-outline', accent: '#56CCF2' },
  { score: 2,  title: 'Leve', description: 'Atividade tranquila', icon: 'emoticon-happy-outline', accent: '#6FCF97' },
  { score: 5,  title: 'Moderado', description: 'Senti o esforço, mas sem dor', icon: 'emoticon-neutral-outline', accent: '#F2C94C' },
  { score: 8,  title: 'Intenso', description: 'Exigiu bastante concentração', icon: 'emoticon-sad-outline', accent: '#F2994A' },
  { score: 10, title: 'Exaustão', description: 'Limite físico atingido', icon: 'emoticon-dead-outline', accent: '#EB5757' },
];

export default function FeedbackScreen({ navigation, route }) {
  const [selectedScore, setSelectedScore] = useState(null);
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const viewShotRef = React.useRef(null);

  const executionId = route?.params?.executionId ?? null;
  const canSubmit = selectedScore !== null && Boolean(executionId);

  const handleScoreSelect = (score) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setSelectedScore(score);
  };

  async function shareVictory() {
    try {
      const uri = await viewShotRef.current.capture();
      await Sharing.shareAsync(uri, { dialogTitle: 'Compartilhar minha evolução!' });
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível compartilhar a imagem.');
    }
  }

  async function enviarFeedback() {
    if (!canSubmit) {
      if (selectedScore === null) {
        Alert.alert('Selecione uma opção', 'Escolha como você se sente após o exercício.');
      } else {
        Alert.alert('Erro de envio', 'Não foi possível identificar a execução para enviar o feedback.');
      }
      return;
    }

    setLoading(true);
    try {
      const token = await AsyncStorage.getItem('@token');
      if (!token) throw new Error('Token não encontrado. Faça login novamente.');

      const response = await fetch(ROUTES.submitExerciseFeedback(executionId), {
        method: 'POST',
        headers: buildHeaders(token),
        body: JSON.stringify({ score: selectedScore, notes: notes.trim() }),
      });

      const json = await response.json();
      if (response.ok || response.status === 409) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        setIsSuccess(true);
      } else {
        Alert.alert('Erro', json.message || json.error || 'Não foi possível enviar o feedback.');
      }
    } catch (error) {
      Alert.alert('Erro de conexão', 'Não foi possível enviar seu feedback. Verifique a internet.');
    } finally {
      setLoading(false);
    }
  }

  const activeOption = FEEDBACK_OPTIONS.find(o => o.score === selectedScore);

  if (isSuccess && activeOption) {
    return (
      <View style={styles.page}>
        <View style={[styles.container, { justifyContent: 'center', flex: 1 }]}>
          <ViewShot ref={viewShotRef} options={{ format: 'jpg', quality: 0.9 }} style={styles.shareCard}>
            <View style={styles.shareHeader}>
              <Text style={styles.shareBrand}>UNIFAE Care</Text>
            </View>
            <Text style={styles.shareTitle}>Mais um exercício concluído!</Text>
            <MaterialCommunityIcons name={activeOption.icon} size={100} color={activeOption.accent} style={{ marginVertical: 20 }} />
            <Text style={[styles.shareScoreTitle, { color: activeOption.accent }]}>{activeOption.title}</Text>
            <Text style={styles.shareScoreDesc}>Cuidando da minha saúde em casa 🚀</Text>
          </ViewShot>

          <TouchableOpacity style={styles.button} onPress={shareVictory} activeOpacity={0.85}>
            <Text style={styles.buttonText}>Compartilhar Vitória</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.button, { backgroundColor: '#F3F4F6', marginTop: 12, borderWidth: 1, borderColor: '#E5E7EB' }]} onPress={() => navigation.navigate('MainTabs')} activeOpacity={0.85}>
            <Text style={[styles.buttonText, { color: '#4B5563' }]}>Voltar para o Início</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.page}>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        
        <View style={styles.heroBox}>
          <Text style={styles.smallLabel}>SESSÃO FINALIZADA</Text>
          <Text style={styles.title}>Como você se sente?</Text>
          <Text style={styles.subtitle}>
            Avalie seu nível de dor e esforço para ajustarmos seu tratamento.
          </Text>
        </View>

        <View style={styles.sliderContainer}>
          <View style={styles.horizontalRow}>
            {FEEDBACK_OPTIONS.map((opt) => {
              const active = selectedScore === opt.score;
              return (
                <TouchableOpacity
                  key={opt.score}
                  style={[styles.painBox, active && { backgroundColor: opt.accent, borderColor: opt.accent }]}
                  activeOpacity={0.8}
                  onPress={() => handleScoreSelect(opt.score)}
                >
                  <Text style={[styles.painBoxScore, active && { color: '#fff' }]}>{opt.score}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
          <View style={styles.labelsRow}>
            <Text style={styles.extremeLabel}>Sem dor</Text>
            <Text style={styles.extremeLabel}>Exaustão</Text>
          </View>
        </View>

        {activeOption ? (
          <View style={[styles.selectedBanner, { borderColor: activeOption.accent, backgroundColor: activeOption.accent + '1A' }]}>
            <MaterialCommunityIcons name={activeOption.icon} size={48} color={activeOption.accent} />
            <View style={styles.selectedTextWrap}>
              <Text style={[styles.selectedTitle, { color: activeOption.accent }]}>{activeOption.title}</Text>
              <Text style={styles.selectedDesc}>{activeOption.description}</Text>
            </View>
          </View>
        ) : (
          <View style={styles.placeholderBanner}>
            <Text style={styles.placeholderText}>Toque em um número acima para avaliar</Text>
          </View>
        )}

        <View style={styles.fieldGroup}>
          <Text style={styles.fieldLabel}>Observações Adicionais (Opcional)</Text>
          <TextInput
            style={styles.textArea}
            placeholder="Descreva qualquer desconforto ou dúvida sobre os exercícios..."
            placeholderTextColor={COLORS.textPlaceholder}
            value={notes}
            onChangeText={setNotes}
            multiline
            textAlignVertical="top"
          />
        </View>

        <TouchableOpacity
          style={[styles.button, (!canSubmit || loading) && styles.buttonDisabled]}
          onPress={enviarFeedback}
          activeOpacity={0.85}
          disabled={!canSubmit || loading}
        >
          {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Salvar Feedback</Text>}
        </TouchableOpacity>

        {!executionId && (
          <Text style={styles.helpText}>Erro: ID da execução não encontrado.</Text>
        )}

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: COLORS.background },
  container: { padding: SPACING.lg, paddingBottom: SPACING.xl },
  heroBox: { marginBottom: SPACING.lg, alignItems: 'center' },
  smallLabel: { color: COLORS.primary, fontWeight: '700', fontSize: 12, marginBottom: SPACING.xs, letterSpacing: 1 },
  title: { fontSize: 26, fontWeight: '800', color: COLORS.textDark, marginBottom: SPACING.sm, textAlign: 'center' },
  subtitle: { fontSize: 14, color: COLORS.textMedium, lineHeight: 22, textAlign: 'center', paddingHorizontal: SPACING.md },
  
  sliderContainer: { marginBottom: SPACING.md },
  horizontalRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  painBox: { width: 50, height: 50, borderRadius: 25, backgroundColor: COLORS.white, borderWidth: 2, borderColor: '#E5E7EB', alignItems: 'center', justifyContent: 'center' },
  painBoxScore: { fontSize: 18, fontWeight: '800', color: COLORS.textMedium },
  labelsRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 8, paddingHorizontal: 4 },
  extremeLabel: { fontSize: 12, color: COLORS.textPlaceholder, fontWeight: '600' },
  
  selectedBanner: { flexDirection: 'row', alignItems: 'center', borderRadius: RADIUS.lg, padding: SPACING.md, borderWidth: 1, marginBottom: SPACING.lg },
  selectedTextWrap: { flex: 1, marginLeft: SPACING.md },
  selectedTitle: { fontSize: 18, fontWeight: '800', marginBottom: 2 },
  selectedDesc: { fontSize: 14, color: COLORS.textDark, fontWeight: '500' },
  
  placeholderBanner: { height: 80, borderRadius: RADIUS.lg, backgroundColor: '#F3F4F6', alignItems: 'center', justifyContent: 'center', marginBottom: SPACING.lg, borderWidth: 1, borderColor: '#E5E7EB', borderStyle: 'dashed' },
  placeholderText: { fontSize: 14, color: COLORS.textMedium, fontWeight: '500' },

  fieldGroup: { marginBottom: SPACING.lg },
  fieldLabel: { fontSize: 15, fontWeight: '700', color: COLORS.textDark, marginBottom: SPACING.sm },
  textArea: { minHeight: 120, borderRadius: RADIUS.lg, backgroundColor: COLORS.white, borderWidth: 1, borderColor: '#E5E7EB', padding: SPACING.md, color: COLORS.textDark, fontSize: 15 },
  
  button: { backgroundColor: COLORS.primary, borderRadius: RADIUS.xl, paddingVertical: 18, alignItems: 'center', justifyContent: 'center', marginBottom: SPACING.lg },
  buttonDisabled: { opacity: 0.6 },
  buttonText: { color: COLORS.white, fontSize: 16, fontWeight: '800' },
  helpText: { fontSize: 13, color: '#EF4444', textAlign: 'center', fontWeight: '600' },
  shareCard: { backgroundColor: '#fff', borderRadius: 24, padding: 32, alignItems: 'center', marginBottom: SPACING.xl, borderWidth: 2, borderColor: '#F3F4F6' },
  shareHeader: { backgroundColor: '#E6F3E9', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 99, marginBottom: 16 },
  shareBrand: { color: COLORS.primary, fontWeight: '800', fontSize: 12, letterSpacing: 1 },
  shareTitle: { fontSize: 24, fontWeight: '800', color: COLORS.textDark, textAlign: 'center', lineHeight: 30 },
  shareScoreTitle: { fontSize: 28, fontWeight: '800', marginBottom: 8 },
  shareScoreDesc: { fontSize: 14, color: COLORS.textMedium, fontWeight: '600' },
});
