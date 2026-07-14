---
description: A collection of key-to-value associations where keys are unique, most commonly implemented by HashMap.
---

A `Map` associates unique keys with values.
It is part of the [collection framework](./Collection%20framework.md) but deliberately not a `Collection`, because its element is a pair rather than a single value.
The everyday implementation is `HashMap`, which buckets entries by hash code and offers constant-time `get` and `put` on average.
`LinkedHashMap` preserves insertion order, `TreeMap` keeps keys sorted, and `ConcurrentHashMap` is the one to reach for when several [threads](./Thread.md) share it.

A `HashMap` is only as correct as its keys.
Lookup first compares hash codes and then compares candidates with `equals`, so a key type must honour the [equals and hashCode](./equals%20and%20hashCode.md) contract.
This is why a [record](./Record.md) makes such a good key, and why key types should follow [immutability](./Immutability.md): mutate a key's fields after inserting it and the entry lands in the wrong bucket, so `get` will never find it again.

`get` returns `null` for a missing key, which is one of the classic sources of [NullPointerException](./NullPointerException.md); `getOrDefault`, `computeIfAbsent`, or wrapping the result in an [Optional](./Optional.md) are the safer moves.
`map.entrySet()` is what you iterate or feed into a [Stream](./Stream.md).

_Usage:_

"Why does `map.get(key)` return null when I am sure I put that key in?"

"Check the key's `hashCode`. If the key object was mutated after insertion, or the class overrides `equals` without `hashCode`, the map looks in the wrong bucket and the entry is effectively lost."
