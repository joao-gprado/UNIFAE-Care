import React, { useState, useEffect } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, Image, ScrollView,
  Alert, ActivityIndicator, StyleSheet, KeyboardAvoidingView, Platform,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ROUTES } from '../services/api';

export default function LoginScreen({ navigation }) {
  const [email, setEmail]                   = useState('');
  const [senha, setSenha]                   = useState('');
  const [senhaVisivel, setSenhaVisivel]     = useState(false);
  const [carregando, setCarregando]         = useState(false);
  const [apps, setApps]                     = useState([]);
  const [appSelecionado, setAppSelecionado] = useState(null);

  useEffect(() => {
    fetch(ROUTES.apps, { headers: { Accept: 'application/json' } })
      .then(r => r.ok ? r.json() : [])
      .then(lista => {
        setApps(lista);
        if (lista.length === 1) setAppSelecionado(lista[0]);
      })
      .catch(() => {});
  }, []);

  async function entrar() {
    if (!email || !senha) {
      Alert.alert('Atenção', 'Preencha e-mail e senha.');
      return;
    }
    setCarregando(true);
    try {
      const appId = appSelecionado?.id ?? 1;
      const response = await fetch(ROUTES.login, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), password: senha.trim(), accessMode: 'APP', appId }),
      });
      const json = await response.json();
      if (response.ok) {
        await AsyncStorage.setItem('@token', json.access_token);
        await AsyncStorage.setItem('@usuario', JSON.stringify(json.user ?? json));
        console.log('consentRequired:', JSON.stringify(json.consentRequired));
        if (json.consentRequired) {
          navigation.replace('AceitarTermo', { consentTermId: json.consentRequired.consentTermId });
        } else {
          navigation.replace('MainTabs');
        }
      } else {
        const mensagem = json.message || json.error || 'E-mail ou senha incorretos.';
        Alert.alert('Erro', mensagem);
      }
    } catch (error) {
      Alert.alert('Erro de conexão', 'Não foi possível conectar ao servidor. Verifique sua internet e tente novamente.');
    } finally {
      setCarregando(false);
    }
  }

  return (
    <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>

        <Image source={require('../../assets/logo.png')} style={styles.logo} resizeMode="contain" />

        <Text style={styles.titulo}>Bem-vindo ao UNIFAE Care</Text>
        <Text style={styles.subtitulo}>Entre com suas credenciais para continuar.</Text>

        {apps.length > 1 && (
          <View style={styles.campo}>
            <Text style={styles.label}>Aplicativo</Text>
            {apps.map(app => (
              <TouchableOpacity
                key={app.id}
                style={[styles.appOption, appSelecionado?.id === app.id && styles.appOptionSelecionado]}
                onPress={() => setAppSelecionado(app)}
                activeOpacity={0.8}
              >
                <Text style={[styles.appOptionTexto, appSelecionado?.id === app.id && styles.appOptionTextoSelecionado]}>
                  {app.name}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        <View style={styles.campo}>
          <Text style={styles.label}>E-mail</Text>
          <TextInput
            style={styles.input}
            placeholder="nome@unifae.br"
            placeholderTextColor="#aaa"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />
        </View>

        <View style={styles.campo}>
          <Text style={styles.label}>Senha</Text>
          <View style={styles.inputSenhaWrapper}>
            <TextInput
              style={styles.inputSenha}
              placeholder="••••••••"
              placeholderTextColor="#aaa"
              value={senha}
              onChangeText={setSenha}
              secureTextEntry={!senhaVisivel}
            />
            <TouchableOpacity onPress={() => setSenhaVisivel(!senhaVisivel)}>
              <Image
                source={senhaVisivel ? require('../../assets/ocultar-senha.png') : require('../../assets/mostrar-senha.png')}
                style={styles.iconeOlho}
              />
            </TouchableOpacity>
          </View>
        </View>

        <TouchableOpacity onPress={() => navigation.navigate('RecuperarEmail')} style={styles.linkWrapper}>
          <Text style={styles.link}>Esqueci minha senha</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.botao} onPress={entrar} disabled={carregando} activeOpacity={0.85}>
          {carregando ? <ActivityIndicator color="#fff" /> : <Text style={styles.botaoTexto}>Entrar</Text>}
        </TouchableOpacity>

        <View style={styles.rodapeWrapper}>
          <Text style={styles.rodapeTexto}>Não possui uma conta? </Text>
          <TouchableOpacity>
            <Text style={styles.link}>Cadastre-se</Text>
          </TouchableOpacity>
        </View>

      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: '#f5f5f5' },
  container: {
    flexGrow: 1, alignItems: 'center',
    paddingHorizontal: 28, paddingTop: 60, paddingBottom: 40,
  },
  logo: { width: 120, height: 120, marginBottom: 28 },
  titulo: { fontSize: 22, fontWeight: '700', color: '#1a1a1a', textAlign: 'center', marginBottom: 6 },
  subtitulo: { fontSize: 14, color: '#666', textAlign: 'center', marginBottom: 36 },
  campo: { width: '100%', marginBottom: 16 },
  label: { fontSize: 13, fontWeight: '600', color: '#333', marginBottom: 6 },
  input: {
    backgroundColor: '#e8e8e8', borderRadius: 10,
    paddingHorizontal: 16, height: 50, fontSize: 15, color: '#1a1a1a', width: '100%',
  },
  inputSenhaWrapper: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#e8e8e8', borderRadius: 10, paddingHorizontal: 16, height: 50,
  },
  inputSenha: { flex: 1, fontSize: 15, color: '#1a1a1a' },
  iconeOlho: { width: 22, height: 22, tintColor: '#888' },
  appOption: {
    borderWidth: 1.5, borderColor: '#ccc', borderRadius: 10,
    paddingVertical: 12, paddingHorizontal: 16, marginBottom: 8, backgroundColor: '#fff',
  },
  appOptionSelecionado: { borderColor: '#2a7a4b', backgroundColor: '#edf7f0' },
  appOptionTexto: { fontSize: 14, color: '#555', fontWeight: '500' },
  appOptionTextoSelecionado: { color: '#2a7a4b', fontWeight: '700' },
  linkWrapper: { alignSelf: 'flex-end', marginBottom: 28, marginTop: 4 },
  link: { color: '#2a7a4b', fontWeight: '600', fontSize: 14 },
  botao: {
    backgroundColor: '#2a7a4b', borderRadius: 10, height: 52,
    width: '100%', alignItems: 'center', justifyContent: 'center', marginBottom: 32,
  },
  botaoTexto: { color: '#fff', fontSize: 16, fontWeight: '700' },
  rodapeWrapper: { flexDirection: 'row', alignItems: 'center', marginBottom: 24 },
  rodapeTexto: { fontSize: 14, color: '#666' },
});