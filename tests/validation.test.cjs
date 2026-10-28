const test = require('node:test');
const assert = require('node:assert/strict');
const { maskDate } = require('../dist-test/utils/format');
const { isValidDateBR, validateField, validateForm } = require('../dist-test/utils/validation');
const { parseStoredSubmissions, valuesForStorage } = require('../dist-test/utils/submissions');

const base = (type, other = {}) => ({ id: 'test', label: 'Teste', type, required: true, ...other });

test('validacao impede envio com campo obrigatorio vazio', () => {
  const errors = validateForm([base('text')], { test: '' });
  assert.equal(errors.test, 'Este campo é obrigatório.');
});

test('email invalido e numero invalido recebem feedback', () => {
  assert.equal(validateField(base('email'), 'nao-e-email'), 'Informe um e-mail válido.');
  assert.equal(validateField(base('number'), '12abc'), 'Digite um número válido.');
  assert.equal(validateField(base('number'), '12,5'), null);
});

test('checkbox obrigatorio exige true, mas switch false e valido', () => {
  assert.ok(validateField(base('checkbox'), false));
  assert.equal(validateField(base('checkbox'), true), null);
  assert.equal(validateField(base('switch'), false), null);
  assert.equal(validateField(base('switch'), true), null);
});

test('select e radio aceitam apenas opcoes descritas no JSON', () => {
  const opts = { options: [{ label: 'A', value: 'a' }] };
  assert.equal(validateField(base('select', opts), 'a'), null);
  assert.ok(validateField(base('select', opts), 'b'));
  assert.ok(validateField(base('radio', opts), 'b'));
});

test('data real, bissexto e mascara', () => {
  assert.equal(maskDate('29022024'), '29/02/2024');
  assert.equal(maskDate('31/12/2026'), '31/12/2026');
  assert.equal(isValidDateBR('29/02/2024'), true);
  assert.equal(isValidDateBR('29/02/2023'), false);
  assert.equal(isValidDateBR('31/04/2024'), false);
  assert.equal(isValidDateBR('01/01/2020'), true);
});

test('senha nunca vai ao AsyncStorage em texto puro', () => {
  const safe = valuesForStorage([base('password'), base('email', { id: 'email' })], {
    test: 'minha-senha-secreta', email: 'a@b.com',
  });
  assert.equal(safe.test, '••••••••');
  assert.equal(safe.email, 'a@b.com');
  assert.ok(!JSON.stringify(safe).includes('minha-senha-secreta'));
});

test('restauracao de envios preserva apenas estruturas validas', () => {
  const valid = [{ id: '1', createdAt: new Date().toISOString(), values: { test: 'ok', yes: false } }];
  assert.deepEqual(parseStoredSubmissions(JSON.stringify(valid)), valid);
  assert.throws(() => parseStoredSubmissions('{"foo":1}'));
  assert.throws(() => parseStoredSubmissions('[{"id":"1","createdAt":"today","values":{"bad":{}}}]'));
});
