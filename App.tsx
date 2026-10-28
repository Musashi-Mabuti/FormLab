import { useCallback, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import type { ScrollViewInstance } from 'react-native';
import { DynamicField } from './src/components/DynamicField';
import { SubmissionCard } from './src/components/SubmissionCard';
import { formConfig } from './src/config';
import { useDynamicForm } from './src/hooks/useDynamicForm';
import { usePersistedSubmissions } from './src/hooks/usePersistedSubmissions';
import { colors } from './src/theme/colors';
import type { FormSubmission } from './src/types/form';
import { valuesForStorage } from './src/utils/submissions';

type ScreenTab = 'form' | 'results';

export default function App() {
  const [activeTab, setActiveTab] = useState<ScreenTab>('form');
  const [message, setMessage] = useState<string | null>(null);
  const scrollRef = useRef<ScrollViewInstance>(null);
  const { values, errors, changeValue, validate, reset, progress } = useDynamicForm(formConfig.fields);
  const { submissions, status, storageError, addSubmission, removeAll } = usePersistedSubmissions();

  const progressPercent = useMemo(
    () => progress.total === 0 ? 100 : Math.round((progress.completed / progress.total) * 100),
    [progress],
  );
  const progressWidth = `${progressPercent}%` as `${number}%`;
  const busy = status !== 'ready';
  const errorCount = Object.keys(errors).length;

  const switchTab = useCallback((tab: ScreenTab) => {
    setActiveTab(tab);
    setMessage(null);
    scrollRef.current?.scrollTo({ y: 0, animated: true });
  }, []);

  const submit = useCallback(async () => {
    setMessage(null);
    if (busy) return;
    if (!validate()) {
      setMessage('Revise os campos destacados antes de enviar.');
      scrollRef.current?.scrollTo({ y: 200, animated: true });
      return;
    }
    const submission: FormSubmission = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
      createdAt: new Date().toISOString(),
      values: valuesForStorage(formConfig.fields, values),
    };
    const saved = await addSubmission(submission);
    if (saved) switchTab('results');
  }, [busy, validate, values, addSubmission, switchTab]);

  const clearSaved = useCallback(async () => {
    await removeAll();
  }, [removeAll]);

  return (
    <View style={styles.screen}>
      <StatusBar barStyle="dark-content" />
      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView ref={scrollRef} keyboardShouldPersistTaps="handled" contentContainerStyle={styles.pageContent}>
          <View style={styles.pageWidth}>
            <View style={styles.hero}>
              <View style={styles.brandRow}>
                <View style={styles.brandMark}><Text style={styles.brandMarkText}>F.</Text></View>
                <Text style={styles.brandName}>FORM LAB</Text>
                <View style={styles.topBadge}><Text style={styles.topBadgeText}>CP 03</Text></View>
              </View>
              <Text style={styles.eyebrow}>REACT NATIVE · EXPO SDK 58</Text>
              <Text style={styles.heroTitle}>Formulários que se{"\n"}adaptam a você.</Text>
              <Text style={styles.heroSubtitle}>
                Uma experiência de cadastro inteligente, gerada por JSON e salva no seu dispositivo.
              </Text>
              <View style={styles.heroMeta}>
                <Text style={styles.metaText}>◈ 10 tipos de campos</Text>
                <Text style={styles.metaText}>◈ 100% dinâmico</Text>
                <Text style={styles.metaText}>◈ Armazenamento local</Text>
              </View>
            </View>

            <View style={styles.tabs}>
              <Pressable
                accessibilityRole="tab"
                accessibilityState={{ selected: activeTab === 'form' }}
                onPress={() => switchTab('form')}
                style={[styles.tab, activeTab === 'form' ? styles.activeTab : null]}
              >
                <Text style={[styles.tabText, activeTab === 'form' ? styles.activeTabText : null]}>
                  Preencher formulário
                </Text>
              </Pressable>
              <Pressable
                accessibilityRole="tab"
                accessibilityState={{ selected: activeTab === 'results' }}
                onPress={() => switchTab('results')}
                style={[styles.tab, activeTab === 'results' ? styles.activeTab : null]}
              >
                <Text style={[styles.tabText, activeTab === 'results' ? styles.activeTabText : null]}>
                  Envios salvos ({submissions.length})
                </Text>
              </Pressable>
            </View>

            {storageError && (
              <View style={styles.errorBanner}>
                <Text style={styles.errorBannerText}>{storageError}</Text>
              </View>
            )}

            {activeTab === 'form' ? (
              <View style={styles.formCard}>
                <View style={styles.cardTop}>
                  <View style={styles.cardHeading}>
                    <Text style={styles.sectionEyebrow}>ETAPA ÚNICA</Text>
                    <Text style={styles.cardTitle}>{formConfig.title}</Text>
                    {formConfig.description && <Text style={styles.cardDescription}>{formConfig.description}</Text>}
                  </View>
                  <View style={styles.fieldsBadge}>
                    <Text style={styles.fieldsBadgeText}>{formConfig.fields.length} campos</Text>
                  </View>
                </View>
                <View style={styles.progressRow}>
                  <Text style={styles.progressText}>Preenchimento dos campos obrigatórios</Text>
                  <Text style={styles.progressNumber}>{progress.completed}/{progress.total}</Text>
                </View>
                <View style={styles.progressTrack}>
                  <View style={[styles.progressFill, { width: progressWidth }]} />
                </View>

                <View style={styles.fieldsSection}>
                  {formConfig.fields.map((field) => (
                    <DynamicField
                      key={field.id}
                      field={field}
                      value={values[field.id]}
                      error={errors[field.id]}
                      onChange={changeValue}
                    />
                  ))}
                </View>

                {message && (
                  <View style={styles.errorBanner}>
                    <Text style={styles.errorBannerText}>
                      {message}{errorCount > 0 ? ` (${errorCount} ${errorCount === 1 ? 'pendência' : 'pendências'})` : ''}
                    </Text>
                  </View>
                )}
                <Text style={styles.requiredHint}>* Campos de preenchimento obrigatório</Text>
                <Pressable
                  testID="submit-button"
                  accessibilityRole="button"
                  disabled={busy}
                  onPress={() => void submit()}
                  style={[styles.primaryButton, busy ? styles.disabledButton : null]}
                >
                  {busy ? <ActivityIndicator color={colors.white} /> : (
                    <Text style={styles.primaryButtonText}>Enviar formulário    →</Text>
                  )}
                </Pressable>
                <Pressable
                  accessibilityRole="button"
                  disabled={busy}
                  onPress={() => { reset(); setMessage(null); }}
                  style={styles.secondaryButton}
                >
                  <Text style={styles.secondaryButtonText}>Limpar campos preenchidos</Text>
                </Pressable>
              </View>
            ) : (
              <View style={styles.resultsPage}>
                <View style={styles.resultsHeader}>
                  <View style={styles.resultsIntro}>
                    <Text style={styles.sectionEyebrow}>PERSISTÊNCIA LOCAL</Text>
                    <Text style={styles.cardTitle}>Respostas enviadas</Text>
                    <Text style={styles.cardDescription}>
                      Os envios ficam armazenados no AsyncStorage mesmo após fechar e reabrir o aplicativo.
                    </Text>
                  </View>
                  {submissions.length > 0 && (
                    <Pressable
                      testID="clear-storage-button"
                      accessibilityRole="button"
                      disabled={busy}
                      onPress={() => void clearSaved()}
                      style={styles.deleteButton}
                    >
                      <Text style={styles.deleteButtonText}>{status === 'clearing' ? 'Excluindo...' : 'Apagar todos'}</Text>
                    </Pressable>
                  )}
                </View>
                {status === 'loading' ? (
                  <View style={styles.emptyState}>
                    <ActivityIndicator color={colors.blue} size="large" />
                    <Text style={styles.emptyDescription}>Recuperando dados...</Text>
                  </View>
                ) : submissions.length === 0 ? (
                  <View style={styles.emptyState}>
                    <View style={styles.emptyIcon}><Text style={styles.emptyIconText}>□</Text></View>
                    <Text style={styles.emptyTitle}>Nenhum envio por aqui</Text>
                    <Text style={styles.emptyDescription}>
                      Suas respostas aparecerão aqui depois que você preencher e enviar o formulário.
                    </Text>
                    <Pressable style={styles.emptyAction} onPress={() => switchTab('form')}>
                      <Text style={styles.emptyActionText}>Preencher agora →</Text>
                    </Pressable>
                  </View>
                ) : (
                  submissions.map((submission, index) => (
                    <SubmissionCard
                      key={submission.id}
                      submission={submission}
                      index={index}
                      newest={index === 0}
                      fields={formConfig.fields}
                    />
                  ))
                )}
                {submissions.length > 0 && (
                  <Text style={styles.historyHint}>Exibindo os últimos {submissions.length} de até 20 envios.</Text>
                )}
              </View>
            )}
            <View style={styles.footer}>
              <Text style={styles.footerText}>CHECKPOINT 03  ·  TYPESCRIPT  ·  ANDROID / IOS / WEB</Text>
              <Text style={styles.footerDetail}>Os campos e as opções são definidos em src/config/formulario.json</Text>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  screen: { flex: 1, backgroundColor: colors.background },
  pageContent: { alignItems: 'center', paddingBottom: 40 },
  pageWidth: { width: '100%', maxWidth: 810, paddingHorizontal: 18 },
  hero: {
    backgroundColor: colors.navy, paddingHorizontal: 30, paddingTop: 28, paddingBottom: 31,
    marginHorizontal: -18, marginBottom: 18,
  },
  brandRow: { flexDirection: 'row', alignItems: 'center', gap: 9, marginBottom: 32 },
  brandMark: { width: 32, height: 32, borderRadius: 9, backgroundColor: colors.blue, justifyContent: 'center', alignItems: 'center' },
  brandMarkText: { color: colors.white, fontSize: 18, fontWeight: '900' },
  brandName: { color: colors.white, fontSize: 13, fontWeight: '900', letterSpacing: 2, flex: 1 },
  topBadge: { paddingHorizontal: 12, paddingVertical: 7, borderRadius: 20, backgroundColor: colors.slate },
  topBadgeText: { color: '#DCE5FF', fontSize: 11, fontWeight: '800', letterSpacing: 1 },
  eyebrow: { color: '#AFC4FF', fontSize: 11, fontWeight: '800', letterSpacing: 1.6, marginBottom: 11 },
  heroTitle: { color: colors.white, fontSize: 30, fontWeight: '900', lineHeight: 38, marginBottom: 12 },
  heroSubtitle: { color: '#CBD5E5', fontSize: 14, lineHeight: 22, maxWidth: 540, marginBottom: 21 },
  heroMeta: { flexDirection: 'row', flexWrap: 'wrap', gap: 16 },
  metaText: { color: '#BFD0F2', fontSize: 11, fontWeight: '600' },
  tabs: {
    flexDirection: 'row', gap: 8, backgroundColor: colors.white, padding: 5,
    borderRadius: 13, borderWidth: 1, borderColor: colors.border, marginBottom: 18,
  },
  tab: { flex: 1, minWidth: 0, alignItems: 'center', justifyContent: 'center', paddingVertical: 13, borderRadius: 9 },
  activeTab: { backgroundColor: colors.blueLight },
  tabText: { color: colors.muted, fontSize: 13, fontWeight: '700', textAlign: 'center' },
  activeTabText: { color: colors.blue, fontWeight: '800' },
  formCard: {
    backgroundColor: colors.white, borderWidth: 1, borderColor: colors.border, borderRadius: 18,
    padding: 24,
  },
  cardTop: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'flex-start', gap: 10, marginBottom: 24 },
  cardHeading: { flex: 1, minWidth: 190, gap: 8 },
  sectionEyebrow: { fontSize: 10, fontWeight: '900', letterSpacing: 1.6, color: colors.blue },
  cardTitle: { fontSize: 24, lineHeight: 30, fontWeight: '900', color: colors.navy },
  cardDescription: { fontSize: 13, lineHeight: 20, color: colors.muted, maxWidth: 540 },
  fieldsBadge: { backgroundColor: colors.blueLight, paddingHorizontal: 11, paddingVertical: 8, borderRadius: 20 },
  fieldsBadgeText: { color: colors.blue, fontSize: 11, fontWeight: '800' },
  progressRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 8, marginBottom: 10 },
  progressText: { flex: 1, color: colors.muted, fontSize: 12 },
  progressNumber: { fontSize: 12, color: colors.blue, fontWeight: '900' },
  progressTrack: { height: 7, borderRadius: 8, backgroundColor: '#EBF0F7', overflow: 'hidden', marginBottom: 27 },
  progressFill: { height: '100%', backgroundColor: colors.blue, borderRadius: 8 },
  fieldsSection: {},
  errorBanner: { borderRadius: 11, padding: 13, marginBottom: 16, backgroundColor: colors.redLight, borderWidth: 1, borderColor: '#F5C9CE' },
  errorBannerText: { color: colors.red, fontSize: 13, fontWeight: '700', lineHeight: 20 },
  requiredHint: { color: colors.muted, fontSize: 11, marginBottom: 15 },
  primaryButton: { backgroundColor: colors.blue, borderRadius: 12, justifyContent: 'center', alignItems: 'center', minHeight: 52, padding: 13 },
  disabledButton: { opacity: 0.6 },
  primaryButtonText: { color: colors.white, fontSize: 15, fontWeight: '800' },
  secondaryButton: { alignItems: 'center', padding: 16 },
  secondaryButtonText: { color: colors.muted, fontSize: 13, fontWeight: '700' },
  resultsPage: {},
  resultsHeader: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12, marginBottom: 20 },
  resultsIntro: { flex: 1, minWidth: 220, gap: 9 },
  deleteButton: { backgroundColor: colors.redLight, paddingHorizontal: 16, paddingVertical: 11, borderRadius: 10 },
  deleteButtonText: { color: colors.red, fontSize: 12, fontWeight: '800' },
  emptyState: { backgroundColor: colors.white, borderWidth: 1, borderColor: colors.border, borderRadius: 17, minHeight: 320, alignItems: 'center', justifyContent: 'center', padding: 32, gap: 11 },
  emptyIcon: { width: 58, height: 58, borderRadius: 18, backgroundColor: colors.blueLight, alignItems: 'center', justifyContent: 'center', marginBottom: 5 },
  emptyIconText: { fontSize: 29, color: colors.blue },
  emptyTitle: { fontSize: 20, color: colors.navy, fontWeight: '900', textAlign: 'center' },
  emptyDescription: { fontSize: 13, color: colors.muted, lineHeight: 21, textAlign: 'center', maxWidth: 340 },
  emptyAction: { backgroundColor: colors.blueLight, borderRadius: 10, paddingHorizontal: 15, paddingVertical: 11, marginTop: 7 },
  emptyActionText: { color: colors.blue, fontWeight: '800', fontSize: 13 },
  historyHint: { color: colors.muted, fontSize: 12, textAlign: 'center' },
  footer: { gap: 8, alignItems: 'center', paddingTop: 26 },
  footerText: { fontWeight: '800', color: '#8491A9', fontSize: 10, letterSpacing: 0.8, textAlign: 'center' },
  footerDetail: { color: '#8491A9', fontSize: 11, textAlign: 'center' },
});
