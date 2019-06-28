# ramo

```javascript
run()(q => exist(terms => [
  appendo(['miniKanren'], ['for', 'JavaScript'], terms),
  membero(q, terms)
])).join(' ')

// => 'miniKanren for JavaScript'
```

## Install

```
$ npm i ramo
```

## Overview

`ramo` is a port of Friedman, Byrd, et al.'s `miniKanren` to JavaScript.
The canonical implementations of `miniKanren` are written in Scheme, and while Scheme and JavaScript share many features in common, they have plenty of differences as well.
I have tried to preserve the semantics, and&mdash;more importantly&mdash;the charm of `miniKanren` in a package that I hope will be enjoyed by (and perhaps useful to) JavaScript programmers.

## Tutorial

I'd like to spend the next few paragraphs demonstrating the most important features that `ramo` offers by analyzing a number of examples, culminating in [a solution to the famous *Zebra Puzzle*](#the-zebra-puzzle).

### Relations and Goals

`ramo` is a relational extension for JavaScript.
'Relational' because it deals with *relations* in contrast to functions.
Relations are similar to functions, but the notion of a relation makes no distinction between inputs and outputs.
In that way, relations are a generalization of functions.

A relation allows one to express the idea that some relationship holds between its arguments, *or could be made to hold between its arguments*.
When a relation is applied to arguments, it is known as a *goal*.
A goal represents a search to find a way to satisfy the relationship in question.
In general there may be no way to do this, there might be a single way, many ways, or an infinite number of ways.
Thus, executing a goal does not produce a single value, but a *set* of values, each of which represents a way to satify its underlying relation.

The most important `ramo` relation is `eq`, which allows one to express that two arguments are equivalent (in a special way).
When `eq` is applied to two arguments, it becomes a *goal* which can be *run* to produce solutions:

```javascript
const { run, eq } = require('ramo');

const g1 = eq(3, 3); // This is a goal that succeeds if 3 === 3
const results1 = run()(q => g1); // => ['_0'] (a single success)

const g2 = eq(3, 'three'); // This is a goal that succeeds if 3 === 'three'
const results2 = run()(q => g2); // => [] (no successes)
```

What is `q` in those previous examples?
And what does `'_0'` mean?
The answers to both of these questions are entwined with the special nature of `eq` as alluded to above.
In the examples above, `q` is a *logic variable*.
A logic variable is a special kind of variable that can become associated ("bound") with another value through a process known as *unification*.
The relation `eq` is special because it *unifies* its arguments:

```javascript
const results1 = run()(q => eq(q, 3)); // => [3]

const results2 = run()(q => eq(q, 'three')); // => ['three']

const results3 = run()(q => eq(q, { complex: 'val' })); // => [{ complex: 'val' }]
```

In the first example above, the goal `eq(q, 3)` can be satisfied if the logic variable `q` is bound to the value `3`.
Thus, when it is run, this goal produces a result set with a single value: `3`.
As the other examples show, a logic variable can be unified with a wide variety of JavaScript values.

What about the following example?

```javascript
const results = run()(q => eq(q, { contains: q })); // => []
```

Since the value `{ contains: q }` *contains* the logic variable `q`, there is no way that these two values can be made equivalent (in any non-pathological sense of the term).
This provision is known as the "occurs check", and with it in mind, we can now formulate the rules for unification (and thus `eq`):

  1. Two equal (`===`) primitive JavaScript values unify
  2. An unbound ("fresh") logic variable unifies with any JavaScript value (including another logic variable) in which it does not occur; furthermore, this variable becomes bound to the value in question
  3. Two JavaScript objects unify if they have the same keys, and each of the values associated with the same keys unify; as in (2), variables may be bound during this process
  4. All bound logic variables are first replaced by their associated values before the unification process

To further illustrate these principles, consider the following:

```javascript
const results = run()(q => eq({ includes: q }, { includes: { another: 'object' } }));
// => [{ another: 'object' }]
```

`eq` unifies `{ includes: q }` and `{ includes: { another: 'object' } }` by noting that if `q` is bound to `{ another: 'object' }`, the two values become equal.
Thus, unification may be seen as a process of "filling in holes" in an attempt to make two expressions equal; the "holes" in this case are logic variables.

We now have a single relation, `eq`, that allows us to produce goals, and we know how to introduce a single logic variable and execute a single goal using `run`.
We will now see some other relations, other ways to introduce logic variables, and ways to run multiple goals.

### Combining Goals

Given several goals, there are two main ways we might wish to combine them into a compound goal.
We might wish for our compound goal to succeed if *all* of the goals are satisfied (conjunction), or if *any* of the goals are satisfied (disjunction).

To form a conjunction of goals (*all*) in `ramo`, simple place the goals in an Array, like so:

```javascript
const results1 = run()(q => [
  eq(q, 'first'), // q must unify with 'first'
  eq(42, 42)      // AND 42 must unify with 42
]);
// => ['first']

const results2 = run()(q => [
  eq(q, 'first'), // q must unify with 'first'
  eq(q, 'second') // AND q must unify with 'second'
]);
// => []
```

In the second example, the first goal succeeds, binding `q` to `'first'`, and then the second goal is executed.
In order for it to succeed, `q` must be unified with `'second'`.
However, since `q` is already bound to `'first'`, this is impossible.

To form a disjunction of goals (*any*), we introduce a new function `conde`; simply call `conde` with the goals as arguments:

```javascript
const { run, eq, conde } = require('ramo');

const results1 = run()(q => conde(
  eq(q, 'first'), // q must unify with 'first'
  eq(q, 'second') // OR q must unify with 'second'
));
// => ['first', 'second']
```

In thise case, the compound goal succeeded in *two* ways, corresponding to the ways in which each constituent goal succeeds.

Lastly, we should note that conjuctions (`[...]`) and disjunctions (`conde(...)`) can be freely combined to form even more complex goals, as in:

```javascript
const results = run()(q => [
  conde(
    eq(q, 41),
    eq(q, 42),
    eq(q, 43)
  ),
  eq({ p: q }, { p: 42 })
]);
// => [42]
```

The first goal in the conjunction succeeds with the result set `[41, 42, 43]`, but only one of these solutions satisfies the second goal.
Thus, the lone solution is `42`.

### Introducing Fresh Variables

At the moment, we are aware of only a single way to introduce a logic variable: using `run`.
We can introduce any number of unbound ("fresh") logic variables using the function `exist`.
Here is an example:

```javascript
const { run, eq, exist } = require('ramo');

run()(q => exist((x, y) => [
  eq(x, 'one'),
  eq(y, false),
  eq(q, [x, y])
]));
// => [['one', false]]
```

The `exist` form is essential for constructing complex terms from simple ones.
The example above, though contrived, illustrates this point: `exist` introduces two fresh variables which are separately bound to `'one'` and `false`, respectively; finally, `q` is bound to the compound value `['one', false]`.

### More Relations

Aside from `eq`, `ramo` provides 2 additional primitive relations, along with 4 relations for working with lists below).
The primitive relations are `succeedo` and `failo`.
The first produces a goal that always succeeds, and the second a goal that always fails:

```javascript
const { run, succeedo, failo } = require('ramo');

const results1 = run()(q => [
  eq(q, 'satisfied'),
  succeedo
]);
// => ['satisfied']

const results2 = run()(q => [
  eq(q, 'unsatisfied'),
  failo
]);
// => []
```

The relations related to lists are `conso`, `firsto`, `resto`, and `nilo`.
The require a bit of an introduction.
`conso(a, d, l)` is a goal that succeeds if `l` is a list whose first element is `a` and the rest of whose elements are the list `d` (although this isn't the whole story; see [Lists](#lists)):

```javascript
const { run, conso } = require('ramo');

const results1 = run()(q => conso(q, [2,3], [1,2,3]));
// => [1]

const results2 = run()(q => conso(1, q, [1,2,3]));
// => [[2,3]]

const results3 = run()(q => conso(1, [2,3], q));
// => [[1,2,3]]
```

Hopefully the true versatility of relations is becoming clearer at this point.
The relations `firsto`, `resto`, and `nilo` are used similarly: `firsto(l, a)` succeeds if `a` is the first element of `l`, `resto(l, d)` succeeds if `d` is the rest of the elements of `l`, and `nilo(l)` succeeds if `l` is the empty list (`[]`):

```javascript
const { run, firsto, resto, nilo } = require('ramo');

const results1 = run()(q => firsto(['a', 'b', 'c'], q));
// => ['a']

const results2 = run()(q => resto(['a', 'b', 'c'], q));
// => [['b', 'c']]

const results3 = run()(q => nilo(q));
// => [[]]
```

### Defining Relations

Just as functions can be used to extend the "vocabulary" of JavaScript with new computations, so too can the vocabulary of `ramo` be extended with user-defined relations.
The `Rel` function constructs relations, and it is used like so:

```javascript
const { run, Rel, eq, conde } = require('ramo');

const eitherOro = Rel(q => conde(
  eq(q, 'either'),
  eq(q, 'or')
));

const results = run()(q => eitherOro(q));
// => ['either', 'or']
```

However, the real power of user-defined relations lies in the fact that they can be recursive:

```javascript
const { run, Rel, eq, conde, exist, firsto, resto } = require('ramo');

// membero(x, xs) <= x is a member of the list xs.
const membero = Rel((x, xs) => conde(
  firsto(xs, x),
  exist(rest => [
    resto(xs, rest),
    membero(x, rest)
  ])
));

const results1 = run()(q => membero(1, [1,2,3]));
// => ['_0']

const results2 = run()(q => membero(q, [1,2,3]));
// => [1,2,3]
```

As a final example of a user-defined relation, we will show a definition of `appendo` (a relational programming classic).
`appendo(xs, ys, zs)` is a goal that succeeds when the list `zs` is equal to the concatenation of the lists `xs` and `ys`:

```javascript
const { run, Rel, conde, exist, eq, conso, nilo } = require('ramo');

const appendo = Rel((xs, ys, zs) => conde(
  [nilo(xs), eq(ys, zs)],
  exist((a, d, res) => [
    conso(a, d, xs),
    conso(a, res, zs),
    appendo(d, ys, res)
  ])
));

// It can be used to append two lists:
const results1 = run()(zs => appendo([1,2,3], [4,5], zs));
// => [[1,2,3,4,5]]

// Or to generate one given the other two:
const results2 = run()(xs => appendo(xs, [4,5], [1,2,3,4,5]));
// => [[1,2,3]]

// Or to generate all possible pairs that append to a third:
const results3 = run()(q => exist((xs, ys) => [
  eq(q, [xs, ys]),
  appendo(xs, ys, [1,2,3])
]));
// => [[[], [1,2,3]],
//     [[1], [2,3]],
//     [[1,2], [3]],
//     [[1,2,3], []]]
```

### <a href="the-zebra-puzzle"></a>The Zebra Puzzle

Here is a classic AI puzzle (snarfed from Norvig's *PAIP*):

  1. There are five houses in a line, each with an owner, a pet, a cigarette, a drink, and a color.
  2. The Englishman lives in the red house.
  3. The Spaniard owns the dog.
  4. Coffee is drunk in the green house.
  5. The Ukrainian drinks tea.
  6. The green house is immediately to the right of the ivory house.
  7. The Winston smoker owns snails.
  8. Kools are smoked in the yellow house.
  9. Milk is drunk in the middle house.
  10. The Norwegian lives in the first house on the left.
  11. The man who smokes Chesterfields lives next to the man with the fox.
  12. Kools are smoked in the house next to the house with the horse.
  13. The Lucky Strike smoker drinks orange juice.
  14. The Japanese smokes Parliaments.
  15. The Norwegian lives next to the blue house.

The questions are: who drinks water and who owns the zebra?

We can express these conditions as a series of relations, and then run the appropriate goal to solve the puzzle.
Most statements have the form: "such-and-such goes with such-and-such", indicating some partial information about a house.
If we represent each house as a list with the scheme: `[owner, pet, cigarette, drink, color]`, then (2) asserts that `membero(['Englishman', ep, ec, ed, 'red'], houses)`, where `houses` is a logic variable representing the list of houses, and `ep`, `ec`, and `ed` represent the Englishman's pet, cigarette choice, and drink, respectively.
This solution will work, but it will require a large number of fresh variables (a la `exist((ep, ec, ed, sc, sp, ...) => ...)`).
Furthermore, we aren't going to actually use these variable to construct our solution.
Fortunately, `ramo` allows us to introduce a "wildcard" or "don't care" variable, typically written as `_` (see [Wildcard](#wildcard)).
Each occurrence of this variable is *distinct*; in this way it is reminiscent of Prolog's `_`.
Thus, we can restate the goal above as `membero(['Englishman', _, _, _, 'red'], houses)`.

Aside from `membero` it is clear that we need relations to express the relationships "next to" (11, 12, 15), and "immediately to the right of" (6). We define these, along with `membero` now:

```javascript
const { run, Rel, conde, exist, eq, firsto, resto, conso } = require('ramo');

// membero(x, xs) <= x is a member of the list xs.
const membero = Rel((x, xs) => conde(
  firsto(xs, x),
  exist(d => [
    resto(xs, d),
    membero(x, d)
  ])
));

// righto(r, l, xs) <= r is directly to the right of l in xs.
const righto = Rel((r, l, xs) => exist(d => [
  resto(xs, d),
  conde(
    [firsto(xs, l), firsto(d, r)],
    righto(r, l, d)
  )
]));

// nexto(x, y, xs) <= x is next to y in xs.
const nexto = Rel((x, y, xs) => conde(
  righto(x, y, xs),
  righto(y, x, xs)
));
```

We are now ready to express the statements as goals:

```javascript
// house scheme: [owner, pet, cigarette, drink, color]
const puzzleo = Rel((waterDrinker, zebraOwner, _) => exist(houses => [
  eq(houses, [_, _, _, _, _]),                                       // 1
  membero(['Englishman', _, _, _, 'red'], houses),                   // 2
  membero(['Spaniard', 'dog', _, _, _], houses),                     // 3
  membero([_, _, _, 'coffee', 'green'], houses),                     // 4
  membero(['Ukrainian', _, _, 'tea', _], houses),                    // 5
  righto([_, _, _, _, 'green'], [_, _, _, _, 'ivory'], houses),      // 6
  membero([_, 'snails', 'Winston', _, _], houses),                   // 7
  membero([_, _, 'Kools', _, 'yellow'], houses),                     // 8
  eq(houses, [_, _, [_, _, _, 'milk', _], _, _]),                    // 9
  eq(houses, [['Norwegian', _, _, _, _], _, _, _, _]),               // 10
  nexto([_, _, 'Chesterfields', _, _], [_, 'fox', _, _, _], houses), // 11
  nexto([_, _, 'Kools', _, _], [_, 'horse', _, _, _], houses),       // 12
  membero([_, _, 'Lucky Strike', 'Orange Juice', _], houses),        // 13
  membero(['Japanese', _, 'Parliaments', _, _], houses),             // 14
  nexto(['Norwegian', _, _, _, _], [_, _, _, _, 'blue'], houses),    // 15
  membero([waterDrinker, _, _, 'water', _], houses),                 // Q1
  membero([zebraOwner, 'zebra', _, _, _], houses)                    // Q2
]));
```

Lastly, we simply have to run this goal in the appropriate context.
We are only interested in a single solution to the goal (if it has one), and we can indicate this by calling `run` with an argument of `1`, as in `run(1)`.
In general, `run()(goal)` produces a solution set containing *all* solutions to `goal`, and `run(n)(goal)` produces no more than the first `n`.

```javascript
const answer = run(1)((q, _) => exist((waterDrinker, zebraOwner) => [
  eq(q, { waterDrinker, zebraOwner }),
  puzzleo(waterDrinker, zebraOwner, _)
]));
// => [{ waterDrinker: 'Norwegian', zebraOwner: 'Japanese' }]
```
To introduce the "wildcard" variable, we simply passed an anonymous function with 2 parameters to `run(1)` instead of 1; the second parameter represents the wildcard.

### Where to learn more

The best way to learn `miniKanren` is to work through Friedman, Byrd, et al.'s book "The Reasoned Schemer".
However, if you are unpracticed with the Scheme programming language, it will be worth your while to learn it first.
Scheme is a profoundly beautiful formalism and is worth comtemplating for its own sake.
To learn Scheme, I can highly recommend two resources: Abelson and Sussman's timeless classic "Structure and Interpretation of Computer Programs", and Friedman and Felleisen's "The Little Schemer".

Aside from "The Reasoned Schemer", Will Byrd's dissertation is full of insights into `miniKanren`, along with discussions and implementations of various additions.

Lastly, if you are interested in the logic programming paradigm in general, two additional resources come to mind.
The first is Sterling and Shapiro's "The Art of Prolog", and the second is Norvig's "Paradigms of Artificial Intelligence Programming".

## Additional Features

There is one feature of `ramo` that is not available in canonical `miniKanren`, and one quirk that is not present there as well.

### <a href="wildcard"></a>Wildcard

The feature is the quite useful "wildcard" variable, analagous to the underscore `_` in Prolog.
This variable represents a logic variable that you may wish to take part in a computation, but whose value does not concern you.
Each occurrence of the wildcard variable represents a *distinct* logic variable, and thus

```javascript
run()((q, _) => eq(q, [_, _, _, _]))

// => ['_0', '_1', '_2', '_3']
```

### <a href="lists"></a>Lists

If lists are the heart of Scheme, then object literals are the heart of JavaScript.
And so, as the canonical `miniKanren` implementations lean heavily on the list (well, the *cons-cell*), `ramo` is built atop the object.
There is one unfortunate consequence of this arrangement: it would be convenient to use JavaScript Arrays to represent lists, but there is no easy way to treat them in the usual inductive sense.
Objects are convenient because we can, in a sense, destructure them via unification; however, Arrays do not share this property.
For this reason, `ramo` "desugars" JavaScript Arrays into a *cons-cell* representation that is used internally.
During the reification process, these cons-cells are transformed back into Arrays if this is possible.
These cons-cells use private `Symbol`s as their keys, so there is no worry about having a non-Array value inadvertently treated as a list.
To allow you to generate these cons-cells yourself, `ramo` exports three functions: `cons`, `first`, and `rest`.
The function `cons` constructs a cons-cell, `first` extracts a cons-cell's *car*, and `rest` extracts the *cdr*.
Lastly, the empty Array (`[]`) represents the empty list.

## Looking Forward

At this stage, `ramo` still lacks several features of `miniKanren`, namely `conda`, `condu`, and `project`.
I believe these will be straightforward to add in.
I also hope to incorporate some features from constraint logic programming and nominal logic programming, as described in Byrd's thesis, although I anticipate these will take more time.

At the moment, this package is also weighed down by several inefficiencies, the tradeoffs of which are increased clarity in the source code.
Once I am confident in the state of affairs, I will look into improving this situation.
