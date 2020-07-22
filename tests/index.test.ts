import {
  run,
  Rel,
  eq,
  succeedo,
  failo,
  conde,
  exist,
  cons,
  nilo,
  conso,
  firsto,
  resto,
} from '../lib/index';

// I've taken many of these tests straight from the text of "The
// Reasoned Schemer"; these I've named according to the chapter and
// frame in which they occur. For instance, a test that uses an
// expression from frame 34 of chapter 3 would be named 'TRS 3.34'.

describe('Smoke tests', () => {
  test('TRS 1.7', () => {
    const r = run()(q => failo);
    expect(r).toEqual([]);
  });

  test('TRS 1.10', () => {
    const r = run()(q => eq('pea', 'pod'));
    expect(r).toEqual([]);
  });

  test('TRS 1.11', () => {
    const r = run()(q => eq(q, 'pea'));
    expect(r).toEqual(['pea']);
  });

  test('TRS 1.12 (commutativity of `eq`)', () => {
    const r = run()(q => eq('pea', q));
    const s = run()(q => eq(q, 'pea'));
    expect(r).toEqual(s);
  });

  test('TRS 1.16', () => {
    const r = run()(q => succeedo);
    expect(r).toEqual(['_0']);
  });

  test('TRS 1.19', () => {
    const r = run()(q => eq('pea', 'pea'));
    expect(r).toEqual(['_0']);
  });

  test('TRS 1.20', () => {
    const r = run()(q => eq(q, q));
    expect(r).toEqual(['_0']);
  });

  test('TRS 1.21', () => {
    const r = run()(q => exist(x => eq('pea', q)));
    expect(r).toEqual(['pea']);
  });

  test('TRS 1.24', () => {
    const r = run()(q => exist(x => eq('pea', x)));
    expect(r).toEqual(['_0']);
  });

  test('TRS 1.25', () => {
    const r = run()(q => exist(x => eq([x], q)));
    expect(r).toEqual([['_0']]);
  });

  test('TRS 1.30', () => {
    const r = run()(q => exist(x => eq(x, q)));
    expect(r).toEqual(['_0']);
  });

  test('TRS 1.33', () => {
    const r = run()(q => eq([[['pea']], 'pod'], [[['pea']], q]));
    expect(r).toEqual(['pod']);
  });

  test('TRS 1.35', () => {
    const r = run()(q => exist(x => eq([[[q]], 'pod'], [[[x]], 'pod'])));
    expect(r).toEqual(['_0']);
  });

  test('TRS 1.36', () => {
    const r = run()(q => exist(x => eq([[[q]], x], [[[x]], 'pod'])));
    expect(r).toEqual(['pod']);
  });

  test('TRS 1.37', () => {
    const r = run()(q => exist(x => eq([x, x], q)));
    expect(r).toEqual([['_0', '_0']]);
  });

  test('TRS 1.38', () => {
    const r = run()(q => exist(x => exist(y => eq([q, y], [[x, y], x]))));
    expect(r).toEqual([['_0', '_0']]);
  });

  test('TRS 1.41', () => {
    const r = run()(q => exist(x => exist(y => eq([x, y], q))));
    expect(r).toEqual([['_0', '_1']]);
  });

  test('TRS 1.43', () => {
    const r = run()(q => exist(x => exist(y => eq([x, y, x], q))));
    expect(r).toEqual([['_0', '_1', '_0']]);
  });

  test('occurs check', () => {
    const r = run()(q => eq([q], q));
    expect(r).toEqual([]);
  });

  test('TRS 1.83 (ish: using conde instead of disj2)', () => {
    const teacupo = Rel(t => conde(eq('tea', t), eq('cup', t)));
    const r = run()(x => teacupo(x));
    expect(r).toEqual(['tea', 'cup']);
  });

  test('TRS 2.8', () => {
    const r = run()(r =>
      exist((x, y) => [
        firsto(['grape', 'raisin', 'pear'], x),
        firsto([['a'], ['b'], ['c']], y),
        eq(cons(x, y), r),
      ])
    );
    expect(r).toEqual([['grape', 'a']]);
  });

  test('TRS 2.12', () => {
    const r = run()(r =>
      exist(v => [
        resto(['a', 'c', 'o', 'r', 'n'], v),
        exist(w => [resto(v, w), firsto(w, r)]),
      ])
    );
    expect(r).toEqual(['o']);
  });

  test('TRS 2.23', () => {
    const r = run()(l =>
      exist(x => [eq(['d', 'a', x, 'c'], l), conso(x, ['a', x, 'c'], l)])
    );
    expect(r).toEqual([['d', 'a', 'd', 'c']]);
  });

  test('TRS 2.27', () => {
    const r = run()(l =>
      exist((d, t, x, y, w) => [
        conso(w, ['n', 'u', 's'], t),
        resto(l, t),
        firsto(l, x),
        eq('b', x),
        resto(l, d),
        firsto(d, y),
        eq('o', y),
      ])
    );
    expect(r).toEqual([['b', 'o', 'n', 'u', 's']]);
  });

  test('TRS 2.30', () => {
    const r = run()(q => nilo(['grape', 'raisin', 'pear']));
    expect(r).toEqual([]);
  });

  test('TRS 2.31', () => {
    const r = run()(q => nilo([]));
    expect(r).toEqual(['_0']);
  });

  test('TRS 2.47', () => {
    const pairo = Rel(p => exist((a, d) => conso(a, d, p)));
    const r = run()(x => pairo(x));
    expect(r).toEqual([cons('_0', '_1')]);
  });

  const listo = Rel(l =>
    conde(
      nilo(l),
      exist(d => [resto(l, d), listo(d)])
    )
  );

  test('TRS 3.14', () => {
    const r = run(1)(x => listo(cons('a', cons('b', cons('c', x)))));
    expect(r).toEqual([[]]);
  });

  test('TRS 3.18', () => {
    const r = run(5)(x => listo(cons('a', cons('b', cons('c', x)))));
    expect(r).toEqual([
      [],
      ['_0'],
      ['_0', '_1'],
      ['_0', '_1', '_2'],
      ['_0', '_1', '_2', '_3'],
    ]);
  });

  const lolo = Rel(l =>
    conde(
      nilo(l),
      exist(a => [firsto(l, a), listo(a), exist(d => [resto(l, d), lolo(d)])])
    )
  );

  test('TRS 3.29', () => {
    const r = run(5)(x => lolo(cons(['a', 'b'], cons(['c', 'd'], x))));
    expect(r).toEqual([[], [[]], [['_0']], [[], []], [['_0', '_1']]]);
  });

  const singletono = Rel(l => exist(a => eq([a], l)));

  const loso = Rel(l =>
    conde(
      nilo(l),
      exist(a => [
        firsto(l, a),
        singletono(a),
        exist(d => [resto(l, d), loso(d)]),
      ])
    )
  );

  test('TRS 3.38', () => {
    const r = run(5)(z => loso(cons(['g'], z)));
    expect(r).toEqual([
      [],
      [['_0']],
      [['_0'], ['_1']],
      [['_0'], ['_1'], ['_2']],
      [['_0'], ['_1'], ['_2'], ['_3']],
    ]);
  });

  const membero = Rel((x, l) =>
    conde(
      firsto(l, x),
      exist(d => [resto(l, d), membero(x, d)])
    )
  );

  test('TRS 3.48', () => {
    const r = run()(q => membero('olive', ['virgin', 'olive', 'oil']));
    expect(r).toEqual(['_0']);
  });

  test('TRS 3.49', () => {
    const r = run(1)(y => membero(y, ['hummus', 'with', 'pita']));
    expect(r).toEqual(['hummus']);
  });

  test('TRS 3.53', () => {
    const r = run()(y => membero(y, ['hummus', 'with', 'pita']));
    expect(r).toEqual(['hummus', 'with', 'pita']);
  });

  test('TRS 3.56', () => {
    const r = run()(x => membero('e', ['pasta', x, 'fagioli']));
    expect(r).toEqual(['e']);
  });

  test('TRS 3.63', () => {
    const r = run()(q =>
      exist((x, y) => [eq(['pasta', x, 'fagioli', y], q), membero('e', q)])
    );
    expect(r).toEqual([
      ['pasta', 'e', 'fagioli', '_0'],
      ['pasta', '_0', 'fagioli', 'e'],
    ]);
  });

  test('TRS 3.64', () => {
    const r = run(1)(l => membero('tofu', l));
    expect(r).toEqual([cons('tofu', '_0')]);
  });

  test('TRS 3.67', () => {
    const r = run(5)(l => membero('tofu', l));
    expect(r).toEqual([
      cons('tofu', '_0'),
      cons('_0', cons('tofu', '_1')),
      cons('_0', cons('_1', cons('tofu', '_2'))),
      cons('_0', cons('_1', cons('_2', cons('tofu', '_3')))),
      cons('_0', cons('_1', cons('_2', cons('_3', cons('tofu', '_4'))))),
    ]);
  });

  const properMembero = Rel((x, l) =>
    conde(
      [firsto(l, x), exist(d => [resto(l, d), listo(d)])],
      exist(d => [resto(l, d), properMembero(x, d)])
    )
  );

  test('TRS 3.74', () => {
    const r = run(12)(l => properMembero('tofu', l));
    expect(r).toEqual([
      ['tofu'],
      ['tofu', '_0'],
      ['tofu', '_0', '_1'],
      ['_0', 'tofu'],
      ['tofu', '_0', '_1', '_2'],
      ['tofu', '_0', '_1', '_2', '_3'],
      ['_0', 'tofu', '_1'],
      ['tofu', '_0', '_1', '_2', '_3', '_4'],
      ['tofu', '_0', '_1', '_2', '_3', '_4', '_5'],
      ['_0', 'tofu', '_1', '_2'],
      ['tofu', '_0', '_1', '_2', '_3', '_4', '_5', '_6'],
      ['_0', '_1', 'tofu'],
    ]);
  });

  const appendo = Rel((l, t, out) =>
    conde(
      [nilo(l), eq(t, out)],
      exist((a, d, res) => [
        conso(a, d, l),
        appendo(d, t, res),
        conso(a, res, out),
      ])
    )
  );

  test('TRS 4.17', () => {
    const r = run(6)(x => exist((y, z) => appendo(x, y, z)));
    expect(r).toEqual([
      [],
      ['_0'],
      ['_0', '_1'],
      ['_0', '_1', '_2'],
      ['_0', '_1', '_2', '_3'],
      ['_0', '_1', '_2', '_3', '_4'],
    ]);
  });

  test('TRS 4.22', () => {
    const r = run()(x => appendo(['cake'], ['tastes', 'yummy'], x));
    expect(r).toEqual([['cake', 'tastes', 'yummy']]);
  });

  test('TRS 4.23', () => {
    const r = run()(x =>
      exist(y => appendo(['cake', '&', 'ice', y], ['tastes', 'yummy'], x))
    );
    expect(r).toEqual([['cake', '&', 'ice', '_0', 'tastes', 'yummy']]);
  });

  test('TRS 4.33', () => {
    const r = run(6)(x =>
      exist(y => appendo(x, y, ['cake', '&', 'ice', 'd', 't']))
    );
    expect(r).toEqual([
      [],
      ['cake'],
      ['cake', '&'],
      ['cake', '&', 'ice'],
      ['cake', '&', 'ice', 'd'],
      ['cake', '&', 'ice', 'd', 't'],
    ]);
  });

  test('TRS 4.37 (ish: associating q with [x, y])', () => {
    const r = run(6)(q =>
      exist((x, y) => [
        eq(q, [x, y]),
        appendo(x, y, ['cake', '&', 'ice', 'd', 't']),
      ])
    );
    expect(r).toEqual([
      [[], ['cake', '&', 'ice', 'd', 't']],
      [['cake'], ['&', 'ice', 'd', 't']],
      [
        ['cake', '&'],
        ['ice', 'd', 't'],
      ],
      [
        ['cake', '&', 'ice'],
        ['d', 't'],
      ],
      [['cake', '&', 'ice', 'd'], ['t']],
      [['cake', '&', 'ice', 'd', 't'], []],
    ]);
  });

  const unwrapo = Rel((x, out) =>
    conde(
      exist(a => [firsto(x, a), unwrapo(a, out)]),
      eq(x, out)
    )
  );

  test('TRS 4.48', () => {
    const r = run()(x => unwrapo([[['pizza']]], x));
    expect(r).toEqual([[[['pizza']]], [['pizza']], ['pizza'], 'pizza']);
  });

  const rembero = Rel((x, l, out) =>
    conde(
      [nilo(l), eq([], out)],
      conso(x, out, l),
      exist((a, d, res) => [
        conso(a, d, l),
        conso(a, res, out),
        rembero(x, d, res),
      ])
    )
  );

  test('TRS 5.26', () => {
    const r = run()(out => rembero('pea', ['pea'], out));
    expect(r).toEqual([[], ['pea']]);
  });

  test('TRS 5.27', () => {
    const r = run()(out => rembero('pea', ['pea', 'pea'], out));
    expect(r).toEqual([['pea'], ['pea'], ['pea', 'pea']]);
  });

  test('TRS 5.28', () => {
    const r = run()(out =>
      exist((y, z) => rembero(y, ['a', 'b', y, 'd', z, 'e'], out))
    );
    expect(r).toEqual([
      ['b', 'a', 'd', '_0', 'e'],
      ['a', 'b', 'd', '_0', 'e'],
      ['a', 'b', 'd', '_0', 'e'],
      ['a', 'b', 'd', '_0', 'e'],
      ['a', 'b', '_0', 'd', 'e'],
      ['a', 'b', 'e', 'd', '_0'],
      ['a', 'b', '_0', 'd', '_1', 'e'],
    ]);
  });

  const alwayso = Rel(() => conde(succeedo, alwayso()));

  test('TRS 6.2', () => {
    const r = run(1)(q => conde(succeedo, alwayso()));
    expect(r).toEqual(['_0']);
  });

  test('TRS 6.6', () => {
    const r = run(5)(q => alwayso());
    expect(r).toEqual(['_0', '_0', '_0', '_0', '_0']);
  });

  test('TRS 6.7', () => {
    const r = run(5)(q => [eq('onion', q), alwayso()]);
    expect(r).toEqual(['onion', 'onion', 'onion', 'onion', 'onion']);
  });

  const bitXoro = Rel((x, y, r) =>
    conde(
      [eq(0, x), eq(0, y), eq(0, r)],
      [eq(0, x), eq(1, y), eq(1, r)],
      [eq(1, x), eq(0, y), eq(1, r)],
      [eq(1, x), eq(1, y), eq(0, r)]
    )
  );

  test('TRS 7.6', () => {
    const r = run()(q => exist((x, y) => [eq(q, [x, y]), bitXoro(x, y, 0)]));
    expect(r).toEqual([
      [0, 0],
      [1, 1],
    ]);
  });

  test('TRS 7.8', () => {
    const r = run()(q => exist((x, y) => [eq(q, [x, y]), bitXoro(x, y, 1)]));
    expect(r).toEqual([
      [0, 1],
      [1, 0],
    ]);
  });

  const bitAndo = Rel((x, y, r) =>
    conde(
      [eq(0, x), eq(0, y), eq(0, r)],
      [eq(0, x), eq(1, y), eq(0, r)],
      [eq(1, x), eq(0, y), eq(0, r)],
      [eq(1, x), eq(1, y), eq(1, r)]
    )
  );

  const halfAddero = Rel((x, y, r, c) => [bitXoro(x, y, r), bitAndo(x, y, c)]);

  test('TRS 7.13 (ish: associating q with [x, y])', () => {
    const r = run()(q =>
      exist((x, y, r, c) => [eq(q, [x, y, r, c]), halfAddero(x, y, r, c)])
    );
    expect(r).toEqual([
      [0, 0, 0, 0],
      [0, 1, 1, 0],
      [1, 0, 1, 0],
      [1, 1, 0, 1],
    ]);
  });

  test('The second parameter of `run` represents a wildcard Var', () => {
    const r = run()((q, _) => eq(q, [_, _, _]));
    expect(r).toEqual([['_0', '_1', '_2']]);
  });

  test('We can solve the zebra puzzle', () => {
    const lefto = Rel((l, r, items) =>
      exist(d => [
        resto(items, d),
        conde([firsto(items, l), firsto(d, r)], lefto(l, r, d)),
      ])
    );

    const nexto = Rel((x, y, items) =>
      conde(lefto(x, y, items), lefto(y, x, items))
    );

    const membero = Rel((x, items) =>
      conde(
        firsto(items, x),
        exist(d => [resto(items, d), membero(x, d)])
      )
    );

    const r = run(1)((res, _) =>
      exist((houses, drinker, owner) => [
        eq(res, { drinker, owner }),
        // house schema:
        // [nationality, color, pet, drink, cigarette]
        eq(houses, [_, _, _, _, _]),
        membero(['englishman', 'red', _, _, _], houses),
        membero(['spaniard', _, 'dog', _, _], houses),
        membero([_, 'green', _, 'coffee', _], houses),
        membero(['ukrainian', _, _, 'tea', _], houses),
        lefto([_, 'ivory', _, _, _], [_, 'green', _, _, _], houses),
        membero([_, _, 'snails', _, 'winstons'], houses),
        membero([_, 'yellow', _, _, 'kools'], houses),
        eq(houses, [_, _, [_, _, _, 'milk', _], _, _]),
        eq(houses, [['norwegian', _, _, _, _], _, _, _, _]),
        nexto([_, _, _, _, 'chesterfields'], [_, _, 'fox', _, _], houses),
        nexto([_, _, _, _, 'kools'], [_, _, 'horse', _, _], houses),
        membero([_, _, _, 'orange juice', 'lucky strike'], houses),
        membero(['japanese', _, _, _, 'parliaments'], houses),
        nexto(['norwegian', _, _, _, _], [_, 'blue', _, _, _], houses),
        membero([owner, _, 'zebra', _, _], houses),
        membero([drinker, _, _, 'water', _], houses),
      ])
    );

    expect(r).toEqual([{ drinker: 'norwegian', owner: 'japanese' }]);
  });
});
