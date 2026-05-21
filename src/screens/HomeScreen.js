// src/screens/HomeScreen.js
import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  Platform, StatusBar, ActivityIndicator, RefreshControl,
  Animated, Modal
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
import Svg, { Circle } from 'react-native-svg';
import { COLORS, SPACING, RADIUS } from '../theme';
import RobotAssistant from '../components/RobotAssistant';
import { ROUTES, buildHeaders } from '../services/api';

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

function getMensagemProgresso(pct) {
  if (pct <= 40) return { texto: 'Você precisa se exercitar. Vamos começar?', emoji: '💪' };
  if (pct <= 79) return { texto: 'Você está indo bem!\nContinue assim.', emoji: '💚' };
  return { texto: 'Parabéns pelo resultado da semana!', emoji: '🏆' };
}

// ─── Progress Ring ───
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
        <Circle cx={cx} cy={cy} r={r} stroke={COLORS.primary} strokeWidth={stroke} fill="none" strokeDasharray={circ} strokeDashoffset={offset} strokeLinecap="round" transform={`rotate(-90 ${cx} ${cy})`} />
      </Svg>
      <View style={StyleSheet.absoluteFill} pointerEvents="none">
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <Text style={{ fontSize: size * 0.2, fontWeight: '800', color: '#1a5d38' }}>{safe}%</Text>
        </View>
      </View>
    </View>
  );
}

function HeaderSection({ nome, streak, nextVisitDate, painToday }) {
  const dataFormatada = nextVisitDate 
    ? new Date(nextVisitDate).toLocaleDateString('pt-BR') 
    : null;

  let subtitle = 'Seu cuidado diário faz toda a diferença na sua recuperação.';
  
  // Saudação Dinâmica baseada no último registro de dor ou no streak
  if (painToday && painToday.recorded && painToday.level !== undefined) {
    if (painToday.level >= 7) {
      subtitle = 'Vi que a dor estava forte. Tente focar em exercícios mais suaves hoje.';
    } else if (painToday.level <= 3) {
      subtitle = 'Que ótimo que a dor está controlada! Vamos manter o ótimo ritmo.';
    }
  } else if (streak >= 3) {
    subtitle = `Você já está numa ofensiva de ${streak} dias! Que dedicação incrível.`;
  }

  return (
    <View style={headerStyles.container}>
      <View style={headerStyles.textBlock}>
        <Text style={headerStyles.greeting}>Olá, {nome}!</Text>
        <Text style={headerStyles.subtitle}>{subtitle}</Text>
        {dataFormatada && (
          <View style={headerStyles.visitRow}>
            <Text style={headerStyles.visitIcon}>📅</Text>
            <Text style={headerStyles.visitText}>Próx. Consulta: <Text style={{fontWeight: '700'}}>{dataFormatada}</Text></Text>
          </View>
        )}
      </View>
      <View style={headerStyles.streakBox}>
        <Text style={headerStyles.streakEmoji}>🔥</Text>
        <Text style={headerStyles.streakNumber}>{streak}</Text>
        <Text style={headerStyles.streakLabel}>dias</Text>
      </View>
    </View>
  );
}

const headerStyles = StyleSheet.create({
  container: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', paddingHorizontal: SPACING.md, paddingTop: SPACING.md, paddingBottom: SPACING.lg },
  textBlock: { flex: 1, paddingRight: SPACING.md },
  greeting: { fontSize: 28, fontWeight: '800', color: '#1a5d38', letterSpacing: -0.5, marginBottom: 6 },
  subtitle: { fontSize: 14, color: COLORS.textMedium, lineHeight: 21, marginBottom: 8 },
  visitRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#EDF7EE', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8, alignSelf: 'flex-start' },
  visitIcon: { fontSize: 14, marginRight: 6 },
  visitText: { fontSize: 13, color: COLORS.primary },
  streakBox: { width: 56, height: 72, borderRadius: 16, backgroundColor: '#FFF7E6', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#FFE4B5', marginTop: 4 },
  streakEmoji: { fontSize: 20, marginBottom: 2 },
  streakNumber: { fontSize: 18, fontWeight: '800', color: '#E67E22', lineHeight: 20 },
  streakLabel: { fontSize: 10, fontWeight: '600', color: '#E67E22', textTransform: 'uppercase' },
});

// ─── Subcomponente: PainAlert ───
function PainAlert({ navigation }) {
  return (
    <TouchableOpacity style={painAlertStyles.card} activeOpacity={0.9} onPress={() => navigation.navigate('Relatos')}>
      <View style={painAlertStyles.iconBox}>
        <Text style={painAlertStyles.icon}>📋</Text>
      </View>
      <View style={painAlertStyles.textBlock}>
        <Text style={painAlertStyles.title}>Como você está hoje?</Text>
        <Text style={painAlertStyles.desc}>Por favor, registre seu nível de dor para acompanharmos sua evolução.</Text>
      </View>
      <Text style={painAlertStyles.chevron}>›</Text>
    </TouchableOpacity>
  );
}

const painAlertStyles = StyleSheet.create({
  card: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FEF2F2', marginHorizontal: SPACING.md, marginBottom: SPACING.lg, borderRadius: RADIUS.xl, padding: SPACING.md, borderWidth: 1, borderColor: '#FCA5A5' },
  iconBox: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#FEE2E2', alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  icon: { fontSize: 20 },
  textBlock: { flex: 1 },
  title: { fontSize: 15, fontWeight: '700', color: '#991B1B', marginBottom: 2 },
  desc: { fontSize: 13, color: '#B91C1C', lineHeight: 18 },
  chevron: { fontSize: 24, color: '#F87171', paddingLeft: 8 },
});

// ─── Subcomponente: PlanCard ───
function PlanCard({ nextExercise, plan, onStart }) {
  const handleIniciar = () => {
    if (!nextExercise) return;
    onStart?.(nextExercise);
  };

  return (
    <View style={planStyles.card}>
      <View style={planStyles.cardHeader}>
        <Text style={planStyles.cardTitle}>Próximo passo</Text>
        {plan && (
          <Text style={planStyles.badge}>
            {plan.completedExercises}/{plan.totalExercises} concluídos
          </Text>
        )}
      </View>

      {nextExercise ? (
        <View style={planStyles.exerciseBlock}>
          <View style={planStyles.exerciseInfo}>
            <Text style={planStyles.exerciseTitle}>{nextExercise.exerciseName || nextExercise.title}</Text>
            {nextExercise.axis || nextExercise.problem ? (
              <Text style={planStyles.exerciseDesc}>{(nextExercise.axis ? nextExercise.axis + ' • ' : '') + (nextExercise.problem || '')}</Text>
            ) : null}
            {nextExercise.objective ? (
              <View style={planStyles.timeRow}>
                <Text style={planStyles.clockIcon}>🎯</Text>
                <Text style={planStyles.timeText}>{nextExercise.objective}</Text>
              </View>
            ) : null}
          </View>
        </View>
      ) : (
        <View style={planStyles.emptyBlock}>
          <Text style={planStyles.emptyText}>🎉 Todos os exercícios de hoje foram concluídos!</Text>
        </View>
      )}

      <TouchableOpacity
        style={[planStyles.startButton, !nextExercise && planStyles.startButtonDisabled]}
        onPress={handleIniciar}
        activeOpacity={0.85}
        disabled={!nextExercise}
      >
        <Text style={planStyles.startButtonText}>
          {nextExercise ? 'Iniciar exercício' : 'Plano completo'}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const planStyles = StyleSheet.create({
  card: { backgroundColor: COLORS.backgroundWhite, borderRadius: RADIUS.xl, marginHorizontal: SPACING.md, marginBottom: SPACING.md, padding: SPACING.md, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.07, shadowRadius: 8, elevation: 3 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: SPACING.md },
  cardTitle: { fontSize: 16, fontWeight: '700', color: COLORS.textDark },
  badge: { fontSize: 13, fontWeight: '600', color: COLORS.primary },
  exerciseBlock: { backgroundColor: '#F8FAF8', borderRadius: RADIUS.lg, padding: SPACING.md, marginBottom: SPACING.md, borderLeftWidth: 3, borderLeftColor: COLORS.primary },
  exerciseInfo: {},
  exerciseTitle: { fontSize: 17, fontWeight: '700', color: '#1a5d38', marginBottom: 4 },
  exerciseDesc: { fontSize: 13, color: COLORS.textMedium, marginBottom: 10 },
  timeRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  clockIcon: { fontSize: 13 },
  timeText: { fontSize: 13, color: COLORS.textMedium, fontWeight: '500' },
  emptyBlock: { backgroundColor: '#F0FBF3', borderRadius: RADIUS.lg, padding: SPACING.md, marginBottom: SPACING.md, alignItems: 'center' },
  emptyText: { fontSize: 14, color: COLORS.primary, fontWeight: '600', textAlign: 'center' },
  startButton: { backgroundColor: '#1a5d38', borderRadius: RADIUS.lg, paddingVertical: 16, alignItems: 'center' },
  startButtonDisabled: { backgroundColor: COLORS.textLight },
  startButtonText: { color: COLORS.white, fontSize: 16, fontWeight: '700', letterSpacing: 0.3 },
});

// ─── Subcomponente: ProgressCard ───
function ProgressCard({ percent }) {
  const { texto, emoji } = getMensagemProgresso(percent);
  return (
    <View style={progressStyles.card}>
      <Text style={progressStyles.cardTitle}>Seu progresso da semana</Text>
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
  card: { backgroundColor: COLORS.backgroundWhite, borderRadius: RADIUS.xl, marginHorizontal: SPACING.md, marginBottom: SPACING.md, padding: SPACING.md, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.07, shadowRadius: 8, elevation: 3 },
  cardTitle: { fontSize: 16, fontWeight: '700', color: COLORS.textDark, marginBottom: SPACING.md },
  row: { flexDirection: 'row', alignItems: 'center', gap: SPACING.md },
  messageBlock: { flex: 1, gap: 4 },
  emoji: { fontSize: 22, marginBottom: 2 },
  message: { fontSize: 14, fontWeight: '600', color: COLORS.textDark, lineHeight: 20 },
});

// ─── Subcomponente: Milestone Modal ───
function MilestoneModal({ visible, streak, onClose }) {
  const scaleAnim = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    if (visible) {
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 4,
        useNativeDriver: true,
      }).start();
    } else {
      scaleAnim.setValue(0);
    }
  }, [visible]);

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={milestoneStyles.overlay}>
        <Animated.View style={[milestoneStyles.card, { transform: [{ scale: scaleAnim }] }]}>
          <Text style={milestoneStyles.emoji}>🔥</Text>
          <Text style={milestoneStyles.title}>Que Incrível!</Text>
          <Text style={milestoneStyles.desc}>
            Você atingiu uma ofensiva de <Text style={{fontWeight: '800', color: '#E67E22'}}>{streak} dias</Text> consecutivos se cuidando!
          </Text>
          <TouchableOpacity style={milestoneStyles.btn} onPress={onClose} activeOpacity={0.8}>
            <Text style={milestoneStyles.btnText}>Continuar</Text>
          </TouchableOpacity>
        </Animated.View>
      </View>
    </Modal>
  );
}

const milestoneStyles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', alignItems: 'center' },
  card: { backgroundColor: '#fff', borderRadius: 24, padding: 32, alignItems: 'center', width: '85%', shadowColor: '#000', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.1, shadowRadius: 20, elevation: 10 },
  emoji: { fontSize: 64, marginBottom: 16 },
  title: { fontSize: 24, fontWeight: '800', color: '#1a5d38', marginBottom: 8 },
  desc: { fontSize: 15, color: COLORS.textMedium, textAlign: 'center', lineHeight: 22, marginBottom: 24 },
  btn: { backgroundColor: '#E67E22', paddingVertical: 14, paddingHorizontal: 32, borderRadius: 99 },
  btnText: { color: '#fff', fontSize: 16, fontWeight: '800' },
});

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
  const [progressoSemanal, setProgressoSemanal] = useState(0);
  const [nextExercise, setNextExercise] = useState(null);
  const [plan, setPlan] = useState(null);
  const [painToday, setPainToday] = useState(null);
  const [motivationalMessage, setMotivationalMessage] = useState(null);
  const [streak, setStreak] = useState(1);
  const [showMilestone, setShowMilestone] = useState(false);
  const [milestoneValue, setMilestoneValue] = useState(0);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [erro, setErro] = useState(null);

  const carregarDados = useCallback(async (isRefresh = false) => {
    if (isRefresh) {
      setRefreshing(true);
    }
    setErro(null);

    try {
      // Implementação do Cache SWR (Stale-While-Revalidate)
      if (!isRefresh) {
        const cache = await AsyncStorage.getItem('@homeCache');
        if (cache) {
          try {
            const json = JSON.parse(cache);
            if (json.plan) {
              setProgressoSemanal(json.plan.percentCompleted ?? 0);
              setPlan(json.plan);
            }
            setNextExercise(json.nextExercise ?? null);
            setPainToday(json.painToday ?? null);
            setMotivationalMessage(json.motivation ?? null);
            setLoading(false); // Já exibe a interface com o cache!
          } catch(e) {}
        } else {
          setLoading(true); // Exibe spinner se não há cache
        }
      }

      const token = await AsyncStorage.getItem('@token');
      const headers = buildHeaders(token);

      // Carrega info local
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

      // Chamada em background para revalidar os dados mais atualizados
      const homeResponse = await fetch(ROUTES.home, { headers });
      if (homeResponse.ok) {
        const json = await homeResponse.json();
        
        // Atualiza o cache silenciosamente
        await AsyncStorage.setItem('@homeCache', JSON.stringify(json));
        
        if (json.plan) {
          setProgressoSemanal(json.plan.percentCompleted ?? 0);
          setPlan(json.plan);
          
          const totalEx = json.plan.totalExercises || 0;
          const isComplete = totalEx > 0 && (json.plan.completedExercises >= totalEx);
          agendarNotificacaoLocal(!isComplete);
        }
        setNextExercise(json.nextExercise ?? null);
        setPainToday(json.painToday ?? null);
        setMotivationalMessage(json.motivation ?? null);
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

        <HeaderSection nome={nomeUsuario || 'Usuário'} streak={streak} nextVisitDate={nextVisitDate} painToday={painToday} />

        {painToday && painToday.recorded === false && (
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
                "{motivationalMessage?.message ?? 'Vamos começar o dia com energia!'}"
              </Text>
            </View>
          </View>
        </View>

        <PlanCard
          nextExercise={nextExercise}
          plan={plan}
          onStart={item => navigation.navigate('ExerciseDetail', {
            prescriptionItemId: item.prescriptionItemId || item.id,
            titulo: item.exerciseName || item.title,
          })}
        />
        
        <ProgressCard percent={progressoSemanal} />
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