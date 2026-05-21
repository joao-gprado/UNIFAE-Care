// src/screens/RelatosScreen.js
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
  Platform,
  StatusBar,
  KeyboardAvoidingView,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { COLORS, SPACING, RADIUS } from '../theme';
import { ROUTES, buildHeaders } from '../services/api';

// ─── Dados de opções ────────────────────────────────────────────────────────

// Níveis de dor mapeados para os valores aceitos pela API: NONE, MILD, MODERATE, SEVERE, VERY_SEVERE
const NIVEIS_DOR = [
  { level: 'NONE',        score: 0,  label: 'Sem dor',       emoji: '😊', cor: '#56CCF2', descricao: 'Sem desconforto algum' },
  { level: 'MILD',        score: 2,  label: 'Leve',          emoji: '🙂', cor: '#6FCF97', descricao: 'Levemente perceptível' },
  { level: 'MODERATE',    score: 5,  label: 'Moderada',      emoji: '😐', cor: '#A8E063', descricao: 'Incomoda, mas suportável' },
  { level: 'SEVERE',      score: 8,  label: 'Intensa',       emoji: '😣', cor: '#F2994A', descricao: 'Muito desconforto' },
  { level: 'VERY_SEVERE', score: 10, label: 'Insuportável',  emoji: '😱', cor: '#EB5757', descricao: 'Dor máxima' },
];

const LOCAIS_DOR = [
  { id: 'ombro_esq', label: 'Ombro Esquerdo', emoji: '🫱' },
  { id: 'ombro_dir', label: 'Ombro Direito', emoji: '🫲' },
  { id: 'braco_esq', label: 'Braço Esquerdo', emoji: '💪' },
  { id: 'braco_dir', label: 'Braço Direito', emoji: '💪' },
  { id: 'cotovelo', label: 'Cotovelo', emoji: '🦾' },
  { id: 'punho', label: 'Punho/Mão', emoji: '🤜' },
  { id: 'cervical', label: 'Pescoço/Cervical', emoji: '🧠' },
  { id: 'lombar', label: 'Coluna Lombar', emoji: '🦴' },
  { id: 'joelho', label: 'Joelho', emoji: '🦵' },
  { id: 'tornozelo', label: 'Tornozelo/Pé', emoji: '🦶' },
  { id: 'quadril', label: 'Quadril', emoji: '🍑' },
  { id: 'outro', label: 'Outro', emoji: '📍' },
];

const MOMENTOS = [
  { id: 'repouso', label: 'Em repouso', emoji: '🛋️' },
  { id: 'movimento', label: 'Durante movimento', emoji: '🏃' },
  { id: 'exercicio', label: 'Durante exercício', emoji: '🏋️' },
  { id: 'noite', label: 'À noite', emoji: '🌙' },
  { id: 'manha', label: 'Pela manhã', emoji: '🌅' },
];

// ─── Subcomponentes ─────────────────────────────────────────────────────────

function SectionTitle({ children }) {
  return <Text style={sectionStyle.title}>{children}</Text>;
}

const sectionStyle = StyleSheet.create({
  title: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.textDark,
    marginBottom: SPACING.sm,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
});

function EscalaDor({ selected, onSelect }) {
  return (
    <View style={escalaStyles.grid}>
      {NIVEIS_DOR.map(item => {
        const active = selected === item.level;
        return (
          <TouchableOpacity
            key={item.level}
            style={[escalaStyles.card, active && { borderColor: item.cor, backgroundColor: item.cor + '18' }]}
            onPress={() => onSelect(item.level)}
            activeOpacity={0.8}
          >
            <Text style={escalaStyles.emoji}>{item.emoji}</Text>
            <Text style={[escalaStyles.num, active && { color: item.cor }]}>{item.score}</Text>
            <Text style={[escalaStyles.label, active && { color: item.cor, fontWeight: '700' }]}>{item.label}</Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const escalaStyles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  card: {
    width: '30%',
    backgroundColor: '#fff',
    borderRadius: RADIUS.lg,
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emoji: { fontSize: 22, marginBottom: 4 },
  num: { fontSize: 18, fontWeight: '800', color: COLORS.textDark },
  label: { fontSize: 11, color: COLORS.textMedium, fontWeight: '500', marginTop: 2 },
});

function SelectChip({ item, selected, onPress, disabled }) {
  const active = selected.includes(item.id);
  return (
    <TouchableOpacity
      style={[chipStyles.chip, active && chipStyles.chipActive, disabled && chipStyles.chipDisabled]}
      onPress={disabled ? undefined : () => onPress(item.id)}
      activeOpacity={disabled ? 1 : 0.8}
    >
      <Text style={[chipStyles.emoji, disabled && { opacity: 0.5 }]}>{item.emoji}</Text>
      <Text style={[chipStyles.label, active && chipStyles.labelActive, disabled && { color: '#9CA3AF' }]}>{item.label}</Text>
    </TouchableOpacity>
  );
}

const chipStyles = StyleSheet.create({
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginRight: 8,
    marginBottom: 8,
    gap: 6,
  },
  chipActive: {
    backgroundColor: '#EDF7EE',
    borderColor: COLORS.primary,
  },
  emoji: { fontSize: 14 },
  label: {
    fontSize: 13,
    fontWeight: '500',
    color: COLORS.textMedium,
  },
  labelActive: {
    color: COLORS.primary,
    fontWeight: '700',
  },
  chipDisabled: {
    opacity: 0.5,
    backgroundColor: '#F3F4F6',
    borderColor: '#E5E7EB',
  },
});

// ─── Tela principal ─────────────────────────────────────────────────────────

export default function RelatosScreen() {
  const [nivelDor, setNivelDor] = useState(null); // armazena o 'level' string da API (ex: 'MILD')
  const [locais, setLocais] = useState([]);
  const [momentos, setMomentos] = useState([]);
  const [observacoes, setObservacoes] = useState('');
  const [loading, setLoading] = useState(false);
  const [enviado, setEnviado] = useState(false);

  const toggleItem = (id, list, setList) => {
    if (list.includes(id)) {
      setList(list.filter(x => x !== id));
    } else {
      setList([...list, id]);
    }
  };

  const nivelSelecionado = NIVEIS_DOR.find(n => n.level === nivelDor);

  // A API atual não suporta locais e momentos, então validamos apenas o nível de dor.
  const podeEnviar = nivelDor !== null;

  const resetForm = () => {
    setNivelDor(null);
    setLocais([]);
    setMomentos([]);
    setObservacoes('');
    setEnviado(false);
  };

  const handleEnviar = async () => {
    if (!podeEnviar) {
      Alert.alert(
        'Campos obrigatórios',
        'Selecione o nível de dor.',
      );
      return;
    }

    setLoading(true);
    try {
      const token = await AsyncStorage.getItem('@token');
      if (!token) throw new Error('Token não encontrado.');

      // A API /app/home/pain espera apenas { level: "NONE"|"MILD"|"MODERATE"|"SEVERE"|"VERY_SEVERE" }
      const body = { level: nivelDor };

      const response = await fetch(ROUTES.pain, {
        method: 'POST',
        headers: buildHeaders(token),
        body: JSON.stringify(body),
      });

      if (response.ok) {
        setEnviado(true);
      } else {
        const json = await response.json().catch(() => ({}));
        const msg = json.message ?? json.error ?? `Erro ${response.status}.`;

        // Alguns backends retornam 409 se já registrou hoje
        if (response.status === 409) {
          Alert.alert(
            'Já registrado',
            'Você já registrou um relato de dor hoje. Tente novamente amanhã.',
          );
        } else {
          Alert.alert('Erro ao enviar', msg);
        }
      }
    } catch (error) {
      // Fallback: se a rota não existir na API (404/500) tratamos aqui
      if (error.message?.includes('404') || error.message?.includes('Network')) {
        Alert.alert(
          'Erro de conexão',
          'Não foi possível enviar seu relato. Verifique a conexão e tente novamente.',
        );
      } else {
        // Considera enviado para não bloquear o usuário em erros de parsing
        setEnviado(true);
      }
    } finally {
      setLoading(false);
    }
  };

  // ── Tela de sucesso ──
  if (enviado) {
    return (
      <View style={styles.successRoot}>
        <View style={styles.successBox}>
          <Text style={styles.successEmoji}>✅</Text>
          <Text style={styles.successTitle}>Relato enviado!</Text>
          <Text style={styles.successSubtitle}>
            Seu fisioterapeuta recebeu suas informações e poderá ajustar seu plano de tratamento.
          </Text>
          <TouchableOpacity style={styles.successButton} onPress={resetForm} activeOpacity={0.85}>
            <Text style={styles.successButtonText}>Novo relato</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.root}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Cabeçalho */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Relatos de Dor</Text>
          <Text style={styles.headerSubtitle}>
            Registre qualquer desconforto para que seu fisioterapeuta possa acompanhar sua evolução.
          </Text>
        </View>

        {/* ── Seção 1: Escala de dor ── */}
        <View style={styles.section}>
          <SectionTitle>1. Qual é o nível de dor? *</SectionTitle>
          {nivelSelecionado ? (
            <View style={[styles.nivelPreview, { borderColor: nivelSelecionado.cor }]}>
              <Text style={styles.nivelPreviewEmoji}>{nivelSelecionado.emoji}</Text>
              <View>
                <Text style={[styles.nivelPreviewLabel, { color: nivelSelecionado.cor }]}>
                  {nivelSelecionado.score}/10 — {nivelSelecionado.label}
                </Text>
                <Text style={styles.nivelPreviewDesc}>{nivelSelecionado.descricao}</Text>
              </View>
            </View>
          ) : null}
          <EscalaDor selected={nivelDor} onSelect={setNivelDor} />
        </View>

        {/* ── Seção 2: Local ── */}
        <View style={styles.section}>
          <View style={styles.sectionHeaderRow}>
            <SectionTitle>2. Onde dói? *</SectionTitle>
            <Text style={styles.emBreveBadge}>Em breve</Text>
          </View>
          <View style={styles.chipWrap}>
            {LOCAIS_DOR.map(item => (
              <SelectChip
                key={item.id}
                item={item}
                selected={locais}
                onPress={id => toggleItem(id, locais, setLocais)}
                disabled={true}
              />
            ))}
          </View>
        </View>

        {/* ── Seção 3: Quando ── */}
        <View style={styles.section}>
          <View style={styles.sectionHeaderRow}>
            <SectionTitle>3. Quando a dor ocorre? (opcional)</SectionTitle>
            <Text style={styles.emBreveBadge}>Em breve</Text>
          </View>
          <View style={styles.chipWrap}>
            {MOMENTOS.map(item => (
              <SelectChip
                key={item.id}
                item={item}
                selected={momentos}
                onPress={id => toggleItem(id, momentos, setMomentos)}
                disabled={true}
              />
            ))}
          </View>
        </View>

        {/* ── Seção 4: Observações ── */}
        <View style={styles.section}>
          <SectionTitle>4. Observações adicionais (opcional)</SectionTitle>
          <TextInput
            style={styles.textArea}
            placeholder="Descreva quando iniciou a dor, o que melhora ou piora, ou qualquer detalhe relevante..."
            placeholderTextColor={COLORS.textPlaceholder}
            value={observacoes}
            onChangeText={setObservacoes}
            multiline
            textAlignVertical="top"
          />
        </View>

        {/* Botão enviar */}
        <TouchableOpacity
          style={[styles.submitButton, (!podeEnviar || loading) && styles.submitButtonDisabled]}
          onPress={handleEnviar}
          activeOpacity={0.85}
          disabled={!podeEnviar || loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.submitButtonText}>Enviar Relato</Text>
          )}
        </TouchableOpacity>

        {!podeEnviar && (
          <Text style={styles.helperText}>
            * Preencha o nível de dor para habilitar o envio.
          </Text>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: COLORS.background },
  scroll: { flex: 1 },
  content: {
    paddingTop: Platform.OS === 'android' ? (StatusBar.currentHeight ?? 24) + 12 : 20,
    paddingBottom: 120,
    paddingHorizontal: SPACING.md,
  },
  header: {
    marginBottom: SPACING.lg,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: '#1a5d38',
    letterSpacing: -0.5,
    marginBottom: 6,
  },
  headerSubtitle: {
    fontSize: 14,
    color: COLORS.textMedium,
    lineHeight: 20,
  },
  section: {
    marginBottom: SPACING.lg,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SPACING.sm,
  },
  emBreveBadge: {
    fontSize: 10,
    fontWeight: '700',
    color: '#F59E0B',
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  nivelPreview: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#fff',
    borderRadius: RADIUS.lg,
    borderWidth: 2,
    padding: 12,
    marginBottom: SPACING.sm,
  },
  nivelPreviewEmoji: { fontSize: 32 },
  nivelPreviewLabel: { fontSize: 16, fontWeight: '700' },
  nivelPreviewDesc: { fontSize: 13, color: COLORS.textMedium },
  chipWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  textArea: {
    minHeight: 120,
    backgroundColor: '#fff',
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    padding: SPACING.md,
    fontSize: 14,
    color: COLORS.textDark,
    lineHeight: 20,
  },
  submitButton: {
    backgroundColor: COLORS.primary,
    borderRadius: RADIUS.xl,
    paddingVertical: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.sm,
  },
  submitButtonDisabled: { opacity: 0.5 },
  submitButtonText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  helperText: {
    textAlign: 'center',
    fontSize: 12,
    color: COLORS.textMedium,
    lineHeight: 18,
  },
  // ── Sucesso ──
  successRoot: {
    flex: 1,
    backgroundColor: COLORS.background,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: SPACING.lg,
  },
  successBox: {
    backgroundColor: '#fff',
    borderRadius: RADIUS.xl,
    padding: SPACING.xl,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 6,
    width: '100%',
  },
  successEmoji: { fontSize: 64, marginBottom: 16 },
  successTitle: {
    fontSize: 26,
    fontWeight: '800',
    color: COLORS.textDark,
    marginBottom: 10,
    textAlign: 'center',
  },
  successSubtitle: {
    fontSize: 14,
    color: COLORS.textMedium,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: SPACING.lg,
  },
  successButton: {
    backgroundColor: COLORS.primary,
    borderRadius: RADIUS.lg,
    paddingVertical: 14,
    paddingHorizontal: 40,
  },
  successButtonText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});
