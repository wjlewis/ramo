// Terms
export const isComp = x => x && typeof x === 'object' && !isVar(x);

const VAR = Symbol('ramo.VAR');
export const Var = () => ({ [VAR]: true });
export const isVar = x => x && typeof x === 'object' && VAR in x;

// Substitutions
export const walk = (x, s) => s.has(x) ? walk(s.get(x), s) : x;

export const walkAll = (x, s) => {
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

// Tools
export const keysIn = x =>
  [...Object.keys(x), ...Object.getOwnPropertySymbols(x)];

export const iota = n => [...Array(n).keys()];

export const toArray = x => Array.isArray(x) ? x : [x];
