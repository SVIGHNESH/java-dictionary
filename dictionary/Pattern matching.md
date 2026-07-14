---
description: Testing a value against a shape and, if it matches, binding its parts to variables in one step.
---

Pattern matching combines a type test, a cast, and a variable binding into a single construct.
`if (o instanceof String s)` checks the type and, on success, binds `s` as a `String` in the scope where the test is known to have passed, removing the redundant cast that the older form required.

The same patterns work as labels in a [switch expression](./Switch%20expression.md), which is where they earn their keep.
A type pattern matches by [reference type](./Reference%20type.md); a record pattern goes further and destructures, so `case Point(int x, int y)` pulls the components of a [record](./Record.md) straight out of its accessors, and record patterns nest.
A `when` clause adds a guard: `case Circle c when c.r() > 10 -> ...`.

The payoff arrives with a [sealed class](./Sealed%20class.md).
Because the compiler knows the closed set of permitted subtypes, it can prove a switch over patterns is exhaustive and reject it if a case is missing.
Together, sealed types, records, patterns, and switch expressions give Java algebraic data types and the compiler-checked case analysis that goes with them.

This is [polymorphism](./Polymorphism.md) turned inside out: behaviour lives with the caller rather than in overridden methods, which suits data-shaped hierarchies you control.

_Usage:_

"How do I avoid the cast after an instanceof check?"

"Use pattern matching - `if (o instanceof Order ord)` binds `ord` directly, and the same pattern works as a switch case."
