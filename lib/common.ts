// There are 3 types of terms: atomic terms, compound terms, and
// variable terms. Compound terms are object literals whose keys are
// strings, numbers, or symbols and whose values are terms.
export type Term = AtomicTerm | CompoundTerm | Var;

export type AtomicTerm = null | undefined | boolean | number | string | object;

export type CompoundTerm = { [key: string]: Term };

export class Var {
  static new(): Var {
    return new Var();
  }
}

export function isComp(x: Term): boolean {
  return x && typeof x === 'object' && !isVar(x);
}

export function isVar(x: any): boolean {
  return x instanceof Var;
}

// A "substitution" is a Map associating variables with terms. In order
// to find the term associated with a variable, we "walk" the variable
// in the substitution. The `walk` function is recursive: after looking
// up the term associated with a variable, we then walk *that* term,
// until we come to a term that is not associated in the substitution.
export type Subst = Map<Var, Term>;

export function walk(x: Var, s: Subst): Term {
  if (s.has(x)) return walk(s.get(x), s);
  else return x;
}

// `walkAll` behaves exactly like `walk`, except that it recursively
// walks variable terms found within compound terms. It is used
// exclusively in the reification process.
export function walkAll(x: Term, s: Subst): Term {
  x = walk(x, s);
  if (isComp(x)) {
    const x1 = Object.create(Object.getPrototypeOf(x));
    for (let k of keysIn(x as CompoundTerm)) {
      x1[k] = walkAll(x[k], s);
    }
    return x1;
  } else {
    return x;
  }
}

// We allow symbols to be used as keys in compound terms (in order to
// facilitate the desugaring process); this lets us easily collect all
// "normal" and symbol keys of an object.
export function keysIn(x: CompoundTerm): string[] {
  return [
    ...Object.keys(x),
    // Type Hack
    ...((Object.getOwnPropertySymbols(x) as any) as string[]),
  ];
}

// `iota` constructs an array containing the numbers 0..n. We use it to
// generate arrays containing a certain number of elements.
export function iota(n: number): number[] {
  let res = [];
  for (let i = 0; i < n; i++) res.push(i);
  return res;
}

// Todo: Check polyfill for `Array.isArray`
export function toArray<A>(x: A | A[]): A[] {
  if (Array.isArray(x)) return x;
  else return [x];
}
