// +------------------+
// | Public Interface |
// +------------------+
export const run = (count=false) => goalF => {
  const q = Var();
  const subs = expand(goalF(q, WILD))(new Map());
  return $take(count, subs).map(s => reify(q, s)).map(sweeten);
};

export const Rel = goalF => (...xs) =>
  s => () => expand(goalF(...xs))(s);

export const nilo = Rel(x => eq(x, NIL));
export const conso = Rel((a, d, p) => eq(p, cons(a, d)));
export const firsto = Rel((p, a) => exist(d => conso(a, d, p)));
export const resto = Rel((p, d) => exist(a => conso(a, d, p)));

// +-------+
// | Terms |
// +-------+
const VAR = Symbol('ramo.VAR');

// Each call to `Var` creates a unique object that is distinguishable
// as a variable due to the presence of the private `VAR` key. It is
// thus impossible for a user to generate variables except through the
// use of this function.
const Var = () => ({ [VAR]: true });
const isVar = x => x && typeof x === 'object' && VAR in x;

const isComp = x => x && typeof x === 'object' && !isVar(x);

// +---------------+
// | Substitutions |
// +---------------+
const walk = (x, s) => s.has(x) ? walk(s.get(x), s) : x;

const walkAll = (x, s) => {
  x = walk(x, s);
  if (isComp(x)) {
    const x1 = Object.create(Object.getPrototypeOf(x));
    for (let k of keysIn(x)) {
      x1[k] = walkAll(x[k], s);
    }
    return x1;
  }
  return x;
};

// +-------------+
// | Unification |
// +-------------+
const unify = (x, y, s) => {
  x = walk(x, s), y = walk(y, s);
  if (x === y) return s;
  else if (isVar(x) && isVar(y)) return extendS(x, y, s);
  else if (isVar(y)) return extendS(y, x, s);
  else if (isComp(x) && isComp(y)) return unifyComp(x, y, s);
  else return false;
};

const unifyComp = (x, y, s) =>
  keysIn(y).every(k => k in x)
  &&
  keysIn(x).reduce((s, k) => s && k in y && unify(x[k], y[k], s), s);

const extendS = (v, x, s) => !occursIn(v, x, s) && new Map(s).set(v, x);

const occursIn = (v, x, s) => {
  x = walk(x, s);
  if (v === k) return true;
  else if (isComp(x)) return keysIn(x).some(k => occursIn(v, x[k], s));
  else return false;
};

// +-------+
// | Goals |
// +-------+
const succeedo = s => $unit(s);
const failo = _ => $empty;

const eq = (a, b) => s => {
  s = unify(unsweeten(a), unsweeten(b));
  return s ? $unit(s) : $empty;
};

const conde = (...gs) => disj(gs.map(expand));

const exist = goalF => {
  const vars = iota(goalF.length).map(Var);
  return expand(goalF(...vars));
};

const disj = gs => gs.reduce(disj2, failo);
const disj2 = (g1, g2) => s => $concat(g1(s), g2(s));

const conj = gs => gs.reduce(conj2, succeedo);
const conj2 = (g1, g2) => s => $chain(g2, g1(s));

const expand = body => conj(toArray(body));

// +-------------+
// | Reification |
// +-------------+
const reify = (x, s) => {
  x = walkAll(x, s);
  return walkAll(x, reifySub(x, new Map()));
};

const reifySub = (x, r) => {
  x = walk(x, r);
  if (isVar(x)) return reifyVar(x, r);
  else if (isComp(x)) return reifyComp(x, r);
  else return r;
};

const reifyVar = (v, r) => new Map(r).set(v, `_${r.size}`);

const reifyComp = (x, r) =>
  keysIn(x).reduce((r, k) => reifySub(x[k], r), r);

// +---------+
// | Streams |
// +---------+
const $empty = null;
const $cons = (head, tail) => ({ head, tail });
const $unit = v => cons(v, $empty);

const $concat = (s1, s2) => {
  if (s1 === $empty) return s2;
  else if (typeof s1 === 'function') return () => $concat(s2, s1());
  else return $cons(s1.head, $concat(s1.tail, s2));
};

const $chain = (f, s) => {
  if (s === $empty) return $empty;
  else if (typeof s === 'function') return () => $chain(f, s());
  else return $concat(f(s.head), $chain(f, s.tail));
};

const $take = (n, s) => {
  const result = [];
  while (n !== 0 && s !== $empty) {
    if (typeof s === 'function') s = s();
    else {
      result.push(s.head);
      s = s.tail;
      if (n !== false) --n;
    }
  }
  return result;
};

// +-------+
// | Sugar |
// +-------+
const NIL = Symbol('ramo.NIL');
const FIRST = Symbol('ramo.FIRST');
const REST = Symbol('ramo.REST');
const WILD = Symbol('ramo.WILD');

export const nil = NIL;
export const cons = (first, rest) => ({ [FIRST]: first, [REST]: rest });
export const first = p => p[FIRST];
export const rest = p => p[REST];

const unsweeten = x => {
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

const sweeten = x => {
  if (x === NIL) return [];
  else if (isPair(x)) return sweetenPair(x);
  else if (isComp(x)) return sweetenComp(x);
  else return x;
};

const isPair = x => x && typeof x === 'object' && FIRST in x && REST in x;

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

// +-----------------------+
// | General-purpose Tools |
// +-----------------------+
const keysIn = x =>
  [...Object.keys(x), ...Object.getOwnPropertySymbols(x)];

const iota = n => [...Array(n).keys()];

const toArray = x => Array.isArray(x) ? x : [x];
