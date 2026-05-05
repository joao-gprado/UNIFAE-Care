// src/screens/ProfileScreen.js
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Platform,
  StatusBar,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { ROUTES, buildHeaders } from '../services/api';

const COLORS = {
  primary:       '#2A7A3B',
  primaryLight:  '#EDF7EE',
  primaryMuted:  '#3D9B50',
  danger:        '#E53E3E',
  dangerLight:   '#FFF5F5',
  background:    '#F4F6F4',
  surface:       '#FFFFFF',
  textPrimary:   '#1A1A2E',
  textSecondary: '#4A5568',
  textMeta:      '#9CA3AF',
  border:        '#E9EDE9',
};

const APP_VERSION = 'V2.4.0';

// ─── Avatar com iniciais ───────────────────────────────────────────────────────

function Avatar({ name, size = 88 }) {
  const initials = name
    ? name.split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase()
    : '?';
  return (
    <View style={[avatarStyles.wrapper, { width: size, height: size, borderRadius: size / 2 }]}>
      <Text style={[avatarStyles.initials, { fontSize: size * 0.34 }]}>{initials}</Text>
    </View>
  );
}

const avatarStyles = StyleSheet.create({
  wrapper: {
    backgroundColor: COLORS.primaryLight,
    borderWidth: 3,
    borderColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  initials: {
    color: COLORS.primary,
    fontWeight: '700',
    letterSpacing: 1,
  },
});

// ─── Avatar pequeno ────────────────────────────────────────────────────────────

function SmallAvatar({ name }) {
  const initials = name
    ? name.split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase()
    : '?';
  return (
    <View style={smallAvatarStyles.wrapper}>
      <Text style={smallAvatarStyles.initials}>{initials}</Text>
    </View>
  );
}

const smallAvatarStyles = StyleSheet.create({
  wrapper: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: COLORS.primaryLight,
    borderWidth: 2,
    borderColor: '#C6E4D4',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  initials: {
    color: COLORS.primary,
    fontWeight: '700',
    fontSize: 15,
  },
});

// ─── Card de pessoa ────────────────────────────────────────────────────────────

function PersonCard({ label, name, subtitle }) {
  return (
    <View style={cardStyles.container}>
      <Text style={cardStyles.label}>{label}</Text>
      <View style={cardStyles.row}>
        <SmallAvatar name={name} />
        <View style={cardStyles.textBlock}>
          <Text style={cardStyles.name}>{name}</Text>
          {subtitle ? <Text style={cardStyles.subtitle}>{subtitle}</Text> : null}
        </View>
      </View>
    </View>
  );
}

const cardStyles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  label: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1.2,
    color: COLORS.textMeta,
    textTransform: 'uppercase',
    marginBottom: 12,
  },
  row: { flexDirection: 'row', alignItems: 'center' },
  textBlock: { flex: 1 },
  name: { fontSize: 16, fontWeight: '600', color: COLORS.textPrimary, marginBottom: 2 },
  subtitle: { fontSize: 13, color: COLORS.textSecondary },
});

// ─── Card de progresso ─────────────────────────────────────────────────────────

function ProgressCard({ percent }) {
  const safe = Math.min(100, Math.max(0, percent ?? 0));
  return (
    <View style={progressStyles.container}>
      <Text style={progressStyles.label}>META SEMANAL</Text>
      <View style={progressStyles.valueRow}>
        <Text style={progressStyles.percent}>{safe}%</Text>
        <Text style={progressStyles.tag}> Concluído</Text>
      </View>
      <View style={progressStyles.track}>
        <View style={[progressStyles.fill, { width: `${safe}%` }]} />
      </View>
    </View>
  );
}

const progressStyles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.primaryLight,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#C6E4D4',
  },
  label: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1.2,
    color: COLORS.primary,
    textTransform: 'uppercase',
    marginBottom: 10,
  },
  valueRow: { flexDirection: 'row', alignItems: 'baseline', marginBottom: 12 },
  percent: { fontSize: 36, fontWeight: '800', color: COLORS.primary, lineHeight: 40 },
  tag: { fontSize: 15, fontWeight: '500', color: COLORS.primaryMuted },
  track: { height: 8, backgroundColor: '#B8DDC9', borderRadius: 4, overflow: 'hidden' },
  fill: { height: '100%', backgroundColor: COLORS.primary, borderRadius: 4 },
});

// ─── Item de configuração ──────────────────────────────────────────────────────

function SettingsItem({ label, icon, onPress }) {
  return (
    <TouchableOpacity style={settingsStyles.item} onPress={onPress} activeOpacity={0.7}>
      <View style={settingsStyles.iconBox}>
        <Text style={settingsStyles.iconText}>{icon}</Text>
      </View>
      <Text style={settingsStyles.label}>{label}</Text>
      <Text style={settingsStyles.chevron}>›</Text>
    </TouchableOpacity>
  );
}

const settingsStyles = StyleSheet.create({
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 16,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  iconBox: {
    width: 34, height: 34, borderRadius: 10,
    backgroundColor: COLORS.primaryLight,
    alignItems: 'center', justifyContent: 'center', marginRight: 14,
  },
  iconText: { fontSize: 16 },
  label: { flex: 1, fontSize: 15, fontWeight: '500', color: COLORS.textPrimary },
  chevron: { fontSize: 22, color: COLORS.textMeta, lineHeight: 24 },
});

// ─── Tela principal ───────────────────────────────────────────────────────────

export default function ProfileScreen({ navigation }) {
  const [data, setData]       = useState(null);
  const [loading, setLoading] = useState(true);
  const [erro, setErro]       = useState(null);

  useEffect(() => {
    carregarPerfil();
  }, []);

  async function carregarPerfil() {
    setLoading(true);
    setErro(null);
    try {
      const token = await AsyncStorage.getItem('@token');
      const response = await fetch(ROUTES.homeProfile, {
        method: 'GET',
        headers: buildHeaders(token),
      });
      const json = await response.json();
      if (response.ok) {
        setData(json);
      } else {
        const mensagem = json.message || json.error || 'Erro ao carregar perfil.';
        setErro(mensagem);
      }
    } catch (error) {
      setErro('Não foi possível conectar ao servidor.');
    } finally {
      setLoading(false);
    }
  }

  const handleLogout = () => {
    Alert.alert(
      'Sair',
      'Tem certeza que deseja encerrar a sessão?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Sair',
          style: 'destructive',
          onPress: async () => {
            await AsyncStorage.multiRemove(['@token', '@usuario']);
            navigation.replace('Login');
          },
        },
      ],
    );
  };

  const handleNavPress = (tela) => {
    Alert.alert(tela, 'Em breve esta seção estará disponível.');
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Carregando perfil…</Text>
      </View>
    );
  }

  if (erro) {
    return (
      <View style={styles.centered}>
        <Text style={styles.erroTexto}>{erro}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={carregarPerfil}>
          <Text style={styles.retryTexto}>Tentar novamente</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const {
    profile,
    responsibleStudent,
    coordinator,
    weeklyProgress,
    app,
  } = data;

  return (
    <>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Avatar name={profile?.name} size={88} />
          <Text style={styles.userName}>{profile?.name}</Text>
          <Text style={styles.appName}>{app?.name ?? 'Unifae Care'}</Text>
        </View>

        {/* Cards */}
        <View style={styles.section}>
          {responsibleStudent ? (
            <PersonCard
              label="FISIOTERAPEUTA RESPONSÁVEL"
              name={responsibleStudent.name}
              subtitle={responsibleStudent.email}
            />
          ) : null}
          {coordinator ? (
            <PersonCard
              label="COORDENADOR RESPONSÁVEL"
              name={coordinator.name}
              subtitle={coordinator.email}
            />
          ) : null}
          {weeklyProgress != null ? (
            <ProgressCard percent={weeklyProgress.percentCompleted ?? weeklyProgress} />
          ) : null}
        </View>

        {/* Configurações */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>CONFIGURAÇÕES E SUPORTE</Text>
          <SettingsItem label="Lembretes"           icon="🔔" onPress={() => handleNavPress('Lembretes')} />
          <SettingsItem label="Notificações"         icon="🔕" onPress={() => handleNavPress('Notificações')} />
          <SettingsItem label="Privacidade e Dados"  icon="🔒" onPress={() => handleNavPress('Privacidade e Dados')} />
        </View>

        {/* Sair */}
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout} activeOpacity={0.8}>
          <Text style={styles.logoutText}>Sair</Text>
        </TouchableOpacity>

        <Text style={styles.version}>{APP_VERSION}</Text>
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  centered: {
    flex: 1, alignItems: 'center', justifyContent: 'center',
    backgroundColor: COLORS.background, paddingHorizontal: 24,
  },
  loadingText: { marginTop: 12, fontSize: 14, color: COLORS.textSecondary },
  erroTexto: { fontSize: 15, color: COLORS.danger, textAlign: 'center', marginBottom: 16 },
  retryButton: {
    backgroundColor: COLORS.primary, borderRadius: 10,
    paddingVertical: 12, paddingHorizontal: 28,
  },
  retryTexto: { color: '#fff', fontWeight: '700', fontSize: 15 },
  scroll: { flex: 1, backgroundColor: COLORS.background },
  content: {
    paddingTop: Platform.OS === 'android' ? (StatusBar.currentHeight ?? 24) + 8 : 16,
    paddingBottom: 100,
    paddingHorizontal: 16,
  },
  header: { alignItems: 'center', paddingVertical: 24, marginBottom: 8 },
  userName: {
    marginTop: 14, fontSize: 24, fontWeight: '800',
    color: COLORS.textPrimary, letterSpacing: -0.3, textAlign: 'center',
  },
  appName: { marginTop: 4, fontSize: 13, color: COLORS.primary, fontWeight: '500' },
  section: { marginBottom: 8 },
  sectionTitle: {
    fontSize: 10, fontWeight: '700', letterSpacing: 1.2,
    color: COLORS.textMeta, textTransform: 'uppercase',
    marginBottom: 10, marginLeft: 4,
  },
  logoutButton: {
    backgroundColor: COLORS.dangerLight,
    borderRadius: 14, paddingVertical: 16,
    alignItems: 'center', marginTop: 4, marginBottom: 8,
    borderWidth: 1, borderColor: '#FC8181',
  },
  logoutText: { fontSize: 16, fontWeight: '700', color: COLORS.danger },
  version: { textAlign: 'center', marginTop: 8, fontSize: 12, color: COLORS.textMeta, letterSpacing: 0.5 },
});