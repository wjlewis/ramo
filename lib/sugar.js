import { isComp, Var, keysIn } from './common';

// We use JavaScript arrays to represent lists of terms in ramo. This
// presents a small problem, since JavaScript arrays are themselves
// objects, and we use objects to represent compound terms. Thus,
// before performing any computation, we first desugar JavaScript
// arrays to a cons-pair representation. In the reification process,
// we simply re-sugar cons-pairs to JavaScript arrays (whenever these
// pairs form a proper list). Futhermore, in order to avoid unintended
// interpretation of plain JavaScript objects as pairs, we use private
// symbols to identify them.

// Lastly, we also replace all instances of the "wildcard variable"
// with a fresh variable.

export const NIL = Symbol('ramo.NIL');
const FIRST = Symbol('ramo.FIRST');
const REST = Symbol('ramo.REST');
export const WILD = Symbol('ramo.WILD');

export const cons = (first, rest) => ({ [FIRST]: first, [REST]: rest });
export const first = p => p[FIRST];
export const rest = p => p[REST];

export const unsweeten = x => {
  if (x === WILD) return Var();
  else if (Array.isArray(x)) return unsweetenArray(x);
  else if (isComp(x)) return unsweetenComp(x);
  else return x;
};

const unsweetenArray = xs =>
  xs.length === 0
  ? NIL
  : cons(unsweeten(xs[0]), unsweetenArray(xs.slice(1)));

const unsweetenComp = x => {
  const x1 = Object.create(Object.getPrototypeOf(x));
  for (let k of keysIn(x)) {
    x1[k] = unsweeten(x[k]);
  }
  return x1;
};

export const sweeten = x => {
  if (x === NIL) return [];
  else if (isPair(x)) return sweetenPair(x);
  else if (isComp(x)) return sweetenComp(x);
  else return x;
};

const isPair = x => x && typeof x === 'object' && FIRST in x && REST in x;

// Here we only re-sugar a cons-pair as a JavaScript array if it
// represents a proper list.
const sweetenPair = p => {
  const f = sweeten(first(p)), r = sweeten(rest(p));
  return Array.isArray(r) ? [f, ...r] : cons(f, r);
};

const sweetenComp = x => {
  const x1 = Object.create(Object.getPrototypeOf(x));
  for (let k of keysIn(x)) {
    x1[k] = sweeten(x[k]);
  }
  return x1;
};
