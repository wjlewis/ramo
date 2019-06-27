import { run, Rel } from './ramo';
import { succeedo, failo, eq, conde, exist } from './goals';
import { cons, first, rest } from './sugar';

const nilo = Rel(x => eq(x, []));
const conso = Rel((a, d, p) => eq(p, cons(a, d)));
const firsto = Rel((p, a) => exist(d => conso(a, d, p)));
const resto = Rel((p, d) => exist(a => conso(a, d, p)));

export {
  run, Rel,
  succeedo, failo, eq, conde, exist,
  cons, first, rest,
  nilo, conso, firsto, resto
};
