// Streams are at the heart of miniKanren (and thus ramo as well). These
// functions define the equivalent of Oleg Kiselyov's nondeterminism
// monad to represent streams of substitutions.

export type Stream<A> = EmptyStream | CompoundStream<A> | SuspendedStream<A>;

export type EmptyStream = null;

export interface CompoundStream<A> {
  head: A;
  tail: Stream<A>;
}

export type SuspendedStream<A> = () => Stream<A>;

export const empty: EmptyStream = null;

export function cons<A>(head: A, tail: Stream<A>): Stream<A> {
  return { head, tail };
}

export function unit<A>(v: A): Stream<A> {
  return cons(v, empty);
}

export function concat<A>(s1: Stream<A>, s2: Stream<A>): Stream<A> {
  if (s1 === empty) return s2;
  else if (typeof s1 === 'function') return () => concat(s2, s1());
  else return cons(s1.head, concat(s1.tail, s2));
}

export function chain<A>(f: (v: A) => Stream<A>, s: Stream<A>): Stream<A> {
  if (s === empty) return empty;
  else if (typeof s === 'function') return () => chain(f, s());
  else return concat(f(s.head), chain(f, s.tail));
}

// `take` can easily be defined recursively, but we define it
// iteratively instead in order to eliminate tail calls in recursive
// relations. That is, `take` acts like a trampoline.
export function take<A>(n: number | false, s: Stream<A>): A[] {
  const result = [];
  while (n !== 0 && s !== empty) {
    if (typeof s === 'function') s = s();
    else {
      result.push(s.head);
      s = s.tail;
      if (n !== false) --n;
    }
  }
  return result;
}
