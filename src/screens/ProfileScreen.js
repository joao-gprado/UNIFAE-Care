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
  Image,
  Linking,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ImagePicker from 'expo-image-picker';

import { ROUTES, buildHeaders, HOST_URL } from '../services/api';
import { SPACING } from '../theme';
import Skeleton from '../components/Skeleton';

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

// Versão exibida no rodapé do perfil — lida do app ou deixada em branco
const APP_VERSION = '';

// ─── Avatar com iniciais ───────────────────────────────────────────────────────

function Avatar({ name, uri, size = 88, userId, token }) {
  const [base64Img, setBase64Img] = useState(null);
  
  const initials = name
    ? name.split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase()
    : '?';

  useEffect(() => {
    let isMounted = true;
    setBase64Img(null); // Limpa a imagem anterior se a URI mudar

    async function fetchAuthImage() {
      if (!uri) return;

      // 1. Imagem local ou URL pública (não precisa de token, mostra direto)
      if (typeof uri === 'string' && (uri.startsWith('http') || uri.startsWith('data:') || uri.startsWith('file://') || uri.startsWith('blob:'))) {
        if (isMounted) setBase64Img({ uri });
        return;
      }

      // 2. Imagem autenticada do servidor (Bypass do erro do React Native)
      if (token) {
        try {
          const urlCompleta = HOST_URL + uri + '?t=' + Date.now(); // Quebra o cache agressivo
          
          // Baixamos a imagem "na mão" usando o fetch, que não perde o Token
          const response = await fetch(urlCompleta, {
            method: 'GET',
            headers: { Authorization: `Bearer ${token}` }
          });

          if (response.ok) {
            // Convertendo a imagem binária para texto Base64
            const blob = await response.blob();
            const reader = new FileReader();
            reader.onloadend = () => {
              if (isMounted) {
                // reader.result contém a imagem em formato data:image/jpeg;base64...
                setBase64Img({ uri: reader.result });
              }
            };
            reader.readAsDataURL(blob);
          } else {
            console.log("Servidor recusou a imagem:", response.status);
          }
        } catch (e) {
          console.log("Erro ao baixar avatar autenticado:", e);
        }
      }
    }

    fetchAuthImage();

    return () => { isMounted = false; };
  }, [uri, token]);

  return (
    <View style={[avatarStyles.wrapper, { width: size, height: size, borderRadius: size / 2 }]}> 
      {base64Img ? (
        <Image 
          source={base64Img} 
          style={[avatarStyles.image, { width: size, height: size, borderRadius: size / 2 }]} 
          resizeMode="cover" 
        />
      ) : (
        <Text style={[avatarStyles.initials, { fontSize: size * 0.34 }]}>{initials}</Text>
      )}
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
    overflow: 'hidden',
  },
  initials: {
    color: COLORS.primary,
    fontWeight: '700',
    letterSpacing: 1,
  },
  image: {},
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

function PersonCard({ label, name, subtitle, onEmailPress }) {
  return (
    <View style={cardStyles.container}>
      <Text style={cardStyles.label}>{label}</Text>
      <View style={cardStyles.row}>
        <SmallAvatar name={name} />
        <View style={cardStyles.textBlock}>
          <Text style={cardStyles.name}>{name}</Text>
          {subtitle ? <Text style={cardStyles.subtitle}>{subtitle}</Text> : null}
        </View>
        {onEmailPress && (
          <TouchableOpacity style={cardStyles.emailButton} onPress={onEmailPress}>
            <Text style={cardStyles.emailIcon}>✉️</Text>
          </TouchableOpacity>
        )}
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
  emailButton: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#F3F4F6', alignItems: 'center', justifyContent: 'center', marginLeft: 10 },
  emailIcon: { fontSize: 18 },
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

function SettingsItem({ label, icon, onPress, disabled = false }) {
  return (
    <TouchableOpacity
      style={[settingsStyles.item, disabled && settingsStyles.itemDisabled]}
      onPress={disabled ? undefined : onPress}
      activeOpacity={disabled ? 1 : 0.7}
      disabled={disabled}
    >
      <View style={[settingsStyles.iconBox, disabled && settingsStyles.iconBoxDisabled]}>
        <Text style={[settingsStyles.iconText, disabled && settingsStyles.iconTextDisabled]}>{icon}</Text>
      </View>
      <Text style={[settingsStyles.label, disabled && settingsStyles.labelDisabled]}>{label}</Text>
      {disabled
        ? <Text style={settingsStyles.badge}>Em breve</Text>
        : <Text style={settingsStyles.chevron}>›</Text>
      }
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
  // Estados desabilitados
  itemDisabled:      { opacity: 0.55 },
  iconBoxDisabled:   { backgroundColor: '#F1F5F9' },
  iconTextDisabled:  { opacity: 0.5 },
  labelDisabled:     { color: COLORS.textMeta },
  badge: {
    fontSize: 10, fontWeight: '700', color: COLORS.textMeta,
    backgroundColor: '#F1F5F9', borderRadius: 6,
    paddingHorizontal: 7, paddingVertical: 3, letterSpacing: 0.3,
  },
});

// ─── Tela principal ───────────────────────────────────────────────────────────

export default function ProfileScreen({ navigation }) {
  const [data, setData]       = useState(null);
  const [loading, setLoading] = useState(true);
  const [erro, setErro]       = useState(null);
  const [photoUri, setPhotoUri] = useState(null);
  const [token, setToken]     = useState(null);

  useEffect(() => {
    carregarPerfil();
    obterToken();
    if (Platform.OS !== 'web') {
      requestImagePickerPermission();
    }
  }, []);

  async function obterToken() {
    try {
      const t = await AsyncStorage.getItem('@token');
      setToken(t);
    } catch (error) {
      console.log('Erro ao obter token:', error);
    }
  }

  async function requestImagePickerPermission() {
    const { status } = await ImagePicker.getMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      await ImagePicker.requestMediaLibraryPermissionsAsync();
    }
  }

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
        console.log("Dados do Perfil recebidos:", json.profile);
        setPhotoUri(null); // Força limpar a versão local temporária após ler com sucesso do servidor
        setData(json);

        // Sincronização de dados do perfil para o AsyncStorage
        if (json.profile) {
          const usuarioSalvo = await AsyncStorage.getItem('@usuario');
          let usuarioAtualizado = json.profile;
          if (usuarioSalvo) {
            try {
              usuarioAtualizado = { ...JSON.parse(usuarioSalvo), ...json.profile };
            } catch (e) {}
          }
          await AsyncStorage.setItem('@usuario', JSON.stringify(usuarioAtualizado));
        }
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
function getFileInfo(uri) {
    const name = uri.split('/').pop() || 'profile.jpg';
    const match = name.match(/\.([0-9a-z]+)(?:[?#]|$)/i);
    const ext = match ? match[1].toLowerCase() : 'jpg';
    // O backend pode ser rígido quanto ao mimeType
    const type = ext === 'png' ? 'image/png' : (ext === 'webp' ? 'image/webp' : 'image/jpeg');
    return { fileName: name, type };
  }

  function pickWebImage() {
    return new Promise((resolve) => {
      if (typeof document === 'undefined') {
        resolve(null);
        return;
      }

      const input = document.createElement('input');
      input.type = 'file';
      input.accept = 'image/jpeg, image/png, image/webp';
      input.style.display = 'none';
      input.onchange = () => {
        const file = input.files?.[0] ?? null;
        resolve(file);
        document.body.removeChild(input);
      };

      document.body.appendChild(input);
      input.click();
    });
  }

  async function uploadPhotoFile(fileData) {
    const token = await AsyncStorage.getItem('@token');
    if (!token) return null;

    const formData = new FormData();
    
    // Tratamento crucial: Diferenciar Web de Mobile
    if (Platform.OS === 'web') {
      // No web, fileData já é o objeto File nativo do input
      formData.append('file', fileData, fileData.name || 'upload.jpg');
    } else {
      // No mobile, precisa ser este objeto estrito
      formData.append('file', {
        uri: Platform.OS === 'ios' ? fileData.uri.replace('file://', '') : fileData.uri,
        name: fileData.name,
        type: fileData.type,
      });
    }

    const response = await fetch(ROUTES.profilePhotoUpload, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json',
        // Não defina Content-Type multipart/form-data aqui, o fetch precisa definir o boundary sozinho
      },
      body: formData,
    });

    return response;
  }

  const handleUploadPhoto = async () => {
    try {
      let selectedFile = null;
      let localUri = null;

      if (Platform.OS === 'web') {
        selectedFile = await pickWebImage();
        if (!selectedFile) return;
        localUri = URL.createObjectURL(selectedFile);
      } else {
        const result = await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ['images'],
          allowsEditing: true,
          aspect: [1, 1],
          quality: 0.8,
        });

        if (result.canceled) return;

        const asset = result.assets[0];
        const { fileName, type } = getFileInfo(asset.uri);
        selectedFile = { uri: asset.uri, name: fileName, type };
        localUri = asset.uri;
      }

      // Exibir feedback visual de carregamento aqui seria ideal no futuro
      const response = await uploadPhotoFile(selectedFile);
      if (!response) {
         Alert.alert('Erro', 'Sessão expirada. Faça login novamente.');
         return;
      }

      const responseText = await response.text();
      let json = {};
      try {
        json = JSON.parse(responseText);
      } catch (e) {
        // Parse falhou, lidamos com isso extraindo a resposta de texto no fallback do erro
      }

      if (response.ok) {
        // Forçar a UI a mostrar a nova foto localmente imediatamente para dar feedback rápido
        setPhotoUri(localUri);
        Alert.alert('Sucesso', 'Foto de perfil atualizada!');
        // Tentar recarregar o perfil do backend (pode levar alguns instantes para refletir dependendo do cache)
        carregarPerfil();
      } else {
        const mensagem = json.message || json.error || responseText || `Erro ${response.status}`;
        Alert.alert('Erro', mensagem);
      }
    } catch (error) {
      console.error("Erro no fluxo de upload:", error.message || error);
      Alert.alert('Erro', 'Não foi possível fazer upload da foto. Verifique a conexão.');
    }
  };

  // Configurações ainda não implementadas — itens renderizados como desabilitados
  // para não enganar o usuário com um Alert de "Em breve"

  if (loading) {
    return (
      <View style={styles.scroll}>
        <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />
        <View style={styles.content}>
          <View style={styles.header}>
            <Skeleton width={88} height={88} borderRadius={44} />
            <Skeleton width={140} height={28} borderRadius={6} style={{ marginTop: 14, marginBottom: 8 }} />
            <Skeleton width={180} height={16} borderRadius={4} style={{ marginBottom: 8 }} />
          </View>
          <View style={styles.section}>
             <Skeleton width="100%" height={80} borderRadius={16} style={{ marginBottom: 12 }} />
             <Skeleton width="100%" height={80} borderRadius={16} style={{ marginBottom: 12 }} />
          </View>
        </View>
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

  // A API retorna: profile, coordinator
  // responsibleStudent, weeklyProgress e app não fazem parte da resposta atual
  const {
    profile,
    responsibleStudent = null,
    coordinator = null,
    weeklyProgress = null,
    app = null,
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
          <TouchableOpacity onPress={handleUploadPhoto} activeOpacity={0.8}>
            <Avatar
              name={profile?.name}
              uri={photoUri || profile?.photoUrl || profile?.imageUrl || profile?.avatarUrl || profile?.photo}
              size={88}
              userId={profile?.id ?? profile?.userId ?? profile?.user_id}
              token={token}
            />
          </TouchableOpacity>
          <Text style={styles.userName}>{profile?.name}</Text>
          {profile?.email && <Text style={styles.userEmail}>{profile.email}</Text>}
          <Text style={styles.appName}>{app?.name ?? 'Unifae Care'}</Text>
        </View>

        {/* Cards */}
        <View style={styles.section}>
          {responsibleStudent ? (
            <PersonCard
              label="FISIOTERAPEUTA RESPONSÁVEL"
              name={responsibleStudent.name}
              subtitle={responsibleStudent.email}
              onEmailPress={responsibleStudent.email ? () => Linking.openURL(`mailto:${responsibleStudent.email}`) : undefined}
            />
          ) : null}
          {coordinator ? (
            <PersonCard
              label="COORDENADOR RESPONSÁVEL"
              name={coordinator.name}
              subtitle={`${coordinator.primarySpecialty || 'Especialista'} • ${coordinator.email}`}
              onEmailPress={coordinator.email ? () => Linking.openURL(`mailto:${coordinator.email}`) : undefined}
            />
          ) : null}
          {weeklyProgress != null ? (
            <ProgressCard percent={weeklyProgress.percentCompleted ?? weeklyProgress} />
          ) : null}
        </View>

        {/* Configurações */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>CONFIGURAÇÕES E SUPORTE</Text>
          {/* Itens desabilitados visualmente — funcionalidades ainda não disponíveis na API */}
          <SettingsItem label="Lembretes"          icon="🔔" disabled />
          <SettingsItem label="Notificações"        icon="🔕" disabled />
          <SettingsItem label="Privacidade e Dados" icon="🔒" disabled />
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
    paddingHorizontal: SPACING.md,
  },
  header: { alignItems: 'center', paddingVertical: 24, marginBottom: SPACING.lg },
  userName: {
    marginTop: 14, fontSize: 24, fontWeight: '800',
    color: COLORS.textPrimary, letterSpacing: -0.3, textAlign: 'center',
    flexShrink: 1, marginBottom: 4,
  },
  userEmail: { fontSize: 14, color: COLORS.textSecondary, marginBottom: 8 },
  appName: { marginTop: 4, fontSize: 13, color: COLORS.primary, fontWeight: '500', flexShrink: 1 },
  section: { marginBottom: SPACING.lg, marginHorizontal: 0 },
  sectionTitle: {
    fontSize: 10, fontWeight: '700', letterSpacing: 1.2,
    color: COLORS.textMeta, textTransform: 'uppercase',
    marginBottom: SPACING.md, marginLeft: 4,
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