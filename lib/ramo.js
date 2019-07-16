import * as $ from './streams';
import { reify } from './reify';
import { Var } from './common';
import { sweeten, WILD } from './sugar';
import { expand } from './goals';

// `run` produces a stream of solution substitutions by applying a
// goal function to a fresh variable (and a wildcard variable) and
// then applying the resulting goal to an empty substitution. It then
// reifies the fresh variable and "re-sugars" the resulting terms.
export const run = (count=false) => goalF => {
  const q = Var();
  const subs = expand(goalF(q, WILD))(new Map());
  return $.take(count, subs).map(s => reify(q, s)).map(sweeten);
};

// `Rel` is used to define new relations. The goal that is produced
// generates suspended substitutions, which allows for recursive
// relations.
export const Rel = goalF => (...xs) => s => () => expand(goalF(...xs))(s);
