---
description: A runtime instance of a class, allocated on the heap and reached through a reference.
---

An object is a concrete instance of a [class](./Class.md), created at runtime and holding its own copy of the class's instance [fields](./Field.md).
Objects are allocated on the [heap](./Heap.md) and are never handled directly.
What a variable of a [reference type](./Reference%20type.md) holds is a [reference](./Reference.md) to the object, not the object itself.
When no reachable reference remains, the object becomes eligible for [garbage collection](./Garbage%20collection.md).

Because variables hold references, assignment copies the reference and both names then point at the same object.
Mutating through one name is visible through the other, which is the usual explanation for a value that "changed by itself".
A reference that points at nothing holds `null`, and calling a [method](./Method.md) on it produces a [NullPointerException](./NullPointerException.md).

Every object inherits from `java.lang.Object`, so it always has `toString`, `hashCode`, and `equals`.
The default `equals` compares identity, not contents, so two objects with the same field values are unequal until you override [equals and hashCode](./equals%20and%20hashCode.md) as a pair.
Objects are built by a [constructor](./Constructor.md) and can be made [immutable](./Immutability.md) by declaring all fields [final](./Final.md) and exposing no mutators.

_Usage:_

"I put two equal-looking objects in a set and got both back."

"HashSet uses hashCode and equals, and your object still uses the identity defaults, so it treats them as different objects."
