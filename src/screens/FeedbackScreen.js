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
import { ROUTES, buildHeaders } from '../services/api';
import { COLORS, SPACING, RADIUS } from '../theme';

const FEEDBACK_OPTIONS = [
  {
    score: 0,
    title: 'Sem Dor/Esforço',
    description: 'Absolutamente confortável',
    icon: 'emoticon-outline',
    accent: '#56CCF2',
  },
  {
    score: 2,
    title: 'Leve',
    description: 'Atividade tranquila e sustentável',
    icon: 'emoticon-happy-outline',
    accent: '#6FCF97',
  },
  {
    score: 5,
    title: 'Moderado',
    description: 'Senti o esforço, mas sem dor',
    icon: 'emoticon-neutral-outline',
    accent: '#F2C94C',
  },
  {
    score: 8,
    title: 'Intenso',
    description: 'Exigiu bastante concentração',
    icon: 'emoticon-sad-outline',
    accent: '#F2994A',
  },
  {
    score: 10,
    title: 'Exaustão',
    description: 'Limite físico atingido',
    icon: 'emoticon-dead-outline',
    accent: '#EB5757',
  },
];

export default function FeedbackScreen({ navigation, route }) {
  const [selectedScore, setSelectedScore] = useState(null);
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);

  const executionId = route?.params?.executionId ?? null;

  const canSubmit = selectedScore !== null && Boolean(executionId);

  async function enviarFeedback() {
    if (!canSubmit) {
      if (selectedScore === null) {
        Alert.alert('Selecione uma opção', 'Escolha como você se sente após o exercício.');
      } else {
        Alert.alert('Erro de envio', 'Não foi possível identificar a execução para enviar o feedback.');
      }
      return;
    }
    if (!executionId) {
      Alert.alert('Erro de envio', 'Não foi possível identificar a execução para enviar o feedback.');
      return;
    }

    setLoading(true);
    try {
      const token = await AsyncStorage.getItem('@token');
      if (!token) {
        throw new Error('Token não encontrado. Faça login novamente.');
      }

      const response = await fetch(ROUTES.submitExerciseFeedback(executionId), {
        method: 'POST',
        headers: buildHeaders(token),
        body: JSON.stringify({ score: selectedScore, notes: notes.trim() }),
      });

      const json = await response.json();
      if (response.ok) {
        Alert.alert('Feedback enviado', 'Obrigado pelo seu retorno! Seu feedback foi registrado com sucesso.', [
          { text: 'OK', onPress: () => navigation.navigate('MainTabs') },
        ]);
      } else if (response.status === 409) {
        Alert.alert(
          'Feedback já registrado',
          'Este feedback já foi enviado para esta execução. Você não pode enviar duas vezes.',
          [{ text: 'OK', onPress: () => navigation.navigate('MainTabs') }]
        );
      } else {
        const message = json.message || json.error || 'Não foi possível enviar o feedback. Tente novamente.';
        Alert.alert('Erro', message);
      }
    } catch (error) {
      Alert.alert('Erro de conexão', 'Não foi possível enviar seu feedback. Verifique a conexão e tente novamente.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <View style={styles.page}>
      <ScrollView
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.heroBox}>
          <Text style={styles.smallLabel}>SESSÃO FINALIZADA</Text>
          <Text style={styles.title}>Como você se sente?</Text>
          <Text style={styles.subtitle}>
            Avalie seu nível de dor e esforço após o exercício para que possamos ajustar seu plano.
          </Text>
        </View>

        <View style={styles.optionsList}>
          {FEEDBACK_OPTIONS.map(option => {
            const active = selectedScore === option.score;
            return (
              <TouchableOpacity
                key={option.score}
                style={[styles.optionCard, active && styles.optionCardActive, { borderColor: active ? option.accent : '#E5E7EB' }]}
                activeOpacity={0.85}
                onPress={() => setSelectedScore(option.score)}
              >
                <View style={styles.optionIconBox}>
                  <MaterialCommunityIcons
                    name={option.icon}
                    size={28}
                    color={active ? option.accent : COLORS.primary}
                  />
                </View>
                <View style={styles.optionTextBlock}>
                  <Text style={[styles.optionTitle, active && { color: COLORS.textDark }]}>{option.title}</Text>
                  <Text style={styles.optionDescription}>{option.description}</Text>
                </View>
                <View style={[styles.badge, active && { backgroundColor: option.accent }]}> 
                  <Text style={[styles.badgeText, active && { color: COLORS.white }]}>{option.score}</Text>
                </View>
              </TouchableOpacity>
            );
          })}
        </View>

        <View style={styles.fieldGroup}>
          <Text style={styles.fieldLabel}>Observações Adicionais</Text>
          <TextInput
            style={styles.textArea}
            placeholder="Descreva qualquer desconforto específico ou comentário sobre os exercícios de hoje..."
            placeholderTextColor={COLORS.textPlaceholder}
            value={notes}
            onChangeText={setNotes}
            multiline
            textAlignVertical="top"
            returnKeyType="done"
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
          <Text style={styles.helpText}>
            Nenhum ID de execução foi informado. O feedback precisa ser enviado a partir do fluxo de conclusão de sessão.
          </Text>
        )}

        <View style={styles.footer}>
          <Image source={require('../../assets/logo.png')} style={styles.footerLogo} resizeMode="contain" />
          <Text style={styles.footerText}>Seu progresso é nossa prioridade.</Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  page: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  container: {
    padding: SPACING.lg,
    paddingBottom: SPACING.xl,
  },
  heroBox: {
    marginBottom: SPACING.lg,
  },
  smallLabel: {
    color: COLORS.primary,
    fontWeight: '700',
    fontSize: 12,
    marginBottom: SPACING.xs,
    letterSpacing: 1,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: COLORS.textDark,
    marginBottom: SPACING.sm,
    lineHeight: 36,
  },
  subtitle: {
    fontSize: 14,
    color: COLORS.textMedium,
    lineHeight: 22,
  },
  optionsList: {
    marginBottom: SPACING.lg,
  },
  optionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 2,
  },
  optionCardActive: {
    backgroundColor: '#F7FCF6',
  },
  optionIconBox: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: '#F5F8F5',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.md,
  },
  optionTextBlock: {
    flex: 1,
    minWidth: 0,
  },
  optionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.textDark,
    marginBottom: 4,
  },
  optionDescription: {
    fontSize: 13,
    color: COLORS.textMedium,
    lineHeight: 18,
    flexShrink: 1,
  },
  badge: {
    minWidth: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: {
    color: COLORS.textDark,
    fontSize: 16,
    fontWeight: '800',
  },
  fieldGroup: {
    marginBottom: SPACING.lg,
  },
  fieldLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.textDark,
    marginBottom: SPACING.sm,
  },
  textArea: {
    minHeight: 140,
    maxHeight: 200,
    borderRadius: RADIUS.lg,
    backgroundColor: COLORS.inputBg,
    borderWidth: 1,
    borderColor: COLORS.inputBorder,
    padding: SPACING.md,
    color: COLORS.textDark,
    fontSize: 14,
    scrollEnabled: true,
  },
  button: {
    backgroundColor: COLORS.primary,
    borderRadius: RADIUS.xl,
    paddingVertical: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.lg,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: '700',
  },
  helpText: {
    fontSize: 13,
    color: COLORS.textPlaceholder,
    textAlign: 'center',
    marginBottom: SPACING.lg,
    lineHeight: 20,
    flexShrink: 1,
  },
  footer: {
    alignItems: 'center',
    marginTop: SPACING.sm,
  },
  footerLogo: {
    width: 120,
    height: 36,
    marginBottom: SPACING.sm,
  },
  footerText: {
    fontSize: 12,
    color: COLORS.textPlaceholder,
  },
});
