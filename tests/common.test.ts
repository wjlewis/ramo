import {
  isComp,
  Var,
  isVar,
  walk,
  walkAll,
  keysIn,
  iota,
  toArray,
} from '../lib/common';

describe('Shared elements', () => {
  test('`isComp(x)` is truthy when x is a non-Var object', () => {
    expect(isComp({ this: 'is', a: 'test' })).toBeTruthy();
  });

  test('`isComp(x)` is falsy when x is a Var', () => {
    expect(isComp(Var.new())).toBeFalsy();
  });

  test('`isComp(x)` is falsy when x is not an object', () => {
    expect(isComp(3)).toBeFalsy();
  });

  test('`isComp(x)` is falsy when x is null', () => {
    expect(isComp(null)).toBeFalsy();
  });

  test('`isVar(x)` is truthy when x is a Var', () => {
    expect(isVar(Var.new())).toBeTruthy();
  });

  test('`isVar(x)` is falsy when x is a non-Var object', () => {
    expect(isVar({ another: 'test' })).toBeFalsy();
  });

  test('`isVar(x)` is falsy when x is not an object', () => {
    expect(isVar(42)).toBeFalsy();
  });

  test('`isVar(x)` is falsy when x is null', () => {
    expect(isVar(null)).toBeFalsy();
  });

  test('`walk` acts like the identity for non-Vars', () => {
    const sub = new Map();
    expect(walk(77, sub)).toBe(77);
  });

  test('`walk` acts like the identity for fresh Vars', () => {
    const x = Var.new();
    const sub = new Map();
    expect(walk(x, sub)).toBe(x);
  });

  test('`walk` produces the value associated with non-fresh Vars', () => {
    const x = Var.new();
    const sub = new Map().set(x, 42);
    expect(walk(x, sub)).toBe(42);
  });

  test('`walk` walks until it finds a non-fresh value', () => {
    const x = Var.new();
    const y = Var.new();
    const z = Var.new();
    const sub = new Map().set(x, y).set(y, z).set(z, 561);
    expect(walk(x, sub)).toBe(561);
  });

  test('`walkAll` recursively walks through all elements of compound terms', () => {
    const x = Var.new();
    const y = Var.new();
    const t = { first: x, second: y };
    const sub = new Map().set(x, 'first');
    expect(walkAll(t, sub)).toEqual({
      first: 'first',
      second: y,
    });
  });

  test('`walkAll` preserves prototypes', () => {
    const x = Var.new();
    function Obj(x, y) {
      this.x = x;
      this.y = y;
    }
    const t = new Obj(x, 'y');
    const sub = new Map().set(x, 'ex');
    expect(walkAll(t, sub)).toEqual(new Obj('ex', 'y'));
  });

  test('`keysIn` collects Symbol keys', () => {
    const third = Symbol('third');
    const o = { first: 'second', [third]: 'fourth' };
    expect(keysIn(o)).toEqual(['first', third]);
  });

  test('`iota(n)` produces the Array [0..n-1]', () => {
    expect(iota(5)).toEqual([0, 1, 2, 3, 4]);
  });

  test('`toArray(x)` acts like the identity if x is an Array', () => {
    expect(toArray([3])).toEqual([3]);
  });

  test('`toArray(x)` wraps x in an Array if it is not one already', () => {
    expect(toArray(3)).toEqual([3]);
  });
});
