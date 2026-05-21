// src/screens/ExerciseDetailScreen.js
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
  Linking,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Feather, MaterialCommunityIcons, MaterialIcons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { ROUTES, buildHeaders } from '../services/api';
import { COLORS, SPACING, RADIUS } from '../theme';

// ─── Subcomponentes ─────────────────────────────────────────────────────────

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
      <View style={styles.infoIconBox}>{icon}</View>
      <View style={styles.infoTextBlock}>
        <Text style={styles.infoValue}>{value}</Text>
        <Text style={styles.infoLabel}>{label}</Text>
      </View>
    </View>
  );
}

function StepItem({ index, title, description, isLast, checked, onToggle }) {
  return (
    <TouchableOpacity style={styles.stepRow} onPress={onToggle} activeOpacity={0.8}>
      <View style={styles.stepMarkerWrapper}>
        <View style={[styles.stepMarker, checked && styles.stepMarkerChecked]}>
          {checked ? (
            <MaterialIcons name="check" size={20} color="#fff" />
          ) : (
            <Text style={styles.stepMarkerText}>{index}</Text>
          )}
        </View>
        {!isLast ? <View style={[styles.stepLine, checked && styles.stepLineChecked]} /> : null}
      </View>
      <View style={styles.stepContent}>
        <Text style={[styles.stepTitle, checked && styles.stepTitleChecked]}>{title}</Text>
        <Text style={[styles.stepDescription, checked && styles.stepDescriptionChecked]}>{description}</Text>
      </View>
    </TouchableOpacity>
  );
}

function TipCard({ notes }) {
  if (!notes) return null;
  return (
    <View style={styles.tipCard}>
      <View style={styles.tipHeader}>
        <View style={styles.tipBadge}>
          <MaterialIcons name="medical-services" size={18} color={COLORS.primary} />
        </View>
        <Text style={styles.tipTitle}>Dicas da Fisioterapeuta</Text>
      </View>
      <Text style={styles.tipText}>{notes}</Text>
    </View>
  );
}

// ─── Componente de vídeo ─────────────────────────────────────────────────────

function VideoCard({ videoUrl }) {
  const handleOpen = async () => {
    if (!videoUrl) return;
    try {
      const supported = await Linking.canOpenURL(videoUrl);
      if (supported) {
        await Linking.openURL(videoUrl);
      } else {
        Alert.alert('Não foi possível abrir o vídeo', 'Verifique se o link é válido.');
      }
    } catch {
      Alert.alert('Erro', 'Não foi possível abrir o link do vídeo.');
    }
  };

  if (!videoUrl) {
    return (
      <View style={styles.videoCard}>
        <View style={styles.videoPlaceholder}>
          <MaterialCommunityIcons name="video-off-outline" size={32} color="#A0AEC0" />
          <Text style={styles.videoAbsente}>Vídeo não disponível para este exercício</Text>
        </View>
      </View>
    );
  }

  return (
    <TouchableOpacity style={styles.videoCard} onPress={handleOpen} activeOpacity={0.85}>
      <View style={styles.videoPlaceholder}>
        <View style={styles.playButton}>
          <Feather name="play" size={26} color={COLORS.white} />
        </View>
        <Text style={styles.videoTapText}>Toque para assistir ao vídeo</Text>
      </View>
    </TouchableOpacity>
  );
}

// ─── Componente de Selo Clínico ────────────────────────────────────────────────

function ClinicalBadge({ name }) {
  if (!name) return null;
  return (
    <View style={styles.clinicalBadge}>
      <MaterialCommunityIcons name="shield-check" size={20} color="#10B981" />
      <Text style={styles.clinicalBadgeText}>
        Prescrição verificada por <Text style={{fontWeight: '700'}}>{name}</Text>
      </Text>
    </View>
  );
}

// ─── Tela principal ──────────────────────────────────────────────────────────

export default function ExerciseDetailScreen({ navigation, route }) {
  const [submitting, setSubmitting] = useState(false);
  const [exercise, setExercise] = useState(null);
  const [loading, setLoading] = useState(true);
  const [detailsError, setDetailsError] = useState(null);
  const [checkedSteps, setCheckedSteps] = useState([]);
  const [coordinatorName, setCoordinatorName] = useState('');

  const prescriptionItemId = route?.params?.prescriptionItemId ?? route?.params?.id ?? null;
  const tituloParam   = route?.params?.titulo   ?? '';
  const descricaoParam = route?.params?.descricao ?? '';

  const prescriptionItemIdNumerico = prescriptionItemId ? String(prescriptionItemId).trim() : null;

  async function carregarDetalhesExercicio() {
    setLoading(true);
    setDetailsError(null);

    if (!prescriptionItemIdNumerico) {
      const message = 'ID do exercício inválido. Volte e tente novamente.';
      setDetailsError(message);
      setLoading(false);
      return;
    }

    try {
      const usuarioStr = await AsyncStorage.getItem('@usuario');
      if (usuarioStr) {
        const u = JSON.parse(usuarioStr);
        const name = typeof u.coordinator === 'string' ? u.coordinator : u.coordinator?.name || u.coordenador?.nome || u.coordenador || '';
        setCoordinatorName(name);
      }

      const token = await AsyncStorage.getItem('@token');
      if (!token) throw new Error('Token não encontrado. Faça login novamente.');

      const response = await fetch(ROUTES.exerciseDetail(prescriptionItemIdNumerico), {
        method: 'GET',
        headers: buildHeaders(token),
      });

      const json = await response.json();

      if (!response.ok) {
        const msg = json.message || `Erro ${response.status}`;
        setDetailsError(msg);
        setLoading(false);
        return;
      }

      const tags = [];
      if (json.taxonomy?.axis) tags.push(json.taxonomy.axis);
      if (json.taxonomy?.problem) tags.push(json.taxonomy.problem);
      if (json.taxonomy?.objective) tags.push(json.taxonomy.objective);
      if (tags.length === 0) {
        if (json.muscleGroup ?? json.muscle_group) tags.push(json.muscleGroup ?? json.muscle_group);
        if (json.category)                          tags.push(json.category);
      }

      setExercise({
        title:                json.title ?? json.name ?? '',
        videoUrl:             json.videoUrl ?? json.video_url ?? json.videoLink ?? '',
        description:          json.description ?? json.descricao ?? '',
        tags,
        metrics: {
          repetitionsRaw: json.metrics?.repetitionsRaw ?? json.metrics?.repetitions_raw ?? json.repetitions ?? '',
          series:         json.metrics?.series         ?? json.series ?? '',
          volume:         json.metrics?.volume         ?? json.volume ?? '',
          duration:       json.metrics?.duration       ?? json.duration ?? '',
        },
        instructions: Array.isArray(json.instructions)
          ? json.instructions.map((item, i) =>
              typeof item === 'string'
                ? { title: `Passo ${i + 1}`, description: item }
                : item
            )
          : [],
        physiotherapistNotes: json.physiotherapistNotes ?? json.physiotherapist_notes ?? json.notes ?? '',
      });
    } catch (error) {
      setDetailsError('offline');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    carregarDetalhesExercicio();
  }, []);

  const displayTitle       = exercise?.title       || tituloParam   || 'Exercício';
  const displayDescription = exercise?.description || descricaoParam || '';
  const displayVideoUrl    = exercise?.videoUrl    || null;
  const metrics            = exercise?.metrics     ?? {};
  const tags               = exercise?.tags        ?? [];
  const instructionItems   = exercise?.instructions ?? [];
  const physiotherapistNotes = exercise?.physiotherapistNotes ?? '';

  const toggleStep = (index) => {
    if (checkedSteps.includes(index)) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      setCheckedSteps(checkedSteps.filter(i => i !== index));
    } else {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setCheckedSteps([...checkedSteps, index]);
    }
  };

  const allStepsChecked = instructionItems.length === 0 || checkedSteps.length === instructionItems.length;

  async function concluirAtividade() {
    if (!prescriptionItemId) return;
    setSubmitting(true);
    try {
      const token = await AsyncStorage.getItem('@token');
      const response = await fetch(ROUTES.completePlanExercise(prescriptionItemId), {
        method: 'POST',
        headers: buildHeaders(token),
      });

      const json = await response.json();

      if (!response.ok) {
        Alert.alert('Erro', json.message || json.error || 'Não foi possível concluir o exercício.');
        return;
      }

      const executionId = json.executionId ?? json.execution_id ?? json.data?.executionId;
      if (!executionId) {
        Alert.alert('Erro', 'A finalização do exercício não retornou um ID de execução válido.');
        return;
      }

      navigation.navigate('Feedback', { executionId });
    } catch (error) {
      Alert.alert('Erro de conexão', 'Não foi possível concluir o exercício.');
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
        {detailsError === 'offline' ? (
          <View style={styles.offlineCard}>
            <MaterialCommunityIcons name="cloud-off-outline" size={48} color="#9CA3AF" style={{ marginBottom: 12 }} />
            <Text style={styles.offlineTitle}>Você está offline</Text>
            <Text style={styles.offlineDesc}>
              Parece que você está sem internet no momento. Verifique sua conexão para ver os detalhes completos e o vídeo deste exercício.
            </Text>
            <TouchableOpacity onPress={carregarDetalhesExercicio} style={styles.offlineRetryBtn}>
              <Text style={styles.offlineRetryText}>Tentar Novamente</Text>
            </TouchableOpacity>
          </View>
        ) : detailsError ? (
          <View style={styles.errorBanner}>
            <Text style={styles.errorText}>{detailsError}</Text>
            <TouchableOpacity onPress={carregarDetalhesExercicio} style={styles.retryLink}>
              <Text style={styles.retryLinkText}>Tentar novamente</Text>
            </TouchableOpacity>
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

        {tags.length > 0 ? (
          <View style={styles.tagRow}>
            {tags.map((tag, i) => (
              <PillTag key={i} label={String(tag).toUpperCase()} />
            ))}
          </View>
        ) : null}

        <Text style={styles.mainTitle}>{displayTitle}</Text>
        {displayDescription ? (
          <Text style={styles.exerciseSubtitle}>{displayDescription}</Text>
        ) : null}

        <VideoCard videoUrl={displayVideoUrl} />

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
            value={metrics.volume ? String(metrics.volume) : metrics.duration ? `${metrics.duration}min` : '—'}
            label={metrics.volume ? 'Volume' : 'Duração'}
          />
        </View>

        <ClinicalBadge name={coordinatorName} />

        {instructionItems.length > 0 ? (
          <>
            <View style={styles.checklistHeader}>
              <Text style={styles.sectionTitle}>Checklist do Exercício</Text>
              <Text style={styles.checklistSubtitle}>
                Toque nos passos conforme for completando:
              </Text>
            </View>
            <View style={styles.stepsContainer}>
              {instructionItems.map((item, index) => (
                <StepItem
                  key={`step-${index}`}
                  index={index + 1}
                  title={item.title}
                  description={item.description}
                  isLast={index === instructionItems.length - 1}
                  checked={checkedSteps.includes(index)}
                  onToggle={() => toggleStep(index)}
                />
              ))}
            </View>
          </>
        ) : null}

        <TipCard notes={physiotherapistNotes} />

      </ScrollView>

      {!allStepsChecked && instructionItems.length > 0 && (
        <Text style={styles.checklistWarning}>
          * Conclua todos os passos do checklist para continuar.
        </Text>
      )}

      <TouchableOpacity
        style={[styles.footerButton, (!allStepsChecked || submitting) && styles.footerButtonDisabled]}
        activeOpacity={0.8}
        onPress={concluirAtividade}
        disabled={!allStepsChecked || submitting}
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
  page:    { flex: 1, backgroundColor: COLORS.background },
  content: { paddingBottom: 24 },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: COLORS.background },
  headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: SPACING.md, paddingTop: SPACING.lg, paddingBottom: SPACING.md },
  backButton: { width: 40, height: 40, borderRadius: 12, backgroundColor: COLORS.white, alignItems: 'center', justifyContent: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.08, shadowRadius: 4, elevation: 2 },
  pageTitle:  { fontSize: 16, fontWeight: '700', color: COLORS.textDark },
  brandBadge: { width: 42, height: 42, borderRadius: 12, backgroundColor: COLORS.white, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#E5E7EB' },
  brandText: { fontSize: 10, fontWeight: '700', color: COLORS.primary },
  tagRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, paddingHorizontal: SPACING.md, marginBottom: SPACING.md },
  pill: { backgroundColor: '#E6F3E9', borderRadius: 999, paddingVertical: 8, paddingHorizontal: 14 },
  pillText: { fontSize: 11, fontWeight: '700', color: COLORS.primary, letterSpacing: 0.5 },
  mainTitle: { fontSize: 26, fontWeight: '800', color: COLORS.textDark, paddingHorizontal: SPACING.md, marginBottom: SPACING.sm, flexShrink: 1 },
  exerciseSubtitle: { fontSize: 14, color: COLORS.textMedium, paddingHorizontal: SPACING.md, flexShrink: 1, marginBottom: SPACING.lg, lineHeight: 20 },
  videoCard: { marginHorizontal: SPACING.md, borderRadius: 20, overflow: 'hidden', marginBottom: SPACING.lg, backgroundColor: '#1a1a2e' },
  videoPlaceholder: { height: 200, alignItems: 'center', justifyContent: 'center', gap: 12 },
  playButton: { width: 56, height: 56, borderRadius: 28, backgroundColor: COLORS.primary, alignItems: 'center', justifyContent: 'center' },
  videoTapText: { fontSize: 13, color: '#A0AEC0', fontWeight: '500' },
  videoAbsente: { fontSize: 13, color: '#A0AEC0', marginTop: 8, textAlign: 'center', paddingHorizontal: SPACING.lg },
  infoRow: { flexDirection: 'row', gap: 12, paddingHorizontal: SPACING.md, marginBottom: SPACING.lg },
  infoCard: { flex: 1, backgroundColor: COLORS.white, borderRadius: RADIUS.lg, padding: SPACING.sm, flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: '#E5E7EB', minWidth: 0 },
  infoIconBox: { width: 36, height: 36, borderRadius: 12, backgroundColor: '#E7F5EA', alignItems: 'center', justifyContent: 'center', marginRight: SPACING.sm },
  infoTextBlock: { flex: 1 },
  infoValue:  { fontSize: 15, fontWeight: '800', color: COLORS.textDark, flexShrink: 1 },
  infoLabel:  { fontSize: 11, color: COLORS.textMedium },
  checklistHeader: { paddingHorizontal: SPACING.md, marginBottom: SPACING.md },
  sectionTitle: { fontSize: 20, fontWeight: '800', color: COLORS.textDark, marginBottom: 4 },
  checklistSubtitle: { fontSize: 14, color: COLORS.textMedium },
  stepsContainer: { backgroundColor: '#fff', borderRadius: RADIUS.xl, marginHorizontal: SPACING.md, padding: SPACING.md, marginBottom: SPACING.xl, borderWidth: 1, borderColor: '#F3F4F6' },
  stepRow: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: SPACING.md },
  stepMarkerWrapper: { width: 40, alignItems: 'center' },
  stepMarker: { width: 34, height: 34, borderRadius: 17, backgroundColor: '#F3F4F6', alignItems: 'center', justifyContent: 'center', marginTop: 2, borderWidth: 2, borderColor: '#D1D5DB' },
  stepMarkerChecked: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  stepMarkerText: { color: COLORS.textMedium, fontWeight: '700', fontSize: 14 },
  stepLine: { width: 2, flex: 1, backgroundColor: '#E5E7EB', marginTop: 8, marginBottom: -4 },
  stepLineChecked: { backgroundColor: COLORS.primary },
  stepContent: { flex: 1, paddingLeft: SPACING.sm, minWidth: 0 },
  stepTitle: { fontSize: 16, fontWeight: '700', color: COLORS.textDark, marginBottom: 6 },
  stepTitleChecked: { color: COLORS.primary, textDecorationLine: 'line-through' },
  stepDescription: { fontSize: 14, color: COLORS.textMedium, lineHeight: 22, flexShrink: 1 },
  stepDescriptionChecked: { color: '#9CA3AF' },
  tipCard: { backgroundColor: COLORS.white, borderRadius: RADIUS.lg, padding: SPACING.md, marginHorizontal: SPACING.md, marginBottom: SPACING.lg, borderWidth: 1, borderColor: '#E5E7EB' },
  tipHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: SPACING.sm },
  tipBadge: { width: 36, height: 36, borderRadius: 12, backgroundColor: '#E6F3E9', alignItems: 'center', justifyContent: 'center', marginRight: SPACING.sm },
  tipTitle: { fontSize: 15, fontWeight: '700', color: COLORS.textDark },
  tipText:  { fontSize: 14, color: COLORS.textMedium, lineHeight: 22, flexShrink: 1 },
  errorBanner: { backgroundColor: '#FFF7E7', borderLeftWidth: 4, borderLeftColor: '#F59E0B', marginHorizontal: SPACING.md, marginBottom: SPACING.md, borderRadius: 14, padding: SPACING.md },
  errorText: { color: '#92400E', fontSize: 13, lineHeight: 18, marginBottom: 8 },
  retryLink: { alignSelf: 'flex-start' },
  retryLinkText: { fontSize: 13, color: COLORS.primary, fontWeight: '700' },
  checklistWarning: { textAlign: 'center', color: '#EF4444', fontSize: 12, marginBottom: SPACING.sm, fontWeight: '600' },
  footerButton: { backgroundColor: COLORS.primary, marginHorizontal: SPACING.md, marginBottom: SPACING.md, borderRadius: RADIUS.xl, paddingVertical: 18, alignItems: 'center', justifyContent: 'center' },
  footerButtonDisabled: { backgroundColor: '#D1D5DB' },
  footerButtonText: { color: COLORS.white, fontSize: 16, fontWeight: '800' },
  clinicalBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#ECFDF5', padding: 12, marginHorizontal: SPACING.md, borderRadius: RADIUS.lg, borderWidth: 1, borderColor: '#A7F3D0', marginBottom: SPACING.md },
  clinicalBadgeText: { fontSize: 13, color: '#065F46', marginLeft: 8, flexShrink: 1 },
  offlineCard: { backgroundColor: '#F3F4F6', marginHorizontal: SPACING.md, marginBottom: SPACING.lg, borderRadius: RADIUS.xl, padding: SPACING.xl, alignItems: 'center', borderWidth: 1, borderColor: '#E5E7EB', borderStyle: 'dashed' },
  offlineTitle: { fontSize: 18, fontWeight: '800', color: COLORS.textDark, marginBottom: 8 },
  offlineDesc: { fontSize: 14, color: COLORS.textMedium, textAlign: 'center', lineHeight: 22, marginBottom: 20 },
  offlineRetryBtn: { backgroundColor: COLORS.white, paddingHorizontal: 24, paddingVertical: 12, borderRadius: 99, borderWidth: 1, borderColor: '#D1D5DB' },
  offlineRetryText: { fontSize: 14, fontWeight: '700', color: COLORS.textDark },
});
