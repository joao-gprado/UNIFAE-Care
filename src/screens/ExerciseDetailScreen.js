import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Pressable,
  ActivityIndicator,
  Alert,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Feather, MaterialCommunityIcons, MaterialIcons } from '@expo/vector-icons';
import { ROUTES, buildHeaders } from '../services/api';
import { COLORS, SPACING, RADIUS } from '../theme';

const STEPS = [
  {
    title: 'Posicionamento',
    description:
      'Mantenha o cotovelo junto ao corpo em um ângulo de 90 graus. Use uma toalha dobrada sob a axila para maior estabilidade se necessário.',
  },
  {
    title: 'Movimento',
    description:
      'Gire o antebraço para fora de forma controlada, mantendo o cotovelo fixo. Sinta a ativação na parte posterior do ombro.',
  },
  {
    title: 'Retorno',
    description:
      'Retorne à posição inicial resistindo à força elástica ou à gravidade. O movimento deve ser suave e sem trancos.',
  },
];

function PillTag({ label }) {
  return (
    <View style={styles.pill}>
      <Text style={styles.pillText}>{label}</Text>
    </View>
  );
}

function InfoCard({ icon, value, label }) {
  return (
    <View style={styles.infoCard}>
      <View style={styles.infoIconBox}>
        {icon}
      </View>
      <View style={styles.infoTextBlock}>
        <Text style={styles.infoValue}>{value}</Text>
        <Text style={styles.infoLabel}>{label}</Text>
      </View>
    </View>
  );
}

function StepItem({ index, title, description, isLast }) {
  return (
    <View style={styles.stepRow}>
      <View style={styles.stepMarkerWrapper}>
        <View style={styles.stepMarker}>
          <Text style={styles.stepMarkerText}>{index}</Text>
        </View>
        {!isLast ? <View style={styles.stepLine} /> : null}
      </View>
      <View style={styles.stepContent}>
        <Text style={styles.stepTitle}>{title}</Text>
        <Text style={styles.stepDescription}>{description}</Text>
      </View>
    </View>
  );
}

function TipCard({ notes }) {
  return (
    <View style={styles.tipCard}>
      <View style={styles.tipHeader}>
        <View style={styles.tipBadge}>
          <MaterialIcons name="medical-services" size={18} color={COLORS.primary} />
        </View>
        <Text style={styles.tipTitle}>Dicas da Fisioterapeuta</Text>
      </View>
      <Text style={styles.tipText}>
        {notes ? notes : '“Foque na qualidade do movimento, não na carga. Se sentir uma dor aguda, diminua a amplitude e respire profundamente durante a execução.”'}
      </Text>
      <View style={styles.tipIllustration}>
        <MaterialCommunityIcons name="gesture-tap" size={20} color="#CBD5E1" />
      </View>
    </View>
  );
}

export default function ExerciseDetailScreen({ navigation, route }) {
  const [submitting, setSubmitting] = useState(false);
  const [exercise, setExercise] = useState(null);
  const [loading, setLoading] = useState(true);
  const [detailsError, setDetailsError] = useState(null);

  // Extração segura dos parâmetros com fallbacks
  const prescriptionItemId = route?.params?.prescriptionItemId ?? route?.params?.id ?? null;
  const titulo = route?.params?.titulo ?? 'Rotação Externa de Ombro';
  const descricao = route?.params?.descricao ?? 'Descrição detalhada do exercício.';
  const tempoMedio = route?.params?.tempoMedio ?? 15;

  // Garantir que prescriptionItemId seja numérico (string numérica ou número)
  const prescriptionItemIdNumerico = prescriptionItemId ? String(prescriptionItemId).trim() : null;

  async function carregarDetalhesExercicio() {
    setLoading(true);
    setDetailsError(null);

    if (!prescriptionItemIdNumerico) {
      const message = 'ID do exercício inválido. Volte e tente novamente.';
      setDetailsError(message);
      Alert.alert('Erro', message);
      setLoading(false);
      return;
    }

    try {
      const token = await AsyncStorage.getItem('@token');
      if (!token) {
        throw new Error('Token não encontrado. Faça login novamente.');
      }

      const response = await fetch(ROUTES.exerciseDetail(prescriptionItemIdNumerico), {
        method: 'GET',
        headers: buildHeaders(token),
      });

      const json = await response.json();

      if (!response.ok) {
        if (response.status === 404) {
          Alert.alert('Exercício não encontrado', 'Detalhes do exercício não foram localizados.');
        } else {
          Alert.alert('Erro', json.message || 'Não foi possível carregar os detalhes do exercício.');
        }
        setDetailsError(json.message || `Erro ${response.status}`);
        setLoading(false);
        return;
      }

      setExercise({
        exerciseId: json.exerciseId ?? json.id ?? json.exercise_id,
        title: json.title ?? '',
        videoUrl: json.videoUrl ?? json.video_url ?? '',
        description: json.description ?? json.descricao ?? '',
        metrics: {
          repetitionsRaw: json.metrics?.repetitionsRaw ?? json.metrics?.repetitions_raw ?? '',
          series: json.metrics?.series ?? '',
          volume: json.metrics?.volume ?? '',
        },
        instructions: Array.isArray(json.instructions)
          ? json.instructions
          : typeof json.instructions === 'string'
            ? [json.instructions]
            : [],
        physiotherapistNotes: json.physiotherapistNotes ?? json.physiotherapist_notes ?? '',
      });
    } catch (error) {
      console.log('Erro carregarDetalhesExercicio:', error);
      Alert.alert('Erro de conexão', 'Não foi possível carregar os detalhes do exercício. Verifique a internet e tente novamente.');
      setDetailsError(error.message || 'Erro de conexão');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    carregarDetalhesExercicio();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const displayTitle = exercise?.title ?? titulo;
  const displayDescription = exercise?.description ?? descricao;
  const displayVideoUrl = exercise?.videoUrl ?? null;
  const metrics = exercise?.metrics ?? {};
  const instructionItems = (exercise?.instructions?.length ? exercise.instructions : STEPS).map((item, index) =>
    typeof item === 'string'
      ? { title: `Passo ${index + 1}`, description: item }
      : item
  );
  const physiotherapistNotes = exercise?.physiotherapistNotes ?? '';

  async function concluirAtividade() {
    if (!prescriptionItemId) {
      Alert.alert('Erro', 'Não foi possível identificar o exercício. Volte e tente novamente.');
      return;
    }

    setSubmitting(true);

    try {
      const token = await AsyncStorage.getItem('@token');

      if (!token) {
        throw new Error('Token não encontrado. Faça login novamente.');
      }

      const url = ROUTES.completePlanExercise(prescriptionItemId);
      const response = await fetch(url, {
        method: 'POST',
        headers: buildHeaders(token),
      });

      const json = await response.json();

      if (!response.ok) {
        const message = json.message || json.error || 'Não foi possível concluir o exercício.';
        Alert.alert('Erro', message);
        return;
      }

      const executionId = json.executionId ?? json.execution_id ?? json.data?.executionId ?? json.data?.execution_id;

      if (!executionId) {
        Alert.alert('Erro', 'A finalização do exercício não retornou um ID de execução válido.');
        return;
      }

      navigation.navigate('Feedback', { executionId });
    } catch (error) {
      Alert.alert('Erro de conexão', 'Não foi possível concluir o exercício. Verifique a conexão e tente novamente.');
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return (
    <View style={styles.page}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {detailsError ? (
          <View style={styles.errorBanner}>
            <Text style={styles.errorText}>{detailsError}</Text>
          </View>
        ) : null}
        <View style={styles.headerRow}>
          <Pressable style={styles.backButton} onPress={() => navigation.goBack()}>
            <Feather name="arrow-left" size={20} color={COLORS.textDark} />
          </Pressable>
          <Text style={styles.pageTitle}>UNIFAE Care</Text>
          <View style={styles.brandBadge}>
            <Text style={styles.brandText}>UNIFAE</Text>
          </View>
        </View>

        <View style={styles.tagRow}>
          <PillTag label="MEMBROS SUPERIORES" />
          <PillTag label="MOBILIDADE" />
        </View>

        <Text style={styles.mainTitle}>{displayTitle}</Text>
        <Text style={styles.exerciseSubtitle}>{displayDescription}</Text>

        <View style={styles.videoCard}>
          <View style={styles.videoPlaceholder}>
            <Feather name="play" size={26} color={COLORS.white} />
          </View>
          {displayVideoUrl ? (
            <Text style={styles.videoUrlText} numberOfLines={1}>
              {displayVideoUrl}
            </Text>
          ) : null}
        </View>

        <View style={styles.infoRow}>
          <InfoCard
            icon={<MaterialCommunityIcons name="repeat" size={20} color={COLORS.primary} />}
            value={metrics.series ? String(metrics.series) : '—'}
            label="Séries"
          />
          <InfoCard
            icon={<MaterialCommunityIcons name="arm-flex" size={20} color={COLORS.primary} />}
            value={metrics.repetitionsRaw ? String(metrics.repetitionsRaw) : '—'}
            label="Repetições"
          />
          <InfoCard
            icon={<MaterialCommunityIcons name="speedometer" size={20} color={COLORS.primary} />}
            value={metrics.volume ? String(metrics.volume) : '—'}
            label="Volume"
          />
        </View>

        <Text style={styles.sectionTitle}>Passo a Passo</Text>

        {instructionItems.map((item, index) => (
          <StepItem
            key={`${item.title}-${index}`}
            index={index + 1}
            title={item.title}
            description={item.description}
            isLast={index === instructionItems.length - 1}
          />
        ))}

        <TipCard notes={physiotherapistNotes} />
      </ScrollView>

      <TouchableOpacity
        style={[styles.footerButton, submitting && styles.footerButtonDisabled]}
        activeOpacity={0.8}
        onPress={concluirAtividade}
        disabled={submitting}
      >
        {submitting ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.footerButtonText}>Concluir Atividade</Text>
        )}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  page: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  content: {
    paddingBottom: 24,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.md,
    paddingTop: SPACING.lg,
    paddingBottom: SPACING.md,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: COLORS.white,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  pageTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.textDark,
  },
  brandBadge: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: COLORS.white,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  brandText: {
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.primary,
  },
  tagRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    paddingHorizontal: SPACING.md,
    marginBottom: SPACING.md,
  },
  pill: {
    backgroundColor: '#E6F3E9',
    borderRadius: 999,
    paddingVertical: 8,
    paddingHorizontal: 14,
  },
  pillText: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.primary,
    letterSpacing: 0.5,
  },
  mainTitle: {
    fontSize: 26,
    fontWeight: '800',
    color: COLORS.textDark,
    paddingHorizontal: SPACING.md,
    marginBottom: SPACING.sm,
    flexShrink: 1,
  },
  exerciseSubtitle: {
    fontSize: 14,
    color: COLORS.textMedium,
    paddingHorizontal: SPACING.md,
    flexShrink: 1,
    marginBottom: SPACING.lg,
    lineHeight: 20,
  },
  videoCard: {
    marginHorizontal: SPACING.md,
    borderRadius: 20,
    overflow: 'hidden',
    backgroundColor: '#D8D9D7',
    marginBottom: SPACING.lg,
  },
  videoPlaceholder: {
    height: 200,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#D8D9D7',
  },
  videoUrlText: {
    padding: SPACING.sm,
    color: COLORS.textMedium,
    fontSize: 12,
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.background,
  },
  errorBanner: {
    backgroundColor: '#FFF7E7',
    borderLeftWidth: 4,
    borderLeftColor: '#F59E0B',
    marginHorizontal: SPACING.md,
    marginBottom: SPACING.md,
    borderRadius: 14,
    padding: SPACING.md,
  },
  errorText: {
    color: '#92400E',
    fontSize: 13,
    lineHeight: 18,
  },
  infoRow: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: SPACING.md,
    marginBottom: SPACING.lg,
  },
infoCard: {
    flex: 1,
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.lg,
    padding: SPACING.sm,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    minWidth: 0,
  },
  infoIconBox: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: '#E7F5EA',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.sm,
  },
  infoTextBlock: {
    flex: 1,
  },
  infoValue: {
    fontSize: 15,
    fontWeight: '800',
    color: COLORS.textDark,
    flexShrink: 1,
  },
  infoLabel: {
    fontSize: 11,
    color: COLORS.textMedium,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.textDark,
    paddingHorizontal: SPACING.md,
    marginBottom: SPACING.md,
  },
  stepRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingHorizontal: SPACING.md,
    marginBottom: SPACING.md,
  },
  stepMarkerWrapper: {
    width: 36,
    alignItems: 'center',
  },
  stepMarker: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  stepMarkerText: {
    color: COLORS.white,
    fontWeight: '700',
  },
  stepLine: {
    width: 2,
    flex: 1,
    backgroundColor: '#D1D5DB',
    marginTop: 8,
    marginBottom: -4,
  },
  stepContent: {
    flex: 1,
    paddingLeft: SPACING.sm,
    minWidth: 0,
  },
  stepTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.textDark,
    marginBottom: 6,
  },
  stepDescription: {
    fontSize: 13,
    color: COLORS.textMedium,
    lineHeight: 20,
    flexShrink: 1,
  },
  tipCard: {
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    marginHorizontal: SPACING.md,
    marginBottom: SPACING.lg,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  tipHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  tipBadge: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: '#E6F3E9',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.sm,
  },
  tipTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.textDark,
  },
  tipText: {
    fontSize: 13,
    color: COLORS.textMedium,
    lineHeight: 20,
    flexShrink: 1,
  },
  tipIllustration: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: '#F8FAF8',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: SPACING.md,
    alignSelf: 'flex-start',
  },
  footerButton: {
    backgroundColor: COLORS.primary,
    marginHorizontal: SPACING.md,
    marginBottom: SPACING.md,
    borderRadius: RADIUS.xl,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  footerButtonDisabled: {
    opacity: 0.7,
  },
  footerButtonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: '700',
  },
});