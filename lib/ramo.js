import * as $ from './streams';
import { reify } from './reify';
import { Var } from './common';
import { sweeten, WILD } from './sugar';
import { expand } from './goals';

export const run = (count=false) => goalF => {
  const q = Var();
  const subs = expand(goalF(q, WILD))(new Map());
  return $.take(count, subs).map(s => reify(q, s)).map(sweeten);
};

export const Rel = goalF => (...xs) => s => () => expand(goalF(...xs))(s);
