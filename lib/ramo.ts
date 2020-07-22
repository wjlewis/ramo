import * as $ from './streams';
import { reify } from './reify';
import { Var, Term, Subst } from './common';
import { sweeten, WILD } from './sugar';
import { expand, Goal } from './goals';

// `run` produces a stream of solution substitutions by applying a goal
// function to a fresh variable (and a wildcard variable) and then
// applying the resulting goal to an empty substitution. It then reifies
// the fresh variable and "re-sugars" the resulting terms.
export function run(count: number | false = false): RunResult {
  return goalF => {
    const q = Var.new();
    const subs = expand(goalF(q, WILD))(new Map());
    return $.take(count, subs)
      .map(s => reify(q, s))
      .map(sweeten);
  };
}

type RunResult = (goalF: (q: Var, wild?: Symbol) => Goal | Goal[]) => Term[];

// `Rel` is used to define new relations. The goal that is produced
// generates suspended substitutions, which allows for recursive
// relations.
type Relation = (...vs: Var[]) => (s: Subst) => () => $.Stream<Subst>;

export function Rel(goalF: (...vs: Var[]) => Goal | Goal[]): Relation {
  return (...xs) => s => () => expand(goalF(...xs))(s);
}
