import { Var, CompoundTerm } from '../lib/common';
import { unsweeten, sweeten, WILD, cons, NIL } from '../lib/sugar';

describe('Desugaring/resugaring', () => {
  test('`unsweeten` acts like the identity for non-Arrays', () => {
    const x = Var.new();
    const t = { this: x, a: 'test' };
    expect(unsweeten(t)).toEqual(t);
  });

  test('`unsweeten` transforms WILDs into distinct Vars', () => {
    const x = { not: WILD, the: WILD, same: WILD };
    const r = unsweeten(x) as CompoundTerm;
    expect(r.not).not.toBe(r.the);
  });

  test('`unsweeten` transforms Arrays to conses', () => {
    const a = Var.new();
    const t = [a, 'test'];
    const r = cons(a, cons('test', NIL));
    expect(unsweeten(t)).toEqual(r);
  });

  test('`unsweeten` preserves prototypes', () => {
    const x = Var.new();
    function Obj(x, y, z) {
      this.x = x;
      this.y = y;
      this.z = z;
    }
    const t = new Obj(x, 'y', 3);
    expect(unsweeten(t)).toEqual(new Obj(x, 'y', 3));
  });

  test('`sweeten` acts like the identity for non-conses', () => {
    const t = { a: 'test' };
    expect(sweeten(t)).toEqual(t);
  });

  test('`sweeten` transforms proper lists to Arrays', () => {
    const t = cons(1, cons(2, cons(3, NIL)));
    expect(sweeten(t)).toEqual([1, 2, 3]);
  });

  test('`sweeten` leaves improper lists as they are', () => {
    const x = Var.new();
    const t = cons(1, cons(x, cons(3, 'tail')));
    expect(sweeten(t)).toEqual(t);
  });

  test('`sweeten` preserves prototypes', () => {
    function Obj(x, y) {
      this.x = x;
      this.y = y;
    }
    const t = new Obj(3, cons(1, cons(2, NIL)));
    expect(sweeten(t)).toEqual(new Obj(3, [1, 2]));
  });
});
