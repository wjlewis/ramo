import {
  empty,
  cons,
  unit,
  concat,
  chain,
  take,
} from '../lib/streams';

test('`concat(x, empty)` = x', () => {
  const s = cons(1, cons(2, empty));
  expect(concat(s, empty)).toEqual(s);
});

test('`concat(empty, x)` = x', () => {
  const s = cons('a', cons('b', empty));
  expect(concat(empty, s)).toEqual(s);
});

test('`concat`ing 2 simple streams produces a simple stream', () => {
  const s = cons(1, cons(2, empty));
  const t = cons(3, cons(4, cons(5, empty)));
  const r = cons(1, cons(2, cons(3, cons(4, cons(5, empty)))));
  expect(concat(s, t)).toEqual(r);
});

test('`concat`ing a suspended stream with another produces a suspended stream', () => {
  const s = () => cons(1, empty);
  const t = cons(2, empty);
  expect(concat(s, t)).toBeInstanceOf(Function);
});

test('`concat`ing suspended streams interleaves their elements', () => {
  const s = () => cons(1, () => cons(2, empty));
  const t = cons(3, () => cons(4, empty));
  expect(take(false, concat(s, t))).toEqual([3, 1, 4, 2]);
});

test('`chain(f, empty)` = empty', () => {
  const twice = x => cons(x, cons(x, empty));
  expect(chain(twice, empty)).toEqual(empty);
});

test('`chain`ing a simple stream mappends f over all its elements', () => {
  const s = cons(1, cons(2, empty));
  const selfAndSquare = x => cons(x, cons(x*x, empty));
  const r = cons(1, cons(1, cons(2, cons(4, empty))));
  expect(chain(selfAndSquare, s)).toEqual(r);
});

test('`chain`ing a suspended stream produces a suspended stream', () => {
  const s = () => cons(1, () => cons(2, empty));
  const id = x => unit(x);
  expect(chain(id, s)).toBeInstanceOf(Function);
});

test('`take(false, s)` produces an Array of all elements of s', () => {
  const s = cons(1, cons(2, cons(3, empty)));
  expect(take(false, s)).toEqual([1,2,3]);
});

test('`take` forces suspended computations', () => {
  const s = () => cons(1, cons(2, () => cons(3, () => empty)));
  expect(take(false, s)).toEqual([1,2,3]);
});

test('`take` only forces necessary computations', () => {
  const s = cons(1, () => { throw new Error('forced'); });
  expect(take.bind(null, 1, s)).not.toThrow();
});

test('`take` tolerates infinite streams', () => {
  const ones = cons(1, () => ones);
  expect(take(5, ones)).toEqual([1,1,1,1,1]);
});
