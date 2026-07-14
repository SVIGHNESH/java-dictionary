---
description: The `?` in a generic type, standing for an unknown type argument, optionally bounded with extends or super.
---

A wildcard is the `?` that appears where a [generics](./Generics.md) type argument would go, meaning "some type, but I am not saying which".
It exists because generic types are invariant: `List<String>` is not a `List<Object>`, even though `String` is an `Object`.
Wildcards restore the flexibility that invariance takes away.

`List<? extends Number>` is an upper-bounded wildcard: you can read `Number` out of it, but you cannot add anything except `null`, because the actual list might be a `List<Integer>`.
`List<? super Integer>` is lower-bounded: you can add `Integer`, but reads only give you [Object](./Object.md).
The mnemonic is PECS - producer extends, consumer super - and it is why `Collections.copy` and much of the [collection framework](./Collection%20framework.md) and [stream](./Stream.md) API is declared with wildcards.

The usual symptom of getting this wrong is a compile error like "cannot infer type argument" or a refusal to `add` to a `? extends` list.
Unbounded `List<?>` is the safe read-only form, and unlike a raw `List` it still gets checked, so it does not silently invite the heap pollution that raw types do.

_Usage:_

"Why can't I add to a `List<? extends Number>`?"

"Because the wildcard means the list could be a `List<Double>`, so the compiler has no way to know your `Integer` is welcome."
