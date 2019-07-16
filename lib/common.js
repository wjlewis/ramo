// There are 3 types of terms: atomic terms, compound terms, and
// variable terms. Compound terms are object literals whose keys are
// strings, numbers, or symbols and whose values are terms. Variables
// are quite special: we represent them using object literals with a
// private symbol key whose value is true (in this way, they can ONLY
// be constructed using the `Var` function below). Atomic terms
// include every other JavaScript value.
export const isComp = x => x && typeof x === 'object' && !isVar(x);

const VAR = Symbol('ramo.VAR');
export const Var = () => ({ [VAR]: true });
export const isVar = x => x && typeof x === 'object' && VAR in x;

// A "substitution" is a Map associating variables with terms. In
// order to find the term associated with a variable, we "walk" the
// variable in the substitution. The `walk` function is recursive:
// after looking up the term associated with a variable, we then walk
// *that* term, until we come to a term that is not associated in the
// substitution.
export const walk = (x, s) => s.has(x) ? walk(s.get(x), s) : x;

// `walkAll` behaves exactly like `walk`, except that it recursively
// walks variable terms found within compound terms. It is used
// exclusively in the reification process.
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

// We allow symbols to be used as keys in compound terms (in order to
// facilitate the desugaring process); this lets us easily collect all
// "normal" and symbol keys of an object.
export const keysIn = x =>
  [...Object.keys(x), ...Object.getOwnPropertySymbols(x)];

// `iota` constructs an array containing the numbers 0..n. We use it
// to generate arrays containing a certain number of elements.
export const iota = n => [...Array(n).keys()];

export const toArray = x => Array.isArray(x) ? x : [x];
