import { isComp, isVar, walk, walkAll, keysIn } from './common';

// To reify a term, we first generate a substitution that associates
// each fresh variable with a reified name (like "_0", "_1", etc.). We
// then walk the term in this substitution.
export const reify = (x, s) => {
  x = walkAll(x, s);
  return walkAll(x, reifyS(x, new Map()));
};

const reifyS = (x, r) => {
  x = walk(x, r);
  if (isVar(x)) return reifyVar(x, r);
  else if (isComp(x)) return reifyComp(x, r);
  else return r;
};

// As in "The Reasoned Schemer", we reify unassociated variables as an
// underscore followed by a number. The same number is used for each
// occurrence of a variable.
const reifyVar = (v, r) => new Map(r).set(v, `_${r.size}`);

const reifyComp = (x, r) => keysIn(x).reduce((r, k) => reifyS(x[k], r), r);
