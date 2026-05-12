import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, Image, ScrollView,
  StyleSheet, KeyboardAvoidingView, Platform,
} from 'react-native';

export default function RecuperarCodigoScreen({ navigation, route }) {
  const { email } = route.params;
  const [codigo, setCodigo] = useState('');
  const [erro, setErro]     = useState('');

  function avancar() {
    setErro('');
    if (codigo.trim().length !== 8) {
      setErro('Informe os 8 caracteres do código.');
      return;
    }
    navigation.navigate('RedefinirSenha', { email, code: codigo.trim().toUpperCase() });
  }

  return (
    <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>

        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.voltar}>
          <Text style={styles.voltarTexto}>← Voltar ao E-mail</Text>
        </TouchableOpacity>

        <Image source={require('../../assets/logo.png')} style={styles.logo} resizeMode="contain" />

        <Text style={styles.titulo}>Código de Verificação</Text>
        <Text style={styles.subtitulo}>
          Enviamos um código de 8 caracteres para{'\n'}
          <Text style={styles.emailDestaque}>{email}</Text>
        </Text>

        <View style={styles.card}>
          <Text style={styles.label}>Código recebido por e-mail</Text>
          <TextInput
            style={[styles.input, erro ? styles.inputErro : null]}
            placeholder="XXXXXXXX"
            placeholderTextColor="#aaa"
            value={codigo}
            onChangeText={t => { setCodigo(t.toUpperCase()); setErro(''); }}
            autoCapitalize="characters"
            maxLength={8}
          />
          {erro ? <Text style={styles.erroTexto}>⚠ {erro}</Text> : null}

          <TouchableOpacity style={styles.botao} onPress={avancar} activeOpacity={0.85}>
            <Text style={styles.botaoTexto}>Continuar</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => navigation.navigate('RecuperarEmail')} style={styles.linkWrapper}>
            <Text style={styles.link}>Reenviar código</Text>
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
  flex: { flex: 1, backgroundColor: '#f5f5f5' },
  container: { flexGrow: 1, paddingHorizontal: 24, paddingTop: 20, paddingBottom: 40 },
  voltar: { marginBottom: 20 },
  voltarTexto: { color: '#2a7a4b', fontWeight: '600', fontSize: 15 },
  logo: { width: 100, height: 100, alignSelf: 'center', marginBottom: 20 },
  titulo: { fontSize: 24, fontWeight: '700', color: '#1a1a1a', textAlign: 'center', marginBottom: 8 },
  subtitulo: { fontSize: 14, color: '#666', textAlign: 'center', marginBottom: 28, lineHeight: 20 },
  emailDestaque: { color: '#2a7a4b', fontWeight: '600' },
  card: {
    backgroundColor: '#fff', borderRadius: 16, padding: 20, marginBottom: 20,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06, shadowRadius: 8, elevation: 3,
  },
  label: { fontSize: 12, fontWeight: '600', color: '#888', marginBottom: 8, letterSpacing: 0.5 },
  input: {
    backgroundColor: '#efefef', borderRadius: 10, paddingHorizontal: 16,
    height: 50, fontSize: 20, color: '#1a1a1a', marginBottom: 8,
    letterSpacing: 6, textAlign: 'center', fontWeight: '700',
  },
  inputErro: { borderWidth: 1.5, borderColor: '#e53e3e' },
  erroTexto: { color: '#e53e3e', fontSize: 13, fontWeight: '500', marginBottom: 10 },
  botao: {
    backgroundColor: '#2a7a4b', borderRadius: 10, height: 52,
    alignItems: 'center', justifyContent: 'center', marginBottom: 16, marginTop: 8,
  },
  botaoTexto: { color: '#fff', fontSize: 15, fontWeight: '700' },
  linkWrapper: { alignItems: 'center' },
  link: { color: '#2a7a4b', fontWeight: '600', fontSize: 14 },
  infoBox: {
    backgroundColor: '#edf7f0', borderLeftWidth: 4, borderLeftColor: '#2a7a4b',
    borderRadius: 10, padding: 16, marginBottom: 32,
  },
  infoTitulo: { fontWeight: '700', fontSize: 13, color: '#1a1a1a', marginBottom: 4 },
  infoTexto: { fontSize: 13, color: '#555', lineHeight: 18 },
});