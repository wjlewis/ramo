import * as $ from './streams';
import { unify } from './unify';
import { unsweeten } from './sugar';
import { toArray, iota, Var } from './common';

// A "goal" is a function that takes a substitution and produces a
// stream of substitutions.
export const succeedo = s => $.unit(s);
export const failo = _ => $.empty;

// This is the most important goal constructor (a function that
// returns a goal). It attempts to unify its 2 argument terms in the
// context of the input substitution.
export const eq = (a, b) => s => {
  s = unify(unsweeten(a), unsweeten(b), s);
  return s ? $.unit(s) : $.empty;
};

// `conde` is a "higher-order" goal: it takes a number of goals and
// produces a goal from them. In particular, it produces a disjunction
// of conjunctions.
export const conde = (...gs) => disj(gs.map(expand));

// `exist` is used to introduce fresh variables. It takes a function
// that produces a goal, and produces this goal with each (JavaScript)
// variable replaced by a fresh (ramo) variable.
export const exist = goalF => {
  const vars = iota(goalF.length).map(Var);
  return expand(goalF(...vars));
};

// `disj` and `conj` are higher-order goals that produce the
// disjunction and conjunction of their goal arguments,
// respectively.
const disj = gs => gs.reduce(disj2, failo);
const disj2 = (g1, g2) => s => $.concat(g1(s), g2(s));

const conj = gs => gs.reduce(conj2, succeedo);
const conj2 = (g1, g2) => s => $.chain(g2, g1(s));

// We represent a conjunction using an array of goals. `expand`
// performs this transformation, and also accounts for the possibility
// of a single, un-bracketed goal.
export const expand = body => conj(toArray(body));
