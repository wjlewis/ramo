import * as $ from './streams';
import { unify } from './unify';
import { unsweeten } from './sugar';
import { toArray, iota, Var } from './common';

// Primitive Goals
export const succeedo = s => $.unit(s);
export const failo = _ => $.empty;

export const eq = (a, b) => s => {
  s = unify(unsweeten(a), unsweeten(b), s);
  return s ? $.unit(s) : $.empty;
};

// Goal Constructors
export const conde = (...gs) => disj(gs.map(expand));

export const exist = goalF => {
  const vars = iota(goalF.length).map(Var);
  return expand(goalF(...vars));
};

const disj = gs => gs.reduce(disj2, failo);
const disj2 = (g1, g2) => s => $.concat(g1(s), g2(s));

const conj = gs => gs.reduce(conj2, succeedo);
const conj2 = (g1, g2) => s => $.chain(g2, g1(s));

export const expand = body => conj(toArray(body));
