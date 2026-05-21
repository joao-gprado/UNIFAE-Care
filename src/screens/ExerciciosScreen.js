// src/screens/ExerciciosScreen.js
import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Platform,
  StatusBar,
  RefreshControl,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { COLORS, SPACING, RADIUS } from '../theme';
import { ROUTES, buildHeaders } from '../services/api';

// ─── Helpers ───────────────────────────────────────────────────────────────

function normalizarExercicios(raw) {
  if (!Array.isArray(raw)) return [];
  return raw.map((item, i) => ({
    id:         String(item.prescriptionItemId ?? item.id ?? i),
    titulo:     item.title ?? item.titulo ?? item.name ?? 'Exercício',
    descricao:  item.taxonomy?.axis ?? item.taxonomy?.problem ?? item.description ?? item.descricao ?? '',
    tempoMedio: item.duration ?? item.tempoMedio ?? item.durationMinutes ?? 0,
    concluido:  item.completedToday ?? item.completed ?? item.concluido ?? item.done ?? false,
    series:     item.metrics?.series ?? item.series ?? null,
    repeticoes: item.metrics?.repetitionsRaw ?? item.repetitions ?? null,
    categoria:  item.taxonomy?.axis ?? item.category ?? item.muscleGroup ?? null,
  }));
}

// ─── Componente: Chip de categoria ─────────────────────────────────────────

function CategoryChip({ label, active, onPress }) {
  return (
    <TouchableOpacity
      style={[chipStyles.chip, active && chipStyles.chipActive]}
      onPress={onPress}
      activeOpacity={0.75}
    >
      <Text style={[chipStyles.label, active && chipStyles.labelActive]}>{label}</Text>
    </TouchableOpacity>
  );
}

const chipStyles = StyleSheet.create({
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginRight: 8,
  },
  chipActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textMedium,
  },
  labelActive: {
    color: '#fff',
  },
});

// ─── Componente: Card de exercício ─────────────────────────────────────────

function ExercicioCard({ item, onPress }) {
  const concluido = item.concluido;

  return (
    <TouchableOpacity
      style={[cardStyles.card, concluido && cardStyles.cardConcluido]}
      onPress={() => onPress(item)}
      activeOpacity={0.85}
    >
      {/* Indicador lateral de status */}
      <View style={[cardStyles.statusBar, { backgroundColor: concluido ? '#6FCF97' : COLORS.primary }]} />

      <View style={cardStyles.body}>
        {/* Linha superior: título + badge */}
        <View style={cardStyles.headerRow}>
          <Text style={[cardStyles.titulo, concluido && cardStyles.tituloConcluido]} numberOfLines={1}>
            {item.titulo}
          </Text>
          {concluido ? (
            <View style={cardStyles.badgeConcluido}>
              <Text style={cardStyles.badgeConcluidoText}>✓</Text>
            </View>
          ) : (
            <View style={cardStyles.badgePendente}>
              <Text style={cardStyles.badgePendenteText}>Pendente</Text>
            </View>
          )}
        </View>

        {/* Descrição */}
        {item.descricao ? (
          <Text style={cardStyles.descricao} numberOfLines={2}>
            {item.descricao}
          </Text>
        ) : null}

        {/* Métricas */}
        <View style={cardStyles.metricRow}>
          {item.tempoMedio > 0 && (
            <View style={cardStyles.metric}>
              <Text style={cardStyles.metricIcon}>🕐</Text>
              <Text style={cardStyles.metricText}>{item.tempoMedio} min</Text>
            </View>
          )}
          {item.series && (
            <View style={cardStyles.metric}>
              <Text style={cardStyles.metricIcon}>🔄</Text>
              <Text style={cardStyles.metricText}>{item.series} séries</Text>
            </View>
          )}
          {item.repeticoes && (
            <View style={cardStyles.metric}>
              <Text style={cardStyles.metricIcon}>💪</Text>
              <Text style={cardStyles.metricText}>{item.repeticoes} rep</Text>
            </View>
          )}
          {item.categoria && (
            <View style={cardStyles.metric}>
              <Text style={cardStyles.metricIcon}>🎯</Text>
              <Text style={cardStyles.metricText}>{item.categoria}</Text>
            </View>
          )}
        </View>
      </View>

      {/* Seta */}
      {!concluido && (
        <Text style={cardStyles.chevron}>›</Text>
      )}
    </TouchableOpacity>
  );
}

const cardStyles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: RADIUS.xl,
    marginBottom: 10,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  cardConcluido: {
    opacity: 0.72,
  },
  statusBar: {
    width: 5,
    borderTopLeftRadius: RADIUS.xl,
    borderBottomLeftRadius: RADIUS.xl,
  },
  body: {
    flex: 1,
    padding: SPACING.md,
    paddingLeft: 12,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  titulo: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.textDark,
    flex: 1,
    marginRight: 8,
  },
  tituloConcluido: {
    textDecorationLine: 'line-through',
    color: COLORS.textMedium,
  },
  badgeConcluido: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#6FCF97',
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeConcluidoText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '800',
  },
  badgePendente: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    backgroundColor: '#EDF7EE',
  },
  badgePendenteText: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.primary,
  },
  descricao: {
    fontSize: 13,
    color: COLORS.textMedium,
    lineHeight: 18,
    marginBottom: 8,
  },
  metricRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  metric: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metricIcon: { fontSize: 12 },
  metricText: {
    fontSize: 12,
    color: COLORS.textMedium,
    fontWeight: '500',
  },
  chevron: {
    fontSize: 24,
    color: COLORS.textLight,
    alignSelf: 'center',
    paddingRight: 14,
    lineHeight: 28,
  },
});

// ─── Componente: Resumo do progresso ───────────────────────────────────────

function ResumoCard({ total, concluidos }) {
  const pendentes = total - concluidos;
  const pct = total > 0 ? Math.round((concluidos / total) * 100) : 0;

  return (
    <View style={resumoStyles.card}>
      <View style={resumoStyles.col}>
        <Text style={resumoStyles.num}>{total}</Text>
        <Text style={resumoStyles.label}>Total</Text>
      </View>
      <View style={resumoStyles.divider} />
      <View style={resumoStyles.col}>
        <Text style={[resumoStyles.num, { color: '#6FCF97' }]}>{concluidos}</Text>
        <Text style={resumoStyles.label}>Feitos</Text>
      </View>
      <View style={resumoStyles.divider} />
      <View style={resumoStyles.col}>
        <Text style={[resumoStyles.num, { color: '#F2994A' }]}>{pendentes}</Text>
        <Text style={resumoStyles.label}>Pendentes</Text>
      </View>
      <View style={resumoStyles.divider} />
      <View style={resumoStyles.col}>
        <Text style={[resumoStyles.num, { color: COLORS.primary }]}>{pct}%</Text>
        <Text style={resumoStyles.label}>Progresso</Text>
      </View>
    </View>
  );
}

const resumoStyles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: RADIUS.xl,
    marginHorizontal: SPACING.md,
    marginBottom: SPACING.md,
    paddingVertical: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  col: {
    flex: 1,
    alignItems: 'center',
  },
  num: {
    fontSize: 22,
    fontWeight: '800',
    color: COLORS.textDark,
  },
  label: {
    fontSize: 11,
    color: COLORS.textMedium,
    fontWeight: '500',
    marginTop: 2,
  },
  divider: {
    width: 1,
    backgroundColor: '#E5E7EB',
    marginVertical: 4,
  },
});

// ─── Tela principal ─────────────────────────────────────────────────────────

export default function ExerciciosScreen({ navigation }) {
  const [exercicios, setExercicios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [erro, setErro] = useState(null);
  const [filtro, setFiltro] = useState('todos'); // 'todos' | 'pendentes' | 'concluidos'

  const carregarExercicios = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    setErro(null);

    try {
      const token = await AsyncStorage.getItem('@token');
      const response = await fetch(ROUTES.planExercises, {
        method: 'GET',
        headers: buildHeaders(token),
      });

      if (response.ok) {
        const json = await response.json();
        const raw = json.items ?? json.exercises ?? json.data ?? [];
        setExercicios(normalizarExercicios(raw));
      } else if (response.status === 401) {
        setErro('Sessão expirada. Faça login novamente.');
      } else {
        setErro('Não foi possível carregar os exercícios. Tente novamente.');
      }
    } catch (error) {
      setErro('Sem conexão. Verifique sua internet e tente novamente.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    carregarExercicios();
  }, [carregarExercicios]);

  // Foco na aba = recarregar
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      carregarExercicios();
    });
    return unsubscribe;
  }, [navigation, carregarExercicios]);

  const exerciciosFiltrados = exercicios.filter(e => {
    if (filtro === 'pendentes') return !e.concluido;
    if (filtro === 'concluidos') return e.concluido;
    return true;
  });

  const concluidos = exercicios.filter(e => e.concluido).length;

  const handlePressExercicio = (item) => {
    if (item.concluido) return; // exercício já concluído, não abre
    navigation.navigate('ExerciseDetail', {
      prescriptionItemId: item.id,
      titulo: item.titulo,
    });
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Carregando exercícios…</Text>
      </View>
    );
  }

  return (
    <View style={styles.root}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />

      {/* Header fixo */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Meus Exercícios</Text>
        <Text style={styles.headerSubtitle}>Plano do dia de hoje</Text>
      </View>

      {/* Erro banner */}
      {erro ? (
        <View style={styles.erroBanner}>
          <Text style={styles.erroTexto}>{erro}</Text>
          <TouchableOpacity onPress={() => carregarExercicios()}>
            <Text style={styles.erroLink}>Tentar novamente</Text>
          </TouchableOpacity>
        </View>
      ) : null}

      {/* Resumo */}
      {!erro && exercicios.length > 0 && (
        <ResumoCard total={exercicios.length} concluidos={concluidos} />
      )}

      {/* Filtros */}
      <View style={styles.filtrosRow}>
        {[
          { key: 'todos', label: 'Todos' },
          { key: 'pendentes', label: 'Pendentes' },
          { key: 'concluidos', label: 'Concluídos' },
        ].map(f => (
          <CategoryChip
            key={f.key}
            label={f.label}
            active={filtro === f.key}
            onPress={() => setFiltro(f.key)}
          />
        ))}
      </View>

      {/* Lista */}
      <FlatList
        data={exerciciosFiltrados}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <ExercicioCard item={item} onPress={handlePressExercicio} />
        )}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => carregarExercicios(true)}
            colors={[COLORS.primary]}
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyBox}>
            <Text style={styles.emptyIcon}>
              {filtro === 'concluidos' ? '🎉' : '📋'}
            </Text>
            <Text style={styles.emptyTitle}>
              {filtro === 'concluidos'
                ? 'Nenhum exercício concluído ainda'
                : filtro === 'pendentes'
                ? 'Nenhum exercício pendente!'
                : 'Nenhum exercício no plano de hoje'}
            </Text>
            <Text style={styles.emptySubtitle}>
              {filtro === 'pendentes'
                ? '🎉 Você concluiu todos os exercícios do dia!'
                : 'Puxe para baixo para atualizar.'}
            </Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.background,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: COLORS.textMedium,
  },
  header: {
    paddingTop: Platform.OS === 'android' ? (StatusBar.currentHeight ?? 24) + 12 : 20,
    paddingHorizontal: SPACING.md,
    paddingBottom: SPACING.md,
    backgroundColor: COLORS.background,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: '#1a5d38',
    letterSpacing: -0.5,
  },
  headerSubtitle: {
    fontSize: 14,
    color: COLORS.textMedium,
    marginTop: 2,
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
  erroTexto: {
    fontSize: 13,
    color: '#E53E3E',
    marginBottom: 6,
  },
  erroLink: {
    fontSize: 13,
    color: COLORS.primary,
    fontWeight: '700',
  },
  filtrosRow: {
    flexDirection: 'row',
    paddingHorizontal: SPACING.md,
    paddingBottom: SPACING.md,
  },
  listContent: {
    paddingHorizontal: SPACING.md,
    paddingBottom: 100,
  },
  emptyBox: {
    alignItems: 'center',
    paddingTop: 60,
    paddingHorizontal: 32,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.textDark,
    textAlign: 'center',
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: COLORS.textMedium,
    textAlign: 'center',
    lineHeight: 20,
  },
});
