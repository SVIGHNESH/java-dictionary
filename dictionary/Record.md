---
description: A class declared with a fixed list of components, for which the compiler generates the constructor, accessors, equals, hashCode and toString.
---

A record is a restricted [class](./Class.md), added in Java 16, that declares its state up front as a list of components.
From `record Point(int x, int y) {}` the compiler generates a [constructor](./Constructor.md), an accessor [method](./Method.md) per component, and implementations of [equals and hashCode](./equals%20and%20hashCode.md) and `toString` derived from the components.
The [fields](./Field.md) are [final](./Final.md) and the class is implicitly final, so a record is shallowly [immutable](./Immutability.md) and cannot be extended.

Records model data, not behaviour.
They cannot declare instance fields beyond their components, so they cannot smuggle in hidden state, and that restriction is the point: what you see in the header is the whole value.
A compact constructor lets you validate or normalise arguments before the fields are assigned.

The immutability is only shallow.
A `record Order(List<Item> items)` still hands out the same mutable list, so defensively copy in the compact constructor if that matters.
Records also work as permitted subtypes of a [sealed class](./Sealed%20class.md), and deconstruction patterns make them the natural target of [pattern matching](./Pattern%20matching.md) in a [switch expression](./Switch%20expression.md).

_Usage:_

"Is a record automatically immutable?"

"Only shallowly; the fields are final, but a record holding a mutable list still exposes that list."
