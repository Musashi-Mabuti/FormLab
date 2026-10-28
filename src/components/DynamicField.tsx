import { useState } from 'react';
import {
  Pressable,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
} from 'react-native';
import type { FormField, FormValue } from '../types/form';
import { colors } from '../theme/colors';
import { maskDate } from '../utils/format';

interface DynamicFieldProps {
  field: FormField;
  value: FormValue | undefined;
  error?: string;
  onChange: (id: string, value: FormValue) => void;
}

export function DynamicField({ field, value, error, onChange }: DynamicFieldProps) {
  const [isSelectOpen, setSelectOpen] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const stringValue = typeof value === 'string' ? value : '';
  const booleanValue = value === true;

  function update(valueToSet: FormValue) {
    onChange(field.id, valueToSet);
  }

  function renderControl() {
    switch (field.type) {
      case 'text':
      case 'email':
      case 'password':
      case 'number':
      case 'multiline':
      case 'textarea':
      case 'date': {
        const isPassword = field.type === 'password';
        const isMultiline = field.type === 'multiline' || field.type === 'textarea';
        const isDate = field.type === 'date';
        const keyboardType = field.type === 'email'
          ? 'email-address'
          : field.type === 'number'
            ? 'decimal-pad'
            : isDate ? 'number-pad' : 'default';
        return (
          <View style={[styles.inputShell, error ? styles.errorBorder : null]}>
            <TextInput
              testID={`field-${field.id}`}
              accessibilityLabel={field.label}
              style={[styles.input, isMultiline ? styles.multiline : null]}
              placeholder={field.placeholder ?? (isDate ? 'DD/MM/AAAA' : 'Digite aqui')}
              placeholderTextColor={colors.muted}
              value={stringValue}
              onChangeText={(next) => update(isDate ? maskDate(next) : next)}
              keyboardType={keyboardType}
              secureTextEntry={isPassword && !showPassword}
              multiline={isMultiline}
              textAlignVertical={isMultiline ? 'top' : 'center'}
              autoCapitalize={field.type === 'email' || isPassword ? 'none' : 'sentences'}
              autoCorrect={field.type !== 'email' && !isPassword}
              maxLength={isDate ? 10 : undefined}
            />
            {isPassword && (
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
                onPress={() => setShowPassword((previous) => !previous)}
                style={styles.passwordAction}
              >
                <Text style={styles.passwordActionText}>{showPassword ? 'Ocultar' : 'Mostrar'}</Text>
              </Pressable>
            )}
          </View>
        );
      }
      case 'select':
      case 'combo': {
        const selected = field.options?.find((option) => option.value === stringValue);
        return (
          <View>
            <Pressable
              testID={`field-${field.id}`}
              accessibilityRole="button"
              accessibilityLabel={`Selecionar ${field.label}`}
              accessibilityState={{ expanded: isSelectOpen }}
              onPress={() => setSelectOpen((previous) => !previous)}
              style={[styles.selectTrigger, error ? styles.errorBorder : null]}
            >
              <Text style={[styles.selectValue, !selected ? styles.placeholder : null]}>
                {selected?.label ?? 'Selecione uma opção'}
              </Text>
              <Text style={styles.chevron}>{isSelectOpen ? '⌃' : '⌄'}</Text>
            </Pressable>
            {isSelectOpen && (
              <View style={styles.selectMenu}>
                {(field.options ?? []).map((option) => (
                  <Pressable
                    key={option.value}
                    accessibilityRole="button"
                    accessibilityState={{ selected: option.value === stringValue }}
                    onPress={() => {
                      update(option.value);
                      setSelectOpen(false);
                    }}
                    style={styles.selectOption}
                  >
                    <Text style={[
                      styles.choiceText,
                      option.value === stringValue ? styles.choiceSelectedText : null,
                    ]}>{option.label}</Text>
                    {option.value === stringValue && <Text style={styles.checkmark}>✓</Text>}
                  </Pressable>
                ))}
              </View>
            )}
          </View>
        );
      }
      case 'radio':
        return (
          <View style={styles.optionsStack}>
            {(field.options ?? []).map((option) => {
              const checked = stringValue === option.value;
              return (
                <Pressable
                  key={option.value}
                  accessibilityRole="radio"
                  accessibilityState={{ checked }}
                  onPress={() => update(option.value)}
                  style={[styles.optionRow, checked ? styles.optionSelected : null]}
                >
                  <View style={[styles.radioOuter, checked ? styles.radioOuterChecked : null]}>
                    {checked && <View style={styles.radioInner} />}
                  </View>
                  <Text style={[styles.choiceText, checked ? styles.choiceSelectedText : null]}>
                    {option.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        );
      case 'checkbox':
        return (
          <Pressable
            testID={`field-${field.id}`}
            accessibilityRole="checkbox"
            accessibilityLabel={field.label}
            accessibilityState={{ checked: booleanValue }}
            onPress={() => update(!booleanValue)}
            style={[styles.optionRow, booleanValue ? styles.optionSelected : null]}
          >
            <View style={[styles.checkbox, booleanValue ? styles.checkboxSelected : null]}>
              {booleanValue && <Text style={styles.checkboxCheck}>✓</Text>}
            </View>
            <Text style={styles.choiceText}>{booleanValue ? 'Aceito' : 'Toque para marcar'}</Text>
          </Pressable>
        );
      case 'switch':
        return (
          <View style={styles.switchRow}>
            <View style={styles.switchTextGroup}>
              <Text style={styles.switchMainText}>{booleanValue ? 'Sim, quero receber' : 'Não, obrigado'}</Text>
              <Text style={styles.switchSecondary}>Escolha sua preferência</Text>
            </View>
            <Switch
              testID={`field-${field.id}`}
              accessibilityLabel={field.label}
              value={booleanValue}
              onValueChange={update}
              trackColor={{ false: '#CBD4E2', true: '#9BB0FA' }}
              thumbColor={booleanValue ? colors.blue : colors.white}
            />
          </View>
        );
    }
  }

  return (
    <View style={styles.fieldGroup}>
      <Text style={styles.label}>
        {field.label}{field.required && <Text style={styles.required}> *</Text>}
      </Text>
      {renderControl()}
      {error ? (
        <Text style={styles.errorMessage} accessibilityRole="alert">{error}</Text>
      ) : field.helpText ? (
        <Text style={styles.helpText}>{field.helpText}</Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  fieldGroup: { gap: 9, marginBottom: 23 },
  label: { color: colors.text, fontWeight: '700', fontSize: 14, lineHeight: 21 },
  required: { color: colors.red },
  inputShell: {
    minHeight: 50, borderWidth: 1, borderColor: colors.border, borderRadius: 12,
    backgroundColor: colors.white, flexDirection: 'row', alignItems: 'center', overflow: 'hidden',
  },
  errorBorder: { borderColor: colors.red },
  input: { color: colors.text, fontSize: 15, paddingHorizontal: 15, paddingVertical: 11, flex: 1, minWidth: 0 },
  multiline: { minHeight: 92, textAlignVertical: 'top' },
  passwordAction: { paddingHorizontal: 14, paddingVertical: 13 },
  passwordActionText: { color: colors.blue, fontSize: 12, fontWeight: '700' },
  selectTrigger: {
    minHeight: 50, borderWidth: 1, borderColor: colors.border, borderRadius: 12,
    backgroundColor: colors.white, paddingHorizontal: 15,
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 8,
  },
  selectValue: { color: colors.text, fontSize: 15, flex: 1 },
  placeholder: { color: colors.muted },
  chevron: { color: colors.blue, fontSize: 23, fontWeight: '600' },
  selectMenu: {
    marginTop: 6, borderWidth: 1, borderColor: colors.border, borderRadius: 12,
    backgroundColor: colors.white, overflow: 'hidden',
  },
  selectOption: {
    flexDirection: 'row', minHeight: 44, justifyContent: 'space-between',
    alignItems: 'center', paddingHorizontal: 14, paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.border,
  },
  checkmark: { fontSize: 18, fontWeight: '700', color: colors.blue },
  optionsStack: { gap: 9 },
  optionRow: {
    flexDirection: 'row', alignItems: 'center', gap: 11, paddingVertical: 13,
    paddingHorizontal: 15, borderWidth: 1, borderRadius: 12, borderColor: colors.border,
    backgroundColor: colors.white, minHeight: 48,
  },
  optionSelected: { borderColor: colors.blue, backgroundColor: colors.blueLight },
  choiceText: { color: colors.text, fontSize: 14, flexShrink: 1 },
  choiceSelectedText: { color: colors.blue, fontWeight: '700' },
  radioOuter: {
    width: 19, height: 19, borderRadius: 10, borderWidth: 2,
    borderColor: '#ABB8CB', justifyContent: 'center', alignItems: 'center',
  },
  radioOuterChecked: { borderColor: colors.blue },
  radioInner: { width: 9, height: 9, borderRadius: 5, backgroundColor: colors.blue },
  checkbox: {
    width: 20, height: 20, borderRadius: 5, borderWidth: 2,
    borderColor: '#ABB8CB', alignItems: 'center', justifyContent: 'center',
  },
  checkboxSelected: { borderColor: colors.blue, backgroundColor: colors.blue },
  checkboxCheck: { color: colors.white, fontWeight: '800', fontSize: 14 },
  switchRow: {
    flexDirection: 'row', justifyContent: 'space-between', gap: 10,
    alignItems: 'center', backgroundColor: colors.subtle, borderWidth: 1,
    borderColor: colors.border, borderRadius: 12, paddingVertical: 12, paddingHorizontal: 15,
  },
  switchTextGroup: { flex: 1, gap: 3 },
  switchMainText: { fontSize: 14, fontWeight: '700', color: colors.text },
  switchSecondary: { fontSize: 12, color: colors.muted },
  helpText: { color: colors.muted, fontSize: 12, lineHeight: 17 },
  errorMessage: { color: colors.red, fontSize: 12, lineHeight: 18, fontWeight: '600' },
});
