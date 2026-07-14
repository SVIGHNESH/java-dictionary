---
description: A property of an object whose observable state cannot change after construction.
---

An immutable [object](./Object.md) is one whose state is fixed once its [constructor](./Constructor.md) returns.
`String`, `Integer`, and the boxed [primitive](./Primitive%20type.md) wrappers are immutable; so is a [record](./Record.md) whose components are themselves immutable.

Immutability is a property of the [class](./Class.md), not of a single modifier.
[Final](./Final.md) fields are necessary but not sufficient: a class with a `final Map` field is still mutable if it hands that map out or if the caller kept the map it passed in.
The recipe is to declare all [fields](./Field.md) final, allow no setters, defensively copy any mutable input on the way in and any mutable state on the way out, and prevent [inheritance](./Inheritance.md) so a subclass cannot add mutable state.
This is [encapsulation](./Encapsulation.md) taken to its natural end.

The payoff is concurrency.
An immutable object cannot be in a torn or half-updated state, so it can be shared across [threads](./Thread.md) with no [synchronized](./synchronized.md) block, no [volatile](./volatile.md), and no [race condition](./Race%20condition.md).
It is also safe as a [Map](./Map.md) key, because its [equals and hashCode](./equals%20and%20hashCode.md) cannot drift after insertion.
The cost is allocation: every "change" is a new object, and more [garbage collection](./Garbage%20collection.md) pressure.

_Usage:_

"Do I need to lock around this settings object if several threads read it?"

"Not if it is genuinely immutable - all fields final, no setters, and the internal list copied on construction. Then reads need no lock at all."
