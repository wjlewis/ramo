import { isComp, Var, keysIn, Term, CompoundTerm } from './common';

// We use JavaScript arrays to represent lists of terms in ramo. This
// presents a small problem, since JavaScript arrays are themselves
// objects, and we use objects to represent compound terms. Thus, before
// performing any computation, we first desugar JavaScript arrays to a
// cons-pair representation. In the reification process, we simply
// re-sugar cons-pairs to JavaScript arrays (whenever these pairs form a
// proper list). Futhermore, in order to avoid unintended interpretation
// of plain JavaScript objects as pairs, we use private symbols to
// identify them.

// Lastly, we also replace all instances of the "wildcard variable" with
// a fresh variable.

export const NIL = Symbol('ramo.NIL');
const FIRST = Symbol('ramo.FIRST');
const REST = Symbol('ramo.REST');
export const WILD = Symbol('ramo.WILD');

export interface Pair<A, D> {
  [FIRST]: A;
  [REST]: D;
}

export function cons<A, D>(first: A, rest: D): Pair<A, D> {
  return { [FIRST]: first, [REST]: rest };
}

export function first<A, D>(p: Pair<A, D>): A {
  return p[FIRST];
}

export function rest<A, D>(p: Pair<A, D>): D {
  return p[REST];
}

export function unsweeten(x: Term): Term {
  if (x === WILD) return Var.new();
  else if (Array.isArray(x)) return unsweetenArray(x);
  else if (isComp(x)) return unsweetenComp(x as CompoundTerm);
  else return x;
}

function unsweetenArray(xs: Term[]): Term {
  if (xs.length === 0) return NIL;
  else return cons(unsweeten(xs[0]), unsweetenArray(xs.slice(1)));
}

function unsweetenComp(x: CompoundTerm): Term {
  const x1 = Object.create(Object.getPrototypeOf(x));
  for (let k of keysIn(x)) {
    x1[k] = unsweeten(x[k]);
  }
  return x1;
}

export function sweeten(x: Term): Term {
  if (x === NIL) return [];
  else if (isPair(x)) return sweetenPair(x as Pair<any, any>);
  else if (isComp(x)) return sweetenComp(x as CompoundTerm);
  else return x;
}

function isPair(x: Term) {
  return x && typeof x === 'object' && FIRST in x && REST in x;
}

// Here we only re-sugar a cons-pair as a JavaScript array if it
// represents a proper list.
function sweetenPair(p: Pair<any, any>): Term {
  const f = sweeten(first(p));
  const r = sweeten(rest(p));
  return Array.isArray(r) ? [f, ...r] : cons(f, r);
}

function sweetenComp(x: CompoundTerm): Term {
  const x1 = Object.create(Object.getPrototypeOf(x));
  for (let k of keysIn(x)) {
    x1[k] = sweeten(x[k]);
  }
  return x1;
}
