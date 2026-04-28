import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Image, ScrollView, Alert, ActivityIndicator, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';

export default function RedefinirSenhaScreen({ navigation, route }) {
  const { email } = route.params;
  const [novaSenha, setNovaSenha] = useState('');
  const [confirmar, setConfirmar] = useState('');
  const [novaSenhaVisivel, setNovaSenhaVisivel] = useState(false);
  const [confirmarVisivel, setConfirmarVisivel] = useState(false);
  const [erro, setErro] = useState('');
  const [carregando, setCarregando] = useState(false);

  async function atualizar() {
    setErro('');
    if (!novaSenha || novaSenha.length < 8) {
      setErro('A senha deve ter ao menos 8 caracteres.');
      return;
    }
    if (novaSenha !== confirmar) {
      setErro('As senhas digitadas não coincidem.');
      return;
    }
    setCarregando(true);
    await new Promise(r => setTimeout(r, 700));
    setCarregando(false);
    Alert.alert('Senha atualizada!', 'Sua senha foi redefinida com sucesso.', [
      { text: 'Ir para o login', onPress: () => navigation.navigate('Login') }
    ]);
  }

  return (
    <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>

        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.voltar}>
          <Text style={styles.voltarTexto}>← Voltar</Text>
        </TouchableOpacity>

        <Image source={require('../../assets/logo.png')} style={styles.logo} resizeMode="contain" />

        <Text style={styles.titulo}>Nova Senha</Text>
        <Text style={styles.subtitulo}>Crie uma senha segura para a conta{'\n'}<Text style={styles.emailDestaque}>{email}</Text></Text>

        <View style={styles.dicaBox}>
          <Text style={styles.dicaTexto}>🛡 Use ao menos 8 caracteres, incluindo letras maiúsculas, números e um símbolo.</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.label}>Nova senha</Text>
          <View style={styles.inputWrapper}>
            <TextInput
              style={styles.inputSenha}
              placeholder="••••••••"
              placeholderTextColor="#aaa"
              value={novaSenha}
              onChangeText={t => { setNovaSenha(t); setErro(''); }}
              secureTextEntry={!novaSenhaVisivel}
            />
            <TouchableOpacity onPress={() => setNovaSenhaVisivel(!novaSenhaVisivel)}>
              <Image
                source={novaSenhaVisivel ? require('../../assets/ocultar-senha.png') : require('../../assets/mostrar-senha.png')}
                style={styles.iconeOlho}
              />
            </TouchableOpacity>
          </View>

          <Text style={[styles.label, { marginTop: 16 }]}>Confirmar senha</Text>
          <View style={styles.inputWrapper}>
            <TextInput
              style={styles.inputSenha}
              placeholder="••••••••"
              placeholderTextColor="#aaa"
              value={confirmar}
              onChangeText={t => { setConfirmar(t); setErro(''); }}
              secureTextEntry={!confirmarVisivel}
            />
            <TouchableOpacity onPress={() => setConfirmarVisivel(!confirmarVisivel)}>
              <Image
                source={confirmarVisivel ? require('../../assets/ocultar-senha.png') : require('../../assets/mostrar-senha.png')}
                style={styles.iconeOlho}
              />
            </TouchableOpacity>
          </View>

          {erro ? (
            <View style={styles.erroWrapper}>
              <Text style={styles.erroTexto}>⚠ {erro}</Text>
            </View>
          ) : null}

          <TouchableOpacity style={styles.botao} onPress={atualizar} disabled={carregando} activeOpacity={0.85}>
            {carregando ? <ActivityIndicator color="#fff" /> : <Text style={styles.botaoTexto}>Atualizar senha</Text>}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  container: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 40,
  },
  voltar: {
    marginBottom: 20,
  },
  voltarTexto: {
    color: '#2a7a4b',
    fontWeight: '600',
    fontSize: 15,
  },
  logo: {
    width: 100,
    height: 100,
    alignSelf: 'center',
    marginBottom: 20,
  },
  titulo: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1a1a1a',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitulo: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 20,
  },
  emailDestaque: {
    color: '#2a7a4b',
    fontWeight: '600',
  },
  dicaBox: {
    backgroundColor: '#edf7f0',
    borderLeftWidth: 4,
    borderLeftColor: '#2a7a4b',
    borderRadius: 10,
    padding: 14,
    marginBottom: 20,
  },
  dicaTexto: {
    fontSize: 13,
    color: '#444',
    lineHeight: 18,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 32,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
    color: '#888',
    marginBottom: 8,
    letterSpacing: 0.5,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#efefef',
    borderRadius: 10,
    paddingHorizontal: 16,
    height: 50,
  },
  inputSenha: {
    flex: 1,
    fontSize: 15,
    color: '#1a1a1a',
  },
  iconeOlho: {
    width: 22,
    height: 22,
    tintColor: '#888',
  },
  erroWrapper: {
    marginTop: 12,
    marginBottom: 4,
  },
  erroTexto: {
    color: '#e53e3e',
    fontSize: 13,
    fontWeight: '500',
  },
  botao: {
    backgroundColor: '#2a7a4b',
    borderRadius: 10,
    height: 52,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
  },
  botaoTexto: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '700',
  },
});