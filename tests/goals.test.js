import * as $ from '../lib/streams';
import { unify } from '../lib/unify';
import { Var } from '../lib/common';
import {
  succeedo,
  failo,
  eq,
} from '../lib/goals';

test('`succeedo` produces a unit stream of its argument', () => {
  expect(succeedo(10)).toEqual($.unit(10));
});

test('`failo` produces the empty stream', () => {
  expect(failo('anything')).toEqual($.empty);
});

test('`eq(x, y)(s)` produces a unit stream if x and y unify in s', () => {
  const u = Var();
  const v = Var();
  const x = { this: u, a: 'test' };
  const y = { this: 'is', a: v };
  const sub = new Map().set(v, 'test');
  expect(eq(x, y)(sub)).toEqual($.unit(sub.set(u, 'is')));
});

test('`eq(x, y)(s)` produces the empty stream if x and y fail to unify in s', () => {
  const sub = new Map();
  expect(eq('a', 'b')(sub)).toEqual($.empty);
});
