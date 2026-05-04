import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Image, ScrollView, Alert, ActivityIndicator, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import { buscarPorEmail } from '../data/usuarios';

export default function RecuperarEmailScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [carregando, setCarregando] = useState(false);

  async function enviarCodigo() {
    if (!email || !email.includes('@')) {
      Alert.alert('Atenção', 'Informe um e-mail válido.');
      return;
    }
    setCarregando(true);
    await new Promise(r => setTimeout(r, 700));
    const usuario = buscarPorEmail(email.trim());
    const codigo = usuario ? Math.floor(10000000 + Math.random() * 90000000).toString() : '00000000';
    setCarregando(false);
    navigation.navigate('RecuperarCodigo', { email: email.trim(), codigoMock: codigo });
  }

  return (
    <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>

        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.voltar}>
          <Text style={styles.voltarTexto}>← Voltar</Text>
        </TouchableOpacity>

        <Image source={require('../../assets/logo.png')} style={styles.logo} resizeMode="contain" />

        <Text style={styles.titulo}>Recuperar Senha</Text>
        <Text style={styles.subtitulo}>Insira seu e-mail para receber um código de 8 dígitos.</Text>

        <View style={styles.card}>
          <Text style={styles.label}>E-mail cadastrado</Text>
          <TextInput
            style={styles.input}
            placeholder="seu@email.com"
            placeholderTextColor="#aaa"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />

          <TouchableOpacity style={styles.botao} onPress={enviarCodigo} disabled={carregando} activeOpacity={0.85}>
            {carregando ? <ActivityIndicator color="#fff" /> : <Text style={styles.botaoTexto}>Enviar código</Text>}
          </TouchableOpacity>

          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.linkWrapper}>
            <Text style={styles.link}>← Voltar ao login</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.infoBox}>
          <Text style={styles.infoTitulo}>⚠ Informação importante</Text>
          <Text style={styles.infoTexto}>O código expira em 15 minutos. Verifique sua caixa de spam caso não receba.</Text>
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
    marginBottom: 28,
    lineHeight: 20,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
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
  input: {
    backgroundColor: '#efefef',
    borderRadius: 10,
    paddingHorizontal: 16,
    height: 50,
    fontSize: 15,
    color: '#1a1a1a',
    marginBottom: 16,
  },
  botao: {
    backgroundColor: '#2a7a4b',
    borderRadius: 10,
    height: 52,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  botaoTexto: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '700',
  },
  linkWrapper: {
    alignItems: 'center',
  },
  link: {
    color: '#2a7a4b',
    fontWeight: '600',
    fontSize: 14,
  },
  infoBox: {
    backgroundColor: '#edf7f0',
    borderLeftWidth: 4,
    borderLeftColor: '#2a7a4b',
    borderRadius: 10,
    padding: 16,
    marginBottom: 32,
  },
  infoTitulo: {
    fontWeight: '700',
    fontSize: 13,
    color: '#1a1a1a',
    marginBottom: 4,
  },
  infoTexto: {
    fontSize: 13,
    color: '#555',
    lineHeight: 18,
  },
});