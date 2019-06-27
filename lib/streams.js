export const empty = null;

export const cons = (head, tail) => ({ head, tail });

export const unit = v => cons(v, empty);

export const concat = (s1, s2) => {
  if (s1 === empty) return s2;
  else if (typeof s1 === 'function') return () => concat(s2, s1());
  else return cons(s1.head, concat(s1.tail, s2));
};

export const chain = (f, s) => {
  if (s === empty) return empty;
  else if (typeof s === 'function') return () => chain(f, s());
  else return concat(f(s.head), chain(f, s.tail));
};

export const take = (n, s) => {
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
};
