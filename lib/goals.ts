import * as $ from './streams';
import { unify } from './unify';
import { unsweeten } from './sugar';
import { toArray, iota, Var, Subst, Term } from './common';

// A "goal" is a function that takes a substitution and produces a
// stream of substitutions.
export type Goal = (s: Subst) => $.Stream<Subst>;

export const succeedo: Goal = s => $.unit(s);

export const failo: Goal = _ => $.empty;

// This is the most important goal constructor (a function that returns
// a goal). It attempts to unify its 2 argument terms in the context of
// the input substitution.
export function eq(a: Term, b: Term): Goal {
  return s => {
    s = unify(unsweeten(a), unsweeten(b), s);
    return s ? $.unit(s) : $.empty;
  };
}

// `conde` is a "higher-order" goal: it takes a number of goals and
// produces a goal from them. In particular, it produces a disjunction
// of conjunctions.
export function conde(...gs: (Goal | Goal[])[]): Goal {
  return disj(gs.map(expand));
}

// `exist` is used to introduce fresh variables. It takes a function
// that produces a goal, and produces this goal with each (JavaScript)
// variable replaced by a fresh (ramo) variable.
export function exist(goalF: (...xs: Var[]) => Goal | Goal[]): Goal {
  const vars = iota(goalF.length).map(Var.new);
  return expand(goalF(...vars));
}

// `disj` and `conj` are higher-order goals that produce the disjunction
// and conjunction of their goal arguments, respectively.
function disj(gs: Goal[]): Goal {
  return gs.reduce(disj2, failo);
}

function disj2(g1: Goal, g2: Goal): Goal {
  return s => $.concat(g1(s), g2(s));
}

function conj(gs: Goal[]): Goal {
  return gs.reduce(conj2, succeedo);
}

function conj2(g1: Goal, g2: Goal): Goal {
  return s => $.chain(g2, g1(s));
}

// We represent a conjunction using an array of goals. `expand` performs
// this transformation, and also accounts for the possibility of a
// single, un-bracketed goal.
export function expand(body: Goal | Goal[]): Goal {
  return conj(toArray(body));
}
