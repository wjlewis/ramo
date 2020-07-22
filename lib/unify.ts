import { isComp, isVar, walk, keysIn } from './common';

// Unification is at the heart of miniKanren, ramo, and logic
// programming in general. Here we use Friedman and Byrd's quite elegant
// version (with the occurs check).
export const unify = (x, y, s) => {
  (x = walk(x, s)), (y = walk(y, s));
  if (x === y) return s;
  else if (isVar(x)) return extendS(x, y, s);
  else if (isVar(y)) return extendS(y, x, s);
  else if (isComp(x) && isComp(y)) return unifyComp(x, y, s);
  else return false;
};

const unifyComp = (x, y, s) =>
  keysIn(y).every(k => k in x) &&
  keysIn(x).reduce((s, k) => s && k in y && unify(x[k], y[k], s), s);

const extendS = (v, x, s) => !occursIn(v, x, s) && new Map(s).set(v, x);

const occursIn = (v, x, s) => {
  x = walk(x, s);
  if (v === x) return true;
  else if (isComp(x)) return keysIn(x).some(k => occursIn(v, x[k], s));
  else return false;
};
