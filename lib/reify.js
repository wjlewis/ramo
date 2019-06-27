import { isComp, isVar, walk, walkAll, keysIn } from './common';

export const reify = (x, s) => {
  x = walkAll(x, s);
  return walkAll(x, reifyS(x, new Map()));
};

export const reifyS = (x, r) => {
  x = walk(x, r);
  if (isVar(x)) return reifyVar(x, r);
  else if (isComp(x)) return reifyComp(x, r);
  else return r;
};

const reifyVar = (v, r) => new Map(r).set(v, `_${r.size}`);

const reifyComp = (x, r) => keysIn(x).reduce((r, k) => reifyS(x[k], r), r);
