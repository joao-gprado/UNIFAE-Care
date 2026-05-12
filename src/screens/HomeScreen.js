// src/screens/HomeScreen.js
import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
  StatusBar,
  Alert,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Svg, { Circle } from 'react-native-svg';
import { COLORS, SPACING, RADIUS } from '../theme';

import { ROUTES, buildHeaders } from '../services/api';

// ─── Helpers ───────────────────────────────────────────────────────────────────

function getMensagemProgresso(pct) {
  if (pct <= 40) return { texto: 'Você precisa se exercitar. Vamos começar?', emoji: '💪' };
  if (pct <= 79) return { texto: 'Você está indo bem!\nContinue assim.', emoji: '💚' };
  return { texto: 'Parabéns pelo resultado da semana!', emoji: '🏆' };
}

// ─── Progress Ring ─────────────────────────────────────────────────────────────

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
        <Circle
          cx={cx} cy={cy} r={r}
          stroke={COLORS.primary}
          strokeWidth={stroke}
          fill="none"
          strokeDasharray={circ}
          strokeDashoffset={offset}
          strokeLinecap="round"
          transform={`rotate(-90 ${cx} ${cy})`}
        />
      </Svg>
      <View style={StyleSheet.absoluteFill} pointerEvents="none">
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <Text style={{ fontSize: size * 0.2, fontWeight: '800', color: '#1a5d38' }}>
            {safe}%
          </Text>
        </View>
      </View>
    </View>
  );
}

// ─── Subcomponente: Header ─────────────────────────────────────────────────────

function HeaderSection({ nome }) {
  return (
    <View style={headerStyles.container}>
      <View style={headerStyles.textBlock}>
        <Text style={headerStyles.greeting}>Olá, {nome}!</Text>
        <Text style={headerStyles.subtitle}>
          Seu cuidado diário faz toda{'\n'}a diferença na sua recuperação.
        </Text>
      </View>
      <TouchableOpacity
        style={headerStyles.bellButton}
        onPress={() => Alert.alert('Notificações', 'Nenhuma notificação no momento.')}
        activeOpacity={0.7}
      >
        <Text style={headerStyles.bellIcon}>🔔</Text>
      </TouchableOpacity>
    </View>
  );
}

const headerStyles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.md,
    paddingTop: SPACING.md,
    paddingBottom: SPACING.lg,
  },
  textBlock: { flex: 1, paddingRight: SPACING.md },
  greeting: {
    fontSize: 28, fontWeight: '800', color: '#1a5d38',
    letterSpacing: -0.5, marginBottom: 6,
  },
  subtitle: { fontSize: 14, color: COLORS.textMedium, lineHeight: 21 },
  bellButton: {
    width: 42, height: 42, borderRadius: 21,
    backgroundColor: COLORS.backgroundWhite,
    alignItems: 'center', justifyContent: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08, shadowRadius: 4, elevation: 2, marginTop: 4,
  },
  bellIcon: { fontSize: 18 },
});

// ─── Subcomponente: PlanCard ───────────────────────────────────────────────────

function PlanCard({ exercicios }) {
  const pendentes = exercicios.filter(e => !e.concluido);
  const proximo = pendentes[0] ?? null;

  const handleIniciar = () => {
    if (!proximo) return;
    Alert.alert('Iniciar exercício', `Iniciando: ${proximo.titulo}`);
  };

  return (
    <View style={planStyles.card}>
      <View style={planStyles.cardHeader}>
        <Text style={planStyles.cardTitle}>Seu plano de hoje</Text>
        <Text style={planStyles.badge}>
          {pendentes.length} {pendentes.length === 1 ? 'exercício' : 'exercícios'}
        </Text>
      </View>

      {proximo ? (
        <View style={planStyles.exerciseBlock}>
          <View style={planStyles.exerciseInfo}>
            <Text style={planStyles.exerciseTitle}>{proximo.titulo}</Text>
            <Text style={planStyles.exerciseDesc}>{proximo.descricao}</Text>
            <View style={planStyles.timeRow}>
              <Text style={planStyles.clockIcon}>🕐</Text>
              <Text style={planStyles.timeText}>{proximo.tempoMedio} min</Text>
            </View>
          </View>
        </View>
      ) : (
        <View style={planStyles.emptyBlock}>
          <Text style={planStyles.emptyText}>🎉 Todos os exercícios concluídos!</Text>
        </View>
      )}

      <TouchableOpacity
        style={[planStyles.startButton, !proximo && planStyles.startButtonDisabled]}
        onPress={handleIniciar}
        activeOpacity={0.85}
        disabled={!proximo}
      >
        <Text style={planStyles.startButtonText}>
          {proximo ? 'Iniciar exercício' : 'Plano completo'}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const planStyles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.backgroundWhite,
    borderRadius: RADIUS.xl,
    marginHorizontal: SPACING.md,
    marginBottom: SPACING.md,
    padding: SPACING.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07, shadowRadius: 8, elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', marginBottom: SPACING.md,
  },
  cardTitle: { fontSize: 16, fontWeight: '700', color: COLORS.textDark },
  badge: { fontSize: 13, fontWeight: '600', color: COLORS.primary },
  exerciseBlock: {
    backgroundColor: '#F8FAF8', borderRadius: RADIUS.lg,
    padding: SPACING.md, marginBottom: SPACING.md,
    borderLeftWidth: 3, borderLeftColor: COLORS.primary,
  },
  exerciseInfo: {},
  exerciseTitle: { fontSize: 17, fontWeight: '700', color: '#1a5d38', marginBottom: 4 },
  exerciseDesc: { fontSize: 13, color: COLORS.textMedium, marginBottom: 10 },
  timeRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  clockIcon: { fontSize: 13 },
  timeText: { fontSize: 13, color: COLORS.textMedium, fontWeight: '500' },
  emptyBlock: {
    backgroundColor: '#F0FBF3', borderRadius: RADIUS.lg,
    padding: SPACING.md, marginBottom: SPACING.md, alignItems: 'center',
  },
  emptyText: { fontSize: 14, color: COLORS.primary, fontWeight: '600' },
  startButton: {
    backgroundColor: '#1a5d38', borderRadius: RADIUS.lg,
    paddingVertical: 16, alignItems: 'center',
  },
  startButtonDisabled: { backgroundColor: COLORS.textLight },
  startButtonText: { color: COLORS.white, fontSize: 16, fontWeight: '700', letterSpacing: 0.3 },
});

// ─── Subcomponente: ProgressCard ───────────────────────────────────────────────

function ProgressCard({ percent }) {
  const { texto, emoji } = getMensagemProgresso(percent);
  return (
    <View style={progressStyles.card}>
      <Text style={progressStyles.cardTitle}>Seu progresso</Text>
      <View style={progressStyles.row}>
        <ProgressRing percent={percent} size={90} stroke={9} />
        <View style={progressStyles.messageBlock}>
          <Text style={progressStyles.emoji}>{emoji}</Text>
          <Text style={progressStyles.message}>{texto}</Text>
        </View>
      </View>
    </View>
  );
}

const progressStyles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.backgroundWhite, borderRadius: RADIUS.xl,
    marginHorizontal: SPACING.md, marginBottom: SPACING.md,
    padding: SPACING.md,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07, shadowRadius: 8, elevation: 3,
  },
  cardTitle: { fontSize: 16, fontWeight: '700', color: COLORS.textDark, marginBottom: SPACING.md },
  row: { flexDirection: 'row', alignItems: 'center', gap: SPACING.md },
  messageBlock: { flex: 1, gap: 4 },
  emoji: { fontSize: 22, marginBottom: 2 },
  message: { fontSize: 14, fontWeight: '600', color: COLORS.textDark, lineHeight: 20 },
});

// ─── Normalização de dados da API ──────────────────────────────────────────────
// Adapta diferentes estruturas de resposta para o formato interno da tela.

function normalizarExercicios(raw) {
  if (!Array.isArray(raw)) return [];
  return raw.map((item, i) => ({
    id:        String(item.id ?? i),
    titulo:    item.titulo   ?? item.title    ?? item.name        ?? 'Exercício',
    descricao: item.descricao ?? item.description ?? item.subtitle ?? '',
    tempoMedio: item.tempoMedio ?? item.duration ?? item.durationMinutes ?? 0,
    concluido: item.concluido  ?? item.completed  ?? item.done    ?? false,
  }));
}

// ─── Tela principal ────────────────────────────────────────────────────────────

export default function HomeScreen({ navigation }) {
  const [nomeUsuario, setNomeUsuario]         = useState('');
  const [progressoSemanal, setProgressoSemanal] = useState(0);
  const [planoDoDia, setPlanoDoDia]           = useState([]);
  const [loading, setLoading]                 = useState(true);
  const [refreshing, setRefreshing]           = useState(false);
  const [erro, setErro]                       = useState(null);

  const carregarDados = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    setErro(null);

    try {
      const token = await AsyncStorage.getItem('@token');
      const headers = buildHeaders(token);

      // Rota unificada que retorna perfil, progresso semanal e dados do app
      const response = await fetch(ROUTES.homeProfile, { headers });

      if (response.ok) {
        const json = await response.json();

        // Nome do usuário vem em json.profile.name
        const nome = json.profile?.name ?? json.profile?.firstName ?? '';
        setNomeUsuario(nome);

        // Progresso semanal vem em json.weeklyProgress.percentCompleted
        const pct = json.weeklyProgress?.percentCompleted
          ?? json.weeklyProgress?.percent
          ?? 0;
        setProgressoSemanal(pct);

        // Exercícios do dia — se a API retornar no futuro, normaliza aqui
        const exerciciosRaw = json.exercises ?? json.todayExercises ?? json.data ?? [];
        setPlanoDoDia(normalizarExercicios(exerciciosRaw));

      } else {
        // Fallback: usa dado salvo no login para o nome
        const usuarioSalvo = await AsyncStorage.getItem('@usuario');
        if (usuarioSalvo) {
          const u = JSON.parse(usuarioSalvo);
          setNomeUsuario(u.nome ?? u.name ?? u.firstName ?? '');
        }
        const json = await response.json().catch(() => ({}));
        const mensagem = json.message || json.error || 'Erro ao carregar dados da home.';
        setErro(mensagem);
      }

    } catch (error) {
      // Fallback de nome em caso de falha de rede
      try {
        const usuarioSalvo = await AsyncStorage.getItem('@usuario');
        if (usuarioSalvo) {
          const u = JSON.parse(usuarioSalvo);
          setNomeUsuario(u.nome ?? u.name ?? u.firstName ?? '');
        }
      } catch (_) {}
      setErro('Não foi possível carregar os dados. Verifique sua conexão.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { carregarDados(); }, [carregarDados]);

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={COLORS.primary ?? '#2A7A3B'} />
      </View>
    );
  }

  return (
    <View style={styles.root}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => carregarDados(true)}
            colors={[COLORS.primary ?? '#2A7A3B']}
          />
        }
      >
        {erro ? (
          <View style={styles.erroBanner}>
            <Text style={styles.erroTexto}>{erro}</Text>
            <TouchableOpacity onPress={() => carregarDados()}>
              <Text style={styles.erroLink}>Tentar novamente</Text>
            </TouchableOpacity>
          </View>
        ) : null}

        <HeaderSection nome={nomeUsuario || 'Usuário'} />
        <TouchableOpacity
          style={styles.exerciseButton}
          activeOpacity={0.8}
          onPress={() => navigation.navigate('ExerciseDetail')}
        >
          <Text style={styles.exerciseButtonText}>Ver exercício da semana</Text>
        </TouchableOpacity>
        <PlanCard exercicios={planoDoDia} />
        <ProgressCard percent={progressoSemanal} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: COLORS.background },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: COLORS.background },
  scroll: { flex: 1 },
  content: {
    paddingTop: Platform.OS === 'android'
      ? (StatusBar.currentHeight ?? 24) + 8
      : 16,
    paddingBottom: 100,
  },
  erroBanner: {
    backgroundColor: '#FFF5F5',
    borderLeftWidth: 4,
    borderLeftColor: '#E53E3E',
    marginHorizontal: SPACING.md,
    marginBottom: SPACING.md,
    borderRadius: 10,
    padding: 14,
  },
  erroTexto: { fontSize: 13, color: '#E53E3E', marginBottom: 6 },
  erroLink: { fontSize: 13, color: '#2A7A3B', fontWeight: '700' },
  exerciseButton: {
    backgroundColor: COLORS.primary,
    marginHorizontal: SPACING.md,
    marginBottom: SPACING.md,
    borderRadius: RADIUS.xl,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 2,
  },
  exerciseButtonText: {
    color: COLORS.white,
    fontSize: 15,
    fontWeight: '700',
  },
});