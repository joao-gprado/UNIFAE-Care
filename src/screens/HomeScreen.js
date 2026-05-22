// src/screens/HomeScreen.js
import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  Platform, StatusBar, ActivityIndicator, RefreshControl,
  Animated
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

import { COLORS, SPACING, RADIUS } from '../theme';
import RobotAssistant from '../components/RobotAssistant';
import { ROUTES, buildHeaders } from '../services/api';

import HeaderSection from '../components/home/HeaderSection';
import PainAlert from '../components/home/PainAlert';
import PlanCard from '../components/home/PlanCard';
import ProgressCard from '../components/home/ProgressCard';
import MilestoneModal from '../components/home/MilestoneModal';
import Skeleton from '../components/Skeleton';

// ─── Helpers ───
async function agendarNotificacaoLocal(shouldSchedule) {
  try {
    const { status } = await Notifications.getPermissionsAsync();
    let finalStatus = status;
    if (status !== 'granted') {
      const { status: newStatus } = await Notifications.requestPermissionsAsync();
      finalStatus = newStatus;
    }
    if (finalStatus !== 'granted') return;

    await Notifications.cancelAllScheduledNotificationsAsync();

    if (shouldSchedule) {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: 'O Robô do UNIFAE Care sentiu sua falta! 🤖',
          body: 'Você ainda tem exercícios pendentes hoje. Que tal tirar 10 minutinhos para se cuidar?',
          sound: true,
        },
        trigger: { seconds: 60 * 60 * 24 }, // 24 horas
      });
    }
  } catch (e) {
    console.log('Erro ao agendar notificação', e);
  }
}

// ─── Lógica de Streak ───
async function updateAndGetStreak() {
  try {
    const todayStr = new Date().toISOString().split('T')[0];
    const streakData = await AsyncStorage.getItem('@streak');
    let streakCount = 1;
    let lastDate = todayStr;
    let hitMilestone = false;

    if (streakData) {
      const parsed = JSON.parse(streakData);
      lastDate = parsed.lastDate;
      streakCount = parsed.count;

      if (lastDate !== todayStr) {
        const last = new Date(lastDate);
        const today = new Date(todayStr);
        const diffTime = Math.abs(today - last);
        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays === 1) {
          streakCount += 1;
          if ([3, 7, 14, 21, 30, 50, 100].includes(streakCount)) {
            hitMilestone = true;
          }
        } else if (diffDays > 1) {
          streakCount = 1;
        }
      }
    }
    
    await AsyncStorage.setItem('@streak', JSON.stringify({ count: streakCount, lastDate: todayStr }));
    return { count: streakCount, hitMilestone };
  } catch (e) {
    return { count: 1, hitMilestone: false };
  }
}

// ─── Tela principal ───
export default function HomeScreen({ navigation }) {
  const [nomeUsuario, setNomeUsuario] = useState('');
  const [nextVisitDate, setNextVisitDate] = useState(null);
  
  // Agrupamento de estados da Home (Fase 1)
  const [homeData, setHomeData] = useState({
    progressoSemanal: 0,
    nextExercise: null,
    plan: null,
    painToday: null,
    motivationalMessage: null,
  });

  const [streak, setStreak] = useState(1);
  const [showMilestone, setShowMilestone] = useState(false);
  const [milestoneValue, setMilestoneValue] = useState(0);
  
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [erro, setErro] = useState(null);

  // Animações (Fase 3)
  const planAnim = useRef(new Animated.Value(0)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;

  const animarEntrada = useCallback(() => {
    planAnim.setValue(0);
    progressAnim.setValue(0);
    Animated.stagger(150, [
      Animated.spring(planAnim, { toValue: 1, friction: 6, useNativeDriver: true }),
      Animated.spring(progressAnim, { toValue: 1, friction: 6, useNativeDriver: true })
    ]).start();
  }, [planAnim, progressAnim]);

  useEffect(() => {
    if (!loading && !erro) {
      animarEntrada();
    }
  }, [loading, erro, animarEntrada]);

  const carregarDados = useCallback(async (isRefresh = false) => {
    if (isRefresh) {
      setRefreshing(true);
    }
    setErro(null);

    try {
      if (!isRefresh) {
        const cache = await AsyncStorage.getItem('@homeCache');
        if (cache) {
          try {
            const json = JSON.parse(cache);
            setHomeData({
              progressoSemanal: json.plan?.percentCompleted ?? 0,
              plan: json.plan ?? null,
              nextExercise: json.nextExercise ?? null,
              painToday: json.painToday ?? null,
              motivationalMessage: json.motivation ?? null,
            });
            setLoading(false); 
          } catch(e) {}
        } else {
          setLoading(true); 
        }
      }

      const token = await AsyncStorage.getItem('@token');
      const headers = buildHeaders(token);

      const usuarioSalvo = await AsyncStorage.getItem('@usuario');
      if (usuarioSalvo) {
        const u = JSON.parse(usuarioSalvo);
        setNomeUsuario(u.nome ?? u.name ?? u.firstName ?? '');
        setNextVisitDate(u.nextVisitDate ?? null);
      }
      
      const streakRes = await updateAndGetStreak();
      setStreak(streakRes.count);
      if (streakRes.hitMilestone) {
         setMilestoneValue(streakRes.count);
         setShowMilestone(true);
      }

      const homeResponse = await fetch(ROUTES.home, { headers });
      if (homeResponse.ok) {
        const json = await homeResponse.json();
        
        await AsyncStorage.setItem('@homeCache', JSON.stringify(json));
        
        setHomeData({
          progressoSemanal: json.plan?.percentCompleted ?? 0,
          plan: json.plan ?? null,
          nextExercise: json.nextExercise ?? null,
          painToday: json.painToday ?? null,
          motivationalMessage: json.motivation ?? null,
        });

        if (json.plan) {
          const totalEx = json.plan.totalExercises || 0;
          const isComplete = totalEx > 0 && (json.plan.completedExercises >= totalEx);
          agendarNotificacaoLocal(!isComplete);
        }
      } else {
        const cache = await AsyncStorage.getItem('@homeCache');
        if (!cache) setErro('Não foi possível carregar os dados. Verifique sua conexão.');
      }
    } catch (error) {
      const cache = await AsyncStorage.getItem('@homeCache');
      if (!cache) setErro('Sem conexão. Verifique sua internet e tente novamente.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      carregarDados();
    });
    return unsubscribe;
  }, [navigation, carregarDados]);

  return (
    <View style={styles.root}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={() => carregarDados(true)} colors={[COLORS.primary ?? '#2A7A3B']} />
        }
      >
        <MilestoneModal visible={showMilestone} streak={milestoneValue} onClose={() => setShowMilestone(false)} />

        {erro ? (
          <View style={styles.erroBanner}>
            <Text style={styles.erroTexto}>{erro}</Text>
            <TouchableOpacity onPress={() => carregarDados()}>
              <Text style={styles.erroLink}>Tentar novamente</Text>
            </TouchableOpacity>
          </View>
        ) : null}

        <HeaderSection nome={nomeUsuario || 'Usuário'} streak={streak} nextVisitDate={nextVisitDate} painToday={homeData.painToday} />

        {/* Skeleton State */}
        {loading ? (
          <View style={{ paddingHorizontal: SPACING.md, gap: 16, marginTop: 10 }}>
            <Skeleton width="100%" height={160} borderRadius={RADIUS.xl} />
            <Skeleton width="100%" height={140} borderRadius={RADIUS.xl} />
            <Skeleton width="100%" height={120} borderRadius={RADIUS.xl} />
          </View>
        ) : (
          <>
            {homeData.painToday && homeData.painToday.recorded === false && (
              <PainAlert navigation={navigation} />
            )}

            <View style={styles.motivationCard}>
              <View style={styles.motivationHeader}>
                <Text style={styles.motivationIcon}>💡</Text>
                <Text style={styles.motivationTitle}>Citação do dia</Text>
              </View>
              <View style={styles.motivationContent}>
                <View style={styles.robotContainer}>
                  <RobotAssistant size={110} />
                </View>
                <View style={styles.quoteContainer}>
                  <Text style={styles.motivationText}>
                    "{homeData.motivationalMessage?.message ?? 'Vamos começar o dia com energia!'}"
                  </Text>
                </View>
              </View>
            </View>

            <Animated.View style={{ opacity: planAnim, transform: [{ translateY: planAnim.interpolate({ inputRange: [0, 1], outputRange: [20, 0] }) }] }}>
              <PlanCard
                nextExercise={homeData.nextExercise}
                plan={homeData.plan}
                onStart={item => navigation.navigate('ExerciseDetail', {
                  prescriptionItemId: item.prescriptionItemId || item.id,
                  titulo: item.exerciseName || item.title,
                })}
              />
            </Animated.View>
            
            <Animated.View style={{ opacity: progressAnim, transform: [{ translateY: progressAnim.interpolate({ inputRange: [0, 1], outputRange: [20, 0] }) }] }}>
              <ProgressCard percent={homeData.progressoSemanal} />
            </Animated.View>
          </>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: COLORS.background },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: COLORS.background },
  scroll: { flex: 1 },
  content: { paddingTop: Platform.OS === 'android' ? (StatusBar.currentHeight ?? 24) + 8 : 16, paddingBottom: 100 },
  erroBanner: { backgroundColor: '#FFF5F5', borderLeftWidth: 4, borderLeftColor: '#E53E3E', marginHorizontal: SPACING.md, marginBottom: SPACING.md, borderRadius: 10, padding: 14 },
  erroTexto: { fontSize: 13, color: '#E53E3E', marginBottom: 6 },
  erroLink: { fontSize: 13, color: '#2A7A3B', fontWeight: '700' },
  motivationCard: { backgroundColor: COLORS.primaryLight ?? '#E7F5EA', marginHorizontal: SPACING.md, marginBottom: SPACING.lg, borderRadius: RADIUS.xl, padding: SPACING.md, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 6, elevation: 2 },
  motivationHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: SPACING.md },
  motivationIcon: { fontSize: 18, marginRight: 6 },
  motivationTitle: { fontSize: 14, fontWeight: '700', color: '#1a5d38', textTransform: 'uppercase', letterSpacing: 0.5 },
  motivationContent: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: SPACING.md },
  robotContainer: { width: 130, height: 130, alignItems: 'center', justifyContent: 'center', flexShrink: 0, overflow: 'visible' },
  quoteContainer: { flex: 1, justifyContent: 'center' },
  motivationText: { fontSize: 16, color: '#1a5d38', fontStyle: 'italic', lineHeight: 24, fontWeight: '500' },
});