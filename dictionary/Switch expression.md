---
description: A form of switch that produces a value, uses arrow labels with no fall-through, and must be exhaustive.
---

A switch expression is a `switch` that evaluates to a value and can therefore appear on the right-hand side of an assignment or as a return value.
It uses arrow labels, `case A -> result;`, which do not fall through, so no `break` is needed and the accidental fall-through bug of the old statement form cannot happen.
Where a case needs several lines, a block with `yield` supplies the value.

The important constraint is exhaustiveness.
Because the expression must produce a value on every path, the compiler requires that the cases cover every possible input, either through a `default` label or by covering all constants of an enum.
That check becomes powerful when combined with a [sealed class](./Sealed%20class.md): the compiler knows the complete set of permitted subtypes, so a switch over them with [pattern matching](./Pattern%20matching.md) needs no `default` at all, and adding a new subtype turns every non-exhaustive switch into a compile error rather than a runtime surprise.

```java
sealed interface Shape permits Circle, Square {}
double area(Shape s) {
    return switch (s) {
        case Circle c -> Math.PI * c.r() * c.r();
        case Square q -> q.side() * q.side();
    };
}
```

A `null` selector still throws a [NullPointerException](./NullPointerException.md) unless you write an explicit `case null`.

_Usage:_

"Why does my switch expression not compile without a default?"

"It has to be exhaustive - either add a default, or make the type a sealed hierarchy so the compiler can prove the cases are complete."
