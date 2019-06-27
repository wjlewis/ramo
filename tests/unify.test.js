import { Var } from '../lib/common';
import { unify } from '../lib/unify';

test('`unify` succeeds with equal non-Var terms', () => {
  const sub = new Map();
  expect(unify(3, 3, sub)).toBe(sub);
});

test('`unify` fails with unequal non-Var terms', () => {
  const sub = new Map();
  expect(unify(1, '1', sub)).toBeFalsy();
});

test('`unify` unifies a fresh Var with any term', () => {
  const x = Var();
  const sub = new Map();
  const v = { any: 'thing' };
  expect(unify(x, v, sub)).toEqual(sub.set(x, v));
});

test('`unify` unifies an associated Var with its associated term', () => {
  const x = Var();
  const sub = new Map().set(x, { a: 'value' });
  expect(unify(x, { a: 'value' }, sub)).toEqual(sub);
});

test('`unify` unifies compound terms recursively', () => {
  const x = Var();
  const y = Var();
  const t = { a: x, test: 'term' };
  const u = { a: 'simple', test: y };
  const sub = new Map().set(y, 'term');
  expect(unify(t, u, sub)).toEqual(sub.set(x, 'simple'));
});

test('`unify` uses the occurs check', () => {
  const x = Var();
  const t = { includes: x };
  const sub = new Map();
  expect(unify(x, t, sub)).toBeFalsy();
});

test('`unify` checks for occurrences in the current substitution', () => {
  const x = Var();
  const y = Var();
  const t = { includes: y };
  const sub = new Map().set(y, x);
  expect(unify(x, t, sub)).toBeFalsy();
});
