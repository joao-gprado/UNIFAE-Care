// src/screens/ProgressoScreen.js
import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Platform,
  StatusBar,
  RefreshControl,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Svg, { Circle, Rect, G, Text as SvgText } from 'react-native-svg';
import { COLORS, SPACING, RADIUS } from '../theme';
import { ROUTES, buildHeaders } from '../services/api';
import Skeleton from '../components/Skeleton';

// ─── Helpers ────────────────────────────────────────────────────────────────

const DIAS_SEMANA = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

function getMensagem(pct) {
  if (pct >= 90) return { texto: 'Desempenho excelente! 🏆', cor: '#6FCF97' };
  if (pct >= 70) return { texto: 'Ótimo progresso! Continue assim 💚', cor: COLORS.primary };
  if (pct >= 40) return { texto: 'Você está no caminho certo 👍', cor: '#F2C94C' };
  return { texto: 'Vamos nos movimentar mais esta semana 💪', cor: '#F2994A' };
}

// ─── Anel de progresso grande ───────────────────────────────────────────────

function BigProgressRing({ percent, size = 160, stroke = 14 }) {
  const safe = Math.min(100, Math.max(0, percent));
  const r = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ - (safe / 100) * circ;
  const cx = size / 2;
  const cy = size / 2;
  const { texto, cor } = getMensagem(safe);

  return (
    <View style={{ alignItems: 'center' }}>
      <View style={{ width: size, height: size }}>
        <Svg width={size} height={size}>
          <Circle cx={cx} cy={cy} r={r} stroke="#DDE8DE" strokeWidth={stroke} fill="none" />
          <Circle
            cx={cx} cy={cy} r={r}
            stroke={cor}
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
            <Text style={{ fontSize: size * 0.22, fontWeight: '800', color: cor }}>{safe}%</Text>
            <Text style={{ fontSize: 12, color: COLORS.textMedium, fontWeight: '500' }}>concluído</Text>
          </View>
        </View>
      </View>
      <Text style={[ringStyles.mensagem, { color: cor }]}>{texto}</Text>
    </View>
  );
}

const ringStyles = StyleSheet.create({
  mensagem: {
    marginTop: 12,
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
});

// ─── Gráfico de barras semanal ───────────────────────────────────────────────

function BarChart({ dados }) {
  // dados: array de { dia: 'Seg', pct: 80 }
  const barWidth = 28;
  const chartH = 100;
  const gap = 14;
  const width = dados.length * (barWidth + gap);

  return (
    <View style={barStyles.wrap}>
      <Svg width={width} height={chartH + 24}>
        {dados.map((d, i) => {
          const x = i * (barWidth + gap);
          const isToday = d.isHoje;
          const semDados = d.semDados && d.pct === 0;

          // Dias sem dado real: barra mínima tracejada, cor neutra
          const barH = semDados ? 4 : Math.max(4, (d.pct / 100) * chartH);
          const y    = chartH - barH;
          const cor  = semDados
            ? '#E5E7EB'
            : d.pct >= 70 ? COLORS.primary
            : d.pct >= 40 ? '#F2C94C'
            : '#F2994A';

          return (
            <G key={d.dia}>
              {/* Barra fundo */}
              <Rect x={x} y={0} width={barWidth} height={chartH} rx={8} fill="#F0F4F0" />
              {/* Barra valor */}
              <Rect x={x} y={y} width={barWidth} height={barH} rx={8} fill={cor} />
              {/* Label dia */}
              <SvgText
                x={x + barWidth / 2}
                y={chartH + 16}
                textAnchor="middle"
                fontSize={11}
                fontWeight={isToday ? '700' : '500'}
                fill={isToday ? COLORS.primary : COLORS.textMedium}
              >
                {d.dia}
              </SvgText>
            </G>
          );
        })}
      </Svg>
    </View>
  );
}

const barStyles = StyleSheet.create({
  wrap: {
    alignItems: 'center',
    marginVertical: SPACING.sm,
  },
});

// ─── Card de estatística ─────────────────────────────────────────────────────

function StatCard({ emoji, valor, label, cor }) {
  return (
    <View style={[statStyles.card, { borderTopColor: cor, borderTopWidth: 3 }]}>
      <Text style={statStyles.emoji}>{emoji}</Text>
      <Text style={[statStyles.valor, { color: cor }]}>{valor}</Text>
      <Text style={statStyles.label}>{label}</Text>
    </View>
  );
}

const statStyles = StyleSheet.create({
  card: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: RADIUS.lg,
    padding: 14,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  emoji: { fontSize: 22, marginBottom: 6 },
  valor: { fontSize: 22, fontWeight: '800' },
  label: { fontSize: 11, color: COLORS.textMedium, fontWeight: '500', textAlign: 'center', marginTop: 4 },
});

// ─── Monta dados do gráfico semanal a partir da API ─────────────────────────
// A API retorna weeklyProgress com from/to e percentCompleted para o período.
// Como não há endpoint de histórico diário, exibimos apenas o dia de hoje com
// valor real e os demais dias com 0, deixando claro visualmente o que é dado
// real (hoje) versus sem dados (dias anteriores/futuros sem endpoint).

function montarDadosSemana(percentHoje, weeklyProgressRaw) {
  const hoje = new Date().getDay(); // 0=Dom … 6=Sáb

  // Se a API retornar breakdown diário no futuro, use aqui.
  // Por enquanto: somente hoje tem valor real; o resto fica 0.
  return DIAS_SEMANA.map((dia, i) => ({
    dia,
    pct:    i === hoje ? percentHoje : 0,
    isHoje: i === hoje,
    semDados: i !== hoje, // flag para o gráfico diferenciar visualmente
  }));
}

// ─── Tela principal ──────────────────────────────────────────────────────────

export default function ProgressoScreen({ navigation }) {
  const [dados, setDados] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [erro, setErro] = useState(null);

  const carregarProgresso = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    setErro(null);

    try {
      const token = await AsyncStorage.getItem('@token');
      const headers = buildHeaders(token);

      // Carrega perfil (contém weeklyProgress)
      const profileRes = await fetch(ROUTES.homeProfile, { headers });
      let percentSemanal = 0;
      let totalExercicios = 0;
      let concluidosTotal = 0;
      let nome = '';

      if (profileRes.ok) {
        const profileJson = await profileRes.json();
        percentSemanal = profileJson.weeklyProgress?.percentCompleted ?? profileJson.weeklyProgress?.percent ?? 0;
        nome = profileJson.profile?.name ?? '';
      }

      // Carrega dados agregados mais atuais (que já vêm mastigados da API)
      const homeRes = await fetch(ROUTES.home, { headers });
      if (homeRes.ok) {
        const homeJson = await homeRes.json();
        if (homeJson.plan) {
          if (homeJson.plan.percentCompleted != null) percentSemanal = homeJson.plan.percentCompleted;
          if (homeJson.plan.totalExercises != null) totalExercicios = homeJson.plan.totalExercises;
          if (homeJson.plan.completedExercises != null) concluidosTotal = homeJson.plan.completedExercises;
        }
      }

      const dadosSemana = montarDadosSemana(percentSemanal, null);

      setDados({
        percentSemanal,
        totalExercicios,
        concluidosTotal,
        pendentes: totalExercicios - concluidosTotal,
        dadosSemana,
        nome,
      });
    } catch (error) {
      setErro('Não foi possível carregar o progresso. Verifique sua conexão.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    carregarProgresso();
  }, [carregarProgresso]);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      carregarProgresso();
    });
    return unsubscribe;
  }, [navigation, carregarProgresso]);

  if (loading) {
    return (
      <View style={styles.root}>
        <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />
        <View style={styles.content}>
          <View style={styles.header}>
            <Skeleton width={180} height={34} borderRadius={6} style={{ marginBottom: 8 }} />
            <Skeleton width={120} height={18} borderRadius={4} />
          </View>
          <View style={[styles.card, { alignItems: 'flex-start' }]}>
            <Skeleton width={130} height={14} borderRadius={4} style={{ marginBottom: 16 }} />
            <Skeleton width={160} height={160} borderRadius={80} style={{ alignSelf: 'center' }} />
          </View>
          <View style={styles.statsRow}>
            <Skeleton style={{ flex: 1 }} height={90} borderRadius={RADIUS.lg} />
            <Skeleton style={{ flex: 1 }} height={90} borderRadius={RADIUS.lg} />
            <Skeleton style={{ flex: 1 }} height={90} borderRadius={RADIUS.lg} />
          </View>
          <View style={[styles.card, { alignItems: 'flex-start' }]}>
            <Skeleton width={150} height={14} borderRadius={4} style={{ marginBottom: 16 }} />
            <Skeleton width="100%" height={120} borderRadius={8} />
          </View>
        </View>
      </View>
    );
  }

  if (erro) {
    return (
      <View style={styles.centered}>
        <Text style={styles.erroEmoji}>📡</Text>
        <Text style={styles.erroTexto}>{erro}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={() => carregarProgresso()}>
          <Text style={styles.retryTexto}>Tentar novamente</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const { percentSemanal, totalExercicios, concluidosTotal, pendentes, dadosSemana } = dados;
  const hoje = new Date();
  const diaSemanaHoje = DIAS_SEMANA[hoje.getDay()];

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
            onRefresh={() => carregarProgresso(true)}
            colors={[COLORS.primary]}
          />
        }
      >
        {/* Cabeçalho */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Meu Progresso</Text>
          <Text style={styles.headerSubtitle}>
            {diaSemanaHoje},{' '}
            {hoje.toLocaleDateString('pt-BR', { day: 'numeric', month: 'long' })}
          </Text>
        </View>

        {/* Anel de progresso */}
        <View style={styles.card}>
          <Text style={styles.cardLabel}>PROGRESSO SEMANAL</Text>
          <BigProgressRing percent={percentSemanal} />
        </View>

        {/* Estatísticas */}
        <View style={styles.statsRow}>
          <StatCard emoji="🏋️" valor={String(totalExercicios)} label="Exercícios no plano" cor="#56CCF2" />
          <StatCard emoji="✅" valor={String(concluidosTotal)} label="Concluídos hoje" cor="#6FCF97" />
          <StatCard emoji="⏳" valor={String(pendentes)} label="Pendentes" cor="#F2994A" />
        </View>

        {/* Gráfico semanal */}
        <View style={styles.card}>
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.cardLabelRow}>ATIVIDADE DA SEMANA</Text>
            <Text style={styles.emBreveBadge}>Em breve</Text>
          </View>
          <Text style={styles.cardSubLabel}>Percentual de exercícios (Aguardando liberação do Backend)</Text>
          <BarChart dados={dadosSemana} />

          {/* Legenda */}
          <View style={styles.legendaRow}>
            <View style={styles.legendaItem}>
              <View style={[styles.legendaDot, { backgroundColor: COLORS.primary }]} />
              <Text style={styles.legendaTexto}>≥ 70%</Text>
            </View>
            <View style={styles.legendaItem}>
              <View style={[styles.legendaDot, { backgroundColor: '#F2C94C' }]} />
              <Text style={styles.legendaTexto}>40–69%</Text>
            </View>
            <View style={styles.legendaItem}>
              <View style={[styles.legendaDot, { backgroundColor: '#E5E7EB' }]} />
              <Text style={styles.legendaTexto}>Sem registro</Text>
            </View>
          </View>
        </View>

        {/* Dica motivacional */}
        <View style={styles.dicaCard}>
          <Text style={styles.dicaEmoji}>💡</Text>
          <View style={styles.dicaTexto}>
            <Text style={styles.dicaTitulo}>Dica do dia</Text>
            <Text style={styles.dicaConteudo}>
              {percentSemanal >= 70
                ? 'Você está indo muito bem! Consistência é a chave para uma recuperação completa.'
                : percentSemanal >= 40
                ? 'Tente realizar pelo menos um exercício por dia. Pequenos passos fazem grande diferença!'
                : 'Comece hoje! Qualquer atividade conta. Seu fisioterapeuta está torcendo por você.'}
            </Text>
          </View>
        </View>

        {/* Botão de acesso rápido para exercícios */}
        <TouchableOpacity
          style={styles.ctaButton}
          onPress={() => navigation.navigate('Exercícios')}
          activeOpacity={0.85}
        >
          <Text style={styles.ctaButtonText}>Ver exercícios de hoje 🏃</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: COLORS.background },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.background,
    paddingHorizontal: SPACING.lg,
  },
  loadingText: { marginTop: 12, fontSize: 14, color: COLORS.textMedium },
  erroEmoji: { fontSize: 48, marginBottom: 16 },
  erroTexto: { fontSize: 15, color: COLORS.error, textAlign: 'center', marginBottom: 20 },
  retryButton: {
    backgroundColor: COLORS.primary,
    borderRadius: RADIUS.lg,
    paddingVertical: 12,
    paddingHorizontal: 28,
  },
  retryTexto: { color: '#fff', fontWeight: '700', fontSize: 15 },
  scroll: { flex: 1 },
  content: {
    paddingTop: Platform.OS === 'android' ? (StatusBar.currentHeight ?? 24) + 12 : 20,
    paddingBottom: 120,
    paddingHorizontal: SPACING.md,
  },
  header: { marginBottom: SPACING.lg },
  headerTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: '#1a5d38',
    letterSpacing: -0.5,
  },
  headerSubtitle: { fontSize: 14, color: COLORS.textMedium, marginTop: 4 },
  card: {
    backgroundColor: '#fff',
    borderRadius: RADIUS.xl,
    padding: SPACING.md,
    marginBottom: SPACING.md,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  cardLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.textMedium,
    letterSpacing: 1,
    textTransform: 'uppercase',
    alignSelf: 'flex-start',
    marginBottom: SPACING.md,
  },
  cardLabelRow: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.textMedium,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: SPACING.md,
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
  cardSubLabel: {
    fontSize: 12,
    color: COLORS.textMedium,
    alignSelf: 'flex-start',
    marginTop: -10,
    marginBottom: SPACING.md,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: SPACING.md,
  },
  legendaRow: {
    flexDirection: 'row',
    gap: 16,
    marginTop: SPACING.sm,
    alignSelf: 'flex-start',
  },
  legendaItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  legendaDot: { width: 10, height: 10, borderRadius: 5 },
  legendaTexto: { fontSize: 11, color: COLORS.textMedium },
  dicaCard: {
    flexDirection: 'row',
    backgroundColor: '#EDF7EE',
    borderRadius: RADIUS.xl,
    padding: SPACING.md,
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: '#B7DFC4',
    gap: 12,
    alignItems: 'flex-start',
  },
  dicaEmoji: { fontSize: 24, marginTop: 2 },
  dicaTexto: { flex: 1 },
  dicaTitulo: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1a5d38',
    marginBottom: 4,
  },
  dicaConteudo: {
    fontSize: 13,
    color: COLORS.textMedium,
    lineHeight: 20,
  },
  ctaButton: {
    backgroundColor: '#1a5d38',
    borderRadius: RADIUS.xl,
    paddingVertical: 16,
    alignItems: 'center',
  },
  ctaButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
});
