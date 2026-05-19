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
  // Só renderiza se vier nota real da API
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
// O projeto não tem expo-av nem react-native-video instalados.
// Exibimos um card clicável que abre o link no navegador quando há URL,
// ou um aviso neutro quando a API não retornar vídeo.

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

// ─── Tela principal ──────────────────────────────────────────────────────────

export default function ExerciseDetailScreen({ navigation, route }) {
  const [submitting, setSubmitting] = useState(false);
  const [exercise, setExercise] = useState(null);
  const [loading, setLoading] = useState(true);
  const [detailsError, setDetailsError] = useState(null);

  const prescriptionItemId = route?.params?.prescriptionItemId ?? route?.params?.id ?? null;
  // Fallbacks usam apenas os params passados pela tela anterior — sem strings inventadas
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

      // Normaliza categorias/tags vindas da API
      const tags = [];
      if (json.muscleGroup ?? json.muscle_group) tags.push(json.muscleGroup ?? json.muscle_group);
      if (json.category)                          tags.push(json.category);
      if (json.type ?? json.exerciseType)         tags.push(json.type ?? json.exerciseType);

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
        // Aceita instruções como array de objetos {title, description} ou array de strings
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
      console.log('Erro carregarDetalhesExercicio:', error);
      setDetailsError('Não foi possível carregar os detalhes. Verifique a conexão e tente novamente.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    carregarDetalhesExercicio();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Valores exibidos: preferência pela API, fallback pelos params da navegação
  const displayTitle       = exercise?.title       || tituloParam   || 'Exercício';
  const displayDescription = exercise?.description || descricaoParam || '';
  const displayVideoUrl    = exercise?.videoUrl    || null;
  const metrics            = exercise?.metrics     ?? {};
  const tags               = exercise?.tags        ?? [];
  const instructionItems   = exercise?.instructions ?? [];
  const physiotherapistNotes = exercise?.physiotherapistNotes ?? '';

  async function concluirAtividade() {
    if (!prescriptionItemId) {
      Alert.alert('Erro', 'Não foi possível identificar o exercício. Volte e tente novamente.');
      return;
    }

    setSubmitting(true);
    try {
      const token = await AsyncStorage.getItem('@token');
      if (!token) throw new Error('Token não encontrado. Faça login novamente.');

      const response = await fetch(ROUTES.completePlanExercise(prescriptionItemId), {
        method: 'POST',
        headers: buildHeaders(token),
      });

      const json = await response.json();

      if (!response.ok) {
        Alert.alert('Erro', json.message || json.error || 'Não foi possível concluir o exercício.');
        return;
      }

      const executionId =
        json.executionId    ??
        json.execution_id   ??
        json.data?.executionId ??
        json.data?.execution_id;

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

        {/* Erro de carregamento */}
        {detailsError ? (
          <View style={styles.errorBanner}>
            <Text style={styles.errorText}>{detailsError}</Text>
            <TouchableOpacity onPress={carregarDetalhesExercicio} style={styles.retryLink}>
              <Text style={styles.retryLinkText}>Tentar novamente</Text>
            </TouchableOpacity>
          </View>
        ) : null}

        {/* Header */}
        <View style={styles.headerRow}>
          <Pressable style={styles.backButton} onPress={() => navigation.goBack()}>
            <Feather name="arrow-left" size={20} color={COLORS.textDark} />
          </Pressable>
          <Text style={styles.pageTitle}>UNIFAE Care</Text>
          <View style={styles.brandBadge}>
            <Text style={styles.brandText}>UNIFAE</Text>
          </View>
        </View>

        {/* Tags da API (categoria, grupo muscular, tipo) */}
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

        {/* Vídeo */}
        <VideoCard videoUrl={displayVideoUrl} />

        {/* Métricas */}
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

        {/* Instruções da API */}
        {instructionItems.length > 0 ? (
          <>
            <Text style={styles.sectionTitle}>Passo a Passo</Text>
            {instructionItems.map((item, index) => (
              <StepItem
                key={`step-${index}`}
                index={index + 1}
                title={item.title}
                description={item.description}
                isLast={index === instructionItems.length - 1}
              />
            ))}
          </>
        ) : null}

        {/* Dicas da fisioterapeuta (só se vier da API) */}
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
  page:    { flex: 1, backgroundColor: COLORS.background },
  content: { paddingBottom: 24 },
  centered: {
    flex: 1, alignItems: 'center', justifyContent: 'center',
    backgroundColor: COLORS.background,
  },
  headerRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: SPACING.md, paddingTop: SPACING.lg, paddingBottom: SPACING.md,
  },
  backButton: {
    width: 40, height: 40, borderRadius: 12,
    backgroundColor: COLORS.white, alignItems: 'center', justifyContent: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08, shadowRadius: 4, elevation: 2,
  },
  pageTitle:  { fontSize: 16, fontWeight: '700', color: COLORS.textDark },
  brandBadge: {
    width: 42, height: 42, borderRadius: 12,
    backgroundColor: COLORS.white, alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, borderColor: '#E5E7EB',
  },
  brandText: { fontSize: 10, fontWeight: '700', color: COLORS.primary },
  tagRow: {
    flexDirection: 'row', flexWrap: 'wrap', gap: 8,
    paddingHorizontal: SPACING.md, marginBottom: SPACING.md,
  },
  pill: {
    backgroundColor: '#E6F3E9', borderRadius: 999,
    paddingVertical: 8, paddingHorizontal: 14,
  },
  pillText: { fontSize: 11, fontWeight: '700', color: COLORS.primary, letterSpacing: 0.5 },
  mainTitle: {
    fontSize: 26, fontWeight: '800', color: COLORS.textDark,
    paddingHorizontal: SPACING.md, marginBottom: SPACING.sm, flexShrink: 1,
  },
  exerciseSubtitle: {
    fontSize: 14, color: COLORS.textMedium,
    paddingHorizontal: SPACING.md, flexShrink: 1,
    marginBottom: SPACING.lg, lineHeight: 20,
  },
  // ── Vídeo ──
  videoCard: {
    marginHorizontal: SPACING.md, borderRadius: 20,
    overflow: 'hidden', marginBottom: SPACING.lg,
    backgroundColor: '#1a1a2e',
  },
  videoPlaceholder: {
    height: 200, alignItems: 'center', justifyContent: 'center', gap: 12,
  },
  playButton: {
    width: 56, height: 56, borderRadius: 28,
    backgroundColor: COLORS.primary,
    alignItems: 'center', justifyContent: 'center',
  },
  videoTapText: { fontSize: 13, color: '#A0AEC0', fontWeight: '500' },
  videoAbsente: {
    fontSize: 13, color: '#A0AEC0', marginTop: 8, textAlign: 'center',
    paddingHorizontal: SPACING.lg,
  },
  // ── Info cards ──
  infoRow: { flexDirection: 'row', gap: 12, paddingHorizontal: SPACING.md, marginBottom: SPACING.lg },
  infoCard: {
    flex: 1, backgroundColor: COLORS.white, borderRadius: RADIUS.lg, padding: SPACING.sm,
    flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: '#E5E7EB', minWidth: 0,
  },
  infoIconBox: {
    width: 36, height: 36, borderRadius: 12, backgroundColor: '#E7F5EA',
    alignItems: 'center', justifyContent: 'center', marginRight: SPACING.sm,
  },
  infoTextBlock: { flex: 1 },
  infoValue:  { fontSize: 15, fontWeight: '800', color: COLORS.textDark, flexShrink: 1 },
  infoLabel:  { fontSize: 11, color: COLORS.textMedium },
  // ── Steps ──
  sectionTitle: {
    fontSize: 18, fontWeight: '700', color: COLORS.textDark,
    paddingHorizontal: SPACING.md, marginBottom: SPACING.md,
  },
  stepRow:           { flexDirection: 'row', alignItems: 'flex-start', paddingHorizontal: SPACING.md, marginBottom: SPACING.md },
  stepMarkerWrapper: { width: 36, alignItems: 'center' },
  stepMarker: {
    width: 32, height: 32, borderRadius: 16,
    backgroundColor: COLORS.primary, alignItems: 'center', justifyContent: 'center', marginTop: 2,
  },
  stepMarkerText: { color: COLORS.white, fontWeight: '700' },
  stepLine: { width: 2, flex: 1, backgroundColor: '#D1D5DB', marginTop: 8, marginBottom: -4 },
  stepContent:     { flex: 1, paddingLeft: SPACING.sm, minWidth: 0 },
  stepTitle:       { fontSize: 15, fontWeight: '700', color: COLORS.textDark, marginBottom: 6 },
  stepDescription: { fontSize: 13, color: COLORS.textMedium, lineHeight: 20, flexShrink: 1 },
  // ── Tip card ──
  tipCard: {
    backgroundColor: COLORS.white, borderRadius: RADIUS.lg, padding: SPACING.md,
    marginHorizontal: SPACING.md, marginBottom: SPACING.lg,
    borderWidth: 1, borderColor: '#E5E7EB',
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06, shadowRadius: 6, elevation: 2,
  },
  tipHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: SPACING.sm },
  tipBadge: {
    width: 36, height: 36, borderRadius: 12, backgroundColor: '#E6F3E9',
    alignItems: 'center', justifyContent: 'center', marginRight: SPACING.sm,
  },
  tipTitle: { fontSize: 15, fontWeight: '700', color: COLORS.textDark },
  tipText:  { fontSize: 13, color: COLORS.textMedium, lineHeight: 20, flexShrink: 1 },
  // ── Erro ──
  errorBanner: {
    backgroundColor: '#FFF7E7', borderLeftWidth: 4, borderLeftColor: '#F59E0B',
    marginHorizontal: SPACING.md, marginBottom: SPACING.md, borderRadius: 14, padding: SPACING.md,
  },
  errorText:     { color: '#92400E', fontSize: 13, lineHeight: 18, marginBottom: 8 },
  retryLink:     { alignSelf: 'flex-start' },
  retryLinkText: { fontSize: 13, color: COLORS.primary, fontWeight: '700' },
  // ── Footer ──
  footerButton: {
    backgroundColor: COLORS.primary, marginHorizontal: SPACING.md, marginBottom: SPACING.md,
    borderRadius: RADIUS.xl, paddingVertical: 16, alignItems: 'center', justifyContent: 'center',
  },
  footerButtonDisabled: { opacity: 0.7 },
  footerButtonText: { color: COLORS.white, fontSize: 16, fontWeight: '700' },
});
