---
description: Java's mechanism for parameterising a class, interface or method by type, checked at compile time.
---

Generics let a [class](./Class.md), [interface](./Interface.md) or [method](./Method.md) take type parameters, so that `List<String>` and `List<Integer>` are distinct compile-time types backed by one declaration.
The [collection framework](./Collection%20framework.md) is the main consumer: `List<T>`, `Map<K,V>` and `Iterator<T>` all carry their element types, which removes the casts that pre-generic Java code was full of.

Generics are enforced entirely by the compiler.
At runtime the type arguments are removed by [type erasure](./Type%20erasure.md), so `List<String>` and `List<Integer>` are the same class, and you cannot ask an object what its type argument was.

The familiar failure mode is the unchecked warning.
Casting a raw `List` to `List<String>`, or passing a raw type into generic code, tells the compiler it can no longer guarantee anything, and the resulting heap pollution surfaces later as a `ClassCastException` in a line that contains no visible cast.
Bounds (`<T extends Comparable<T>>`) and [wildcards](./Wildcard.md) let you widen what a generic API accepts without giving up that checking.
Since Java 10 the diamond and [var](./var.md) both cut down on the repetition.

_Usage:_

"Why am I getting an unchecked warning on this cast to `List<String>`?"

"Because generics are erased, the cast is not actually verified at runtime; you are promising the compiler something it cannot check."
