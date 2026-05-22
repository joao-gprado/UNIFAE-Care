// src/screens/ExerciciosScreen.js
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  Platform, StatusBar, RefreshControl, LayoutAnimation, UIManager, ScrollView
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { COLORS, SPACING, RADIUS } from '../theme';
import { ROUTES, buildHeaders } from '../services/api';

import CategoryChip from '../components/exercicios/CategoryChip';
import ExercicioCard from '../components/exercicios/ExercicioCard';
import ResumoCard from '../components/exercicios/ResumoCard';
import EmptyState from '../components/EmptyState';
import Skeleton from '../components/Skeleton';
import * as Haptics from 'expo-haptics';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

// ─── Helpers ───
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

export default function ExerciciosScreen({ navigation }) {
  const [exercicios, setExercicios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [erro, setErro] = useState(null);
  const [filtro, setFiltro] = useState('todos'); // 'todos' | 'pendentes' | 'concluidos'
  const [ordenarTempo, setOrdenarTempo] = useState(false);
  const [recentes, setRecentes] = useState([]);

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

  const carregarRecentes = useCallback(async () => {
    try {
      const rec = await AsyncStorage.getItem('@recent_views');
      if (rec) setRecentes(JSON.parse(rec));
    } catch(e) {}
  }, []);

  useEffect(() => {
    carregarExercicios();
  }, [carregarExercicios]);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      carregarExercicios();
      carregarRecentes();
    });
    return unsubscribe;
  }, [navigation, carregarExercicios, carregarRecentes]);

  const handleChangeFiltro = useCallback((novoFiltro) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setFiltro(novoFiltro);
  }, []);

  const exerciciosFiltrados = useMemo(() => {
    let lista = exercicios.filter(e => {
      if (filtro === 'pendentes') return !e.concluido;
      if (filtro === 'concluidos') return e.concluido;
      return true;
    });
    if (ordenarTempo) {
      lista = lista.sort((a, b) => a.tempoMedio - b.tempoMedio);
    }
    return lista;
  }, [exercicios, filtro, ordenarTempo]);

  const concluidos = useMemo(() => exercicios.filter(e => e.concluido).length, [exercicios]);

  const handlePressExercicio = useCallback(async (item) => {
    if (item.concluido) return; 
    
    // Salvar recente
    try {
      const rec = await AsyncStorage.getItem('@recent_views');
      let arr = rec ? JSON.parse(rec) : [];
      arr = arr.filter(x => x.id !== item.id);
      arr.unshift(item);
      if(arr.length > 5) arr.pop();
      await AsyncStorage.setItem('@recent_views', JSON.stringify(arr));
      setRecentes(arr);
    } catch(e) {}

    navigation.navigate('ExerciseDetail', {
      prescriptionItemId: item.id,
      titulo: item.titulo,
    });
  }, [navigation]);

  return (
    <View style={styles.root}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />

      <View style={styles.header}>
        <View style={styles.headerTopRow}>
          <View>
            <Text style={styles.headerTitle}>Meus Exercícios</Text>
            <Text style={styles.headerSubtitle}>Plano do dia de hoje</Text>
          </View>
          <TouchableOpacity 
            style={[styles.sortBtn, ordenarTempo && styles.sortBtnActive]} 
            onPress={() => {
               Haptics.selectionAsync();
               LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
               setOrdenarTempo(!ordenarTempo);
            }}
          >
            <Text style={[styles.sortBtnText, ordenarTempo && styles.sortBtnTextActive]}>⏱️ Duração</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Recentes */}
      {recentes.length > 0 && !erro && !loading && (
        <View style={styles.recentesContainer}>
          <Text style={styles.recentesTitle}>Vistos Recentemente</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.recentesScroll}>
            {recentes.map(r => (
              <TouchableOpacity key={`rec-${r.id}`} style={styles.recenteCard} onPress={() => handlePressExercicio(r)} activeOpacity={0.8}>
                <Text style={styles.recenteTitle} numberOfLines={1}>{r.titulo}</Text>
                <Text style={styles.recenteSub}>{r.tempoMedio ? `${r.tempoMedio} min` : 'Ver Detalhes'}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}

      {loading ? (
        <View style={{ paddingHorizontal: SPACING.md, gap: 12, marginTop: 16 }}>
           <Skeleton width="100%" height={90} borderRadius={RADIUS.xl} />
           <Skeleton width="100%" height={120} borderRadius={RADIUS.xl} />
           <Skeleton width="100%" height={120} borderRadius={RADIUS.xl} />
        </View>
      ) : erro ? (
        <EmptyState title="Erro de Conexão" description={erro} onRetry={() => carregarExercicios()} />
      ) : (
        <>
          {exercicios.length > 0 && (
            <ResumoCard total={exercicios.length} concluidos={concluidos} />
          )}

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
                onPress={() => handleChangeFiltro(f.key)}
              />
            ))}
          </View>

          <FlatList
            data={exerciciosFiltrados}
            keyExtractor={item => item.id}
            renderItem={({ item }) => (
              <ExercicioCard item={item} onPress={handlePressExercicio} />
            )}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={() => carregarExercicios(true)} colors={[COLORS.primary]} />
            }
            ListEmptyComponent={
              <View style={styles.emptyBox}>
                <Text style={styles.emptyIcon}>{filtro === 'concluidos' ? '🎉' : '📋'}</Text>
                <Text style={styles.emptyTitle}>
                  {filtro === 'concluidos' ? 'Nenhum exercício concluído ainda' : filtro === 'pendentes' ? 'Nenhum exercício pendente!' : 'Nenhum exercício no plano de hoje'}
                </Text>
                <Text style={styles.emptySubtitle}>
                  {filtro === 'pendentes' ? '🎉 Você concluiu todos os exercícios do dia!' : 'Puxe para baixo para atualizar.'}
                </Text>
              </View>
            }
          />
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: COLORS.background },
  header: { paddingTop: Platform.OS === 'android' ? (StatusBar.currentHeight ?? 24) + 12 : 20, paddingHorizontal: SPACING.md, paddingBottom: SPACING.md, backgroundColor: COLORS.background },
  headerTopRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  headerTitle: { fontSize: 28, fontWeight: '800', color: '#1a5d38', letterSpacing: -0.5 },
  headerSubtitle: { fontSize: 14, color: COLORS.textMedium, marginTop: 2 },
  sortBtn: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8, backgroundColor: '#E5E7EB' },
  sortBtnActive: { backgroundColor: '#D1FAE5' },
  sortBtnText: { fontSize: 12, fontWeight: '600', color: COLORS.textMedium },
  sortBtnTextActive: { color: COLORS.primary },
  recentesContainer: { marginBottom: SPACING.md },
  recentesTitle: { fontSize: 14, fontWeight: '700', color: COLORS.textDark, paddingHorizontal: SPACING.md, marginBottom: 8 },
  recentesScroll: { paddingHorizontal: SPACING.md, gap: 10 },
  recenteCard: { width: 140, backgroundColor: '#fff', borderRadius: RADIUS.md, padding: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 3, elevation: 2, borderWidth: 1, borderColor: '#F3F4F6' },
  recenteTitle: { fontSize: 13, fontWeight: '700', color: COLORS.textDark, marginBottom: 4 },
  recenteSub: { fontSize: 11, color: COLORS.primary, fontWeight: '600' },
  filtrosRow: { flexDirection: 'row', paddingHorizontal: SPACING.md, paddingBottom: SPACING.md },
  listContent: { paddingHorizontal: SPACING.md, paddingBottom: 100 },
  emptyBox: { alignItems: 'center', paddingTop: 60, paddingHorizontal: 32 },
  emptyIcon: { fontSize: 48, marginBottom: 16 },
  emptyTitle: { fontSize: 18, fontWeight: '700', color: COLORS.textDark, textAlign: 'center', marginBottom: 8 },
  emptySubtitle: { fontSize: 14, color: COLORS.textMedium, textAlign: 'center', lineHeight: 20 },
});
