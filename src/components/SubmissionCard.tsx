import { StyleSheet, Text, View } from 'react-native';
import type { FormField, FormSubmission } from '../types/form';
import { colors } from '../theme/colors';
import { displayFieldValue, formatSubmissionDate } from '../utils/format';

interface SubmissionCardProps {
  submission: FormSubmission;
  fields: FormField[];
  newest?: boolean;
  index: number;
}

export function SubmissionCard({ submission, fields, newest, index }: SubmissionCardProps) {
  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View style={styles.titleGroup}>
          <Text style={styles.title}>{newest ? 'Último envio' : `Envio #${index + 1}`}</Text>
          <Text style={styles.date}>{formatSubmissionDate(submission.createdAt)}</Text>
        </View>
        {newest && <Text style={styles.savedBadge}>✓ Salvo localmente</Text>}
      </View>
      <View style={styles.answers}>
        {fields.map((field) => (
          <View key={field.id} style={styles.answer}>
            <Text style={styles.answerLabel}>{field.label}</Text>
            <Text style={styles.answerValue} selectable>
              {displayFieldValue(field, submission.values[field.id])}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderWidth: 1, borderColor: colors.border, borderRadius: 17,
    backgroundColor: colors.white, overflow: 'hidden', marginBottom: 16,
  },
  header: {
    backgroundColor: colors.subtle, flexDirection: 'row', flexWrap: 'wrap', gap: 10,
    justifyContent: 'space-between', alignItems: 'center', padding: 18,
    borderBottomWidth: 1, borderBottomColor: colors.border,
  },
  titleGroup: { gap: 5 },
  title: { fontSize: 17, color: colors.navy, fontWeight: '800' },
  date: { fontSize: 12, color: colors.muted },
  savedBadge: {
    fontSize: 11, color: colors.green, backgroundColor: colors.greenLight,
    borderRadius: 20, overflow: 'hidden', paddingHorizontal: 11, paddingVertical: 7,
    fontWeight: '800',
  },
  answers: { paddingHorizontal: 18, paddingTop: 7, paddingBottom: 11 },
  answer: {
    paddingVertical: 13, gap: 6, borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  answerLabel: { fontSize: 12, fontWeight: '700', color: colors.muted },
  answerValue: { fontSize: 14, color: colors.text, lineHeight: 21 },
});
