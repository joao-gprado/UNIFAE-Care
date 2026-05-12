import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Pressable,
} from 'react-native';
import { Feather, MaterialCommunityIcons, MaterialIcons } from '@expo/vector-icons';
import { COLORS, SPACING, RADIUS } from '../theme';

const STEPS = [
  {
    title: 'Posicionamento',
    description:
      'Mantenha o cotovelo junto ao corpo em um ângulo de 90 graus. Use uma toalha dobrada sob a axila para maior estabilidade se necessário.',
  },
  {
    title: 'Movimento',
    description:
      'Gire o antebraço para fora de forma controlada, mantendo o cotovelo fixo. Sinta a ativação na parte posterior do ombro.',
  },
  {
    title: 'Retorno',
    description:
      'Retorne à posição inicial resistindo à força elástica ou à gravidade. O movimento deve ser suave e sem trancos.',
  },
];

function PillTag({ label }) {
  return (
    <View style={styles.pill}>
      <Text style={styles.pillText}>{label}</Text>
    </View>
  );
}

function InfoCard({ icon, value, label }) {
  return (
    <View style={styles.infoCard}>
      <View style={styles.infoIconBox}>
        {icon}
      </View>
      <View style={styles.infoTextBlock}>
        <Text style={styles.infoValue}>{value}</Text>
        <Text style={styles.infoLabel}>{label}</Text>
      </View>
    </View>
  );
}

function StepItem({ index, title, description }) {
  return (
    <View style={styles.stepRow}>
      <View style={styles.stepMarkerWrapper}>
        <View style={styles.stepMarker}>
          <Text style={styles.stepMarkerText}>{index}</Text>
        </View>
        {index < STEPS.length ? <View style={styles.stepLine} /> : null}
      </View>
      <View style={styles.stepContent}>
        <Text style={styles.stepTitle}>{title}</Text>
        <Text style={styles.stepDescription}>{description}</Text>
      </View>
    </View>
  );
}

function TipCard() {
  return (
    <View style={styles.tipCard}>
      <View style={styles.tipHeader}>
        <View style={styles.tipBadge}>
          <MaterialIcons name="medical-services" size={18} color={COLORS.primary} />
        </View>
        <Text style={styles.tipTitle}>Dicas da Fisioterapeuta</Text>
      </View>
      <Text style={styles.tipText}>
        “Foque na qualidade do movimento, não na carga. Se sentir uma dor aguda, diminua a amplitude e respire profundamente durante a execução.”
      </Text>
      <View style={styles.tipIllustration}>
        <MaterialCommunityIcons name="gesture-tap" size={20} color="#CBD5E1" />
      </View>
    </View>
  );
}

export default function ExerciseDetailScreen({ navigation }) {
  return (
    <View style={styles.page}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.headerRow}>
          <Pressable style={styles.backButton} onPress={() => navigation.goBack()}>
            <Feather name="arrow-left" size={20} color={COLORS.textDark} />
          </Pressable>
          <Text style={styles.pageTitle}>UNIFAE Care</Text>
          <View style={styles.brandBadge}>
            <Text style={styles.brandText}>UNIFAE</Text>
          </View>
        </View>

        <View style={styles.tagRow}>
          <PillTag label="MEMBROS SUPERIORES" />
          <PillTag label="MOBILIDADE" />
        </View>

        <Text style={styles.mainTitle}>Rotação Externa de Ombro</Text>

        <View style={styles.videoCard}>
          <View style={styles.videoPlaceholder}>
            <Feather name="play" size={26} color={COLORS.white} />
          </View>
        </View>

        <View style={styles.infoRow}>
          <InfoCard
            icon={<MaterialCommunityIcons name="repeat" size={20} color={COLORS.primary} />}
            value="3"
            label="Unidades"
          />
          <InfoCard
            icon={<MaterialCommunityIcons name="arm-flex" size={20} color={COLORS.primary} />}
            value="15"
            label="Repetições"
          />
        </View>

        <Text style={styles.sectionTitle}>Passo a Passo</Text>

        {STEPS.map((item, index) => (
          <StepItem
            key={item.title}
            index={index + 1}
            title={item.title}
            description={item.description}
          />
        ))}

        <TipCard />
      </ScrollView>

      <TouchableOpacity style={styles.footerButton} activeOpacity={0.8} onPress={() => {}}>
        <Text style={styles.footerButtonText}>Concluir Atividade</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  page: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  content: {
    paddingBottom: 24,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.md,
    paddingTop: SPACING.lg,
    paddingBottom: SPACING.md,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: COLORS.white,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  pageTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.textDark,
  },
  brandBadge: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: COLORS.white,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  brandText: {
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.primary,
  },
  tagRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    paddingHorizontal: SPACING.md,
    marginBottom: SPACING.md,
  },
  pill: {
    backgroundColor: '#E6F3E9',
    borderRadius: 999,
    paddingVertical: 8,
    paddingHorizontal: 14,
  },
  pillText: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.primary,
    letterSpacing: 0.5,
  },
  mainTitle: {
    fontSize: 26,
    fontWeight: '800',
    color: COLORS.textDark,
    paddingHorizontal: SPACING.md,
    marginBottom: SPACING.lg,
  },
  videoCard: {
    marginHorizontal: SPACING.md,
    borderRadius: 20,
    overflow: 'hidden',
    backgroundColor: '#D8D9D7',
    marginBottom: SPACING.lg,
  },
  videoPlaceholder: {
    height: 200,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#D8D9D7',
  },
  infoRow: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: SPACING.md,
    marginBottom: SPACING.lg,
  },
  infoCard: {
    flex: 1,
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.07,
    shadowRadius: 5,
    elevation: 2,
  },
  infoIconBox: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: '#E7F5EA',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.sm,
  },
  infoTextBlock: {
    flex: 1,
  },
  infoValue: {
    fontSize: 22,
    fontWeight: '800',
    color: COLORS.textDark,
    marginBottom: 4,
  },
  infoLabel: {
    fontSize: 13,
    color: COLORS.textMedium,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.textDark,
    paddingHorizontal: SPACING.md,
    marginBottom: SPACING.md,
  },
  stepRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingHorizontal: SPACING.md,
    marginBottom: SPACING.md,
  },
  stepMarkerWrapper: {
    width: 36,
    alignItems: 'center',
  },
  stepMarker: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  stepMarkerText: {
    color: COLORS.white,
    fontWeight: '700',
  },
  stepLine: {
    width: 2,
    flex: 1,
    backgroundColor: '#D1D5DB',
    marginTop: 8,
    marginBottom: -4,
  },
  stepContent: {
    flex: 1,
    paddingLeft: SPACING.sm,
  },
  stepTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.textDark,
    marginBottom: 6,
  },
  stepDescription: {
    fontSize: 13,
    color: COLORS.textMedium,
    lineHeight: 20,
  },
  tipCard: {
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    marginHorizontal: SPACING.md,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  tipHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  tipBadge: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: '#E6F3E9',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.sm,
  },
  tipTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.textDark,
  },
  tipText: {
    fontSize: 13,
    color: COLORS.textMedium,
    lineHeight: 20,
  },
  tipIllustration: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: '#F8FAF8',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: SPACING.md,
    alignSelf: 'flex-start',
  },
  footerButton: {
    backgroundColor: COLORS.primary,
    marginHorizontal: SPACING.md,
    marginBottom: SPACING.md,
    borderRadius: RADIUS.xl,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  footerButtonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: '700',
  },
});
