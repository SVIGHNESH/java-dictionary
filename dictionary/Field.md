---
description: A variable declared directly in a class, holding either per-object state or per-class state.
---

A field is a variable declared as a member of a [class](./Class.md).
An instance field exists once per [object](./Object.md) and lives on the [heap](./Heap.md) alongside it.
A [static](./Static.md) field exists once per class and is shared by every instance, which makes a mutable static field a common source of a [race condition](./Race%20condition.md) and, if it holds a growing [collection](./Collection%20framework.md), of a [memory leak](./Memory%20leak.md) that never releases what it accumulates.

Fields have default values before assignment: zero for a [primitive type](./Primitive%20type.md), `null` for a [reference type](./Reference%20type.md).
The `null` default is why a field you forgot to initialise fails later with a [NullPointerException](./NullPointerException.md) rather than at the declaration.

Fields are normally declared `private` and reached through [methods](./Method.md), which is the practical content of [encapsulation](./Encapsulation.md).
A field marked [final](./Final.md) must be assigned once, in the declaration or in every [constructor](./Constructor.md), and is the basis of [immutability](./Immutability.md).
A field shared across [threads](./Thread.md) without `final`, [volatile](./volatile.md), or [synchronized](./synchronized.md) access has no visibility guarantee.

_Usage:_

"My static cache field keeps growing until the process dies."

"A static field is never collected while the class is loaded, so anything you put in that map is retained for the life of the JVM."
