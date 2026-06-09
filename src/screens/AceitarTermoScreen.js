import React, { useState } from 'react';
import {
  View, Text, TouchableOpacity, ScrollView,
  Alert, ActivityIndicator, StyleSheet, Platform, StatusBar,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ROUTES, buildHeaders } from '../services/api';

export default function AceitarTermoScreen({ navigation, route }) {
  const { consentTermId } = route.params;
  const [carregando, setCarregando] = useState(false);

async function aceitar() {
  setCarregando(true);
  try {
    const token = await AsyncStorage.getItem('@token');

    console.log('=== ACEITAR TERMO ===');
    console.log('Token:', token);
    console.log('consentTermId:', consentTermId);
    console.log('URL:', ROUTES.consentAccept);

    const response = await fetch(ROUTES.consentAccept, {
      method: 'POST',
      headers: buildHeaders(token),
      body: JSON.stringify({ consentTermId }),
    });

    const json = await response.json();

    console.log('Status:', response.status);
    console.log('Resposta:', JSON.stringify(json));

    if (response.ok) {
      navigation.replace('MainTabs');
    } else {
      Alert.alert('Erro', json.message || 'Não foi possível registrar o consentimento.');
    }
  } catch (error) {
    console.log('Erro catch:', error.message);
    Alert.alert('Erro de conexão', 'Verifique sua internet e tente novamente.');
  } finally {
    setCarregando(false);
  }
}

  async function recusar() {
    Alert.alert(
      'Recusar Termo',
      'Para usar o aplicativo é necessário aceitar o Termo de Consentimento. Deseja sair?',
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
      ]
    );
  }

  return (
    <View style={styles.root}>
      <StatusBar barStyle="dark-content" backgroundColor="#f5f5f5" />
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <Text style={styles.icon}>📋</Text>
        <Text style={styles.titulo}>Termo de Consentimento</Text>
        <Text style={styles.subtitulo}>
          Para continuar usando o UNIFAE Care, você precisa aceitar o Termo de Consentimento de uso de dados.
        </Text>
      </ScrollView>

      <View style={styles.rodape}>
        <TouchableOpacity style={styles.botaoAceitar} onPress={aceitar} disabled={carregando} activeOpacity={0.85}>
          {carregando ? <ActivityIndicator color="#fff" /> : <Text style={styles.botaoAceitarTexto}>Aceitar e continuar</Text>}
        </TouchableOpacity>
        <TouchableOpacity style={styles.botaoRecusar} onPress={recusar} disabled={carregando} activeOpacity={0.8}>
          <Text style={styles.botaoRecusarTexto}>Recusar</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#f5f5f5' },
  container: { padding: 24, paddingBottom: 160, alignItems: 'center' },
  icon: { fontSize: 56, marginTop: 40, marginBottom: 20 },
  titulo: { fontSize: 24, fontWeight: '800', color: '#1a1a1a', textAlign: 'center', marginBottom: 12 },
  subtitulo: { fontSize: 14, color: '#555', textAlign: 'center', lineHeight: 21 },
  rodape: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    backgroundColor: '#f5f5f5', paddingHorizontal: 24,
    paddingBottom: Platform.OS === 'ios' ? 36 : 24,
    paddingTop: 16, borderTopWidth: 1, borderTopColor: '#e5e5e5',
  },
  botaoAceitar: {
    backgroundColor: '#2a7a4b', borderRadius: 12, height: 52,
    alignItems: 'center', justifyContent: 'center', marginBottom: 10,
  },
  botaoAceitarTexto: { color: '#fff', fontSize: 16, fontWeight: '700' },
  botaoRecusar: {
    borderWidth: 1.5, borderColor: '#ccc', borderRadius: 12, height: 48,
    alignItems: 'center', justifyContent: 'center',
  },
  botaoRecusarTexto: { color: '#888', fontSize: 15, fontWeight: '600' },
});