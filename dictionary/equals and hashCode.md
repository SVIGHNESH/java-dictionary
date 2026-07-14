---
description: "The paired contract that defines object equality: equal objects must return equal hash codes, and hash-based collections depend on it."
---

`equals` and `hashCode` are two [methods](./Method.md) on [Object](./Object.md) that must be [overridden](./Method%20overriding.md) together.
The contract is short: if `a.equals(b)` then `a.hashCode() == b.hashCode()`; equals must be reflexive, symmetric, transitive, and consistent; and unequal objects may share a hash code, though good hash functions spread them out.
By default `equals` is identity comparison, which is rarely what a value-like [class](./Class.md) wants.

Breaking the contract does not fail loudly, it fails silently.
Override `equals` and forget `hashCode` and two "equal" objects land in different buckets, so a [Map](./Map.md) lookup with an equal key returns `null` and a `HashSet` happily stores a duplicate.
The object is still in memory; it has simply become unreachable by key.

The same disappearance happens if a key is mutated after insertion, since its hash changes but its bucket does not.
That is the practical argument for [immutability](./Immutability.md) in key types.

A [record](./Record.md) generates both methods from its components, which is the cleanest way to get this right.
If you write them by hand, derive both from the same [fields](./Field.md), and keep them consistent with any `compareTo`.
[Lists](./List.md) rely on `equals` too, for `contains` and `remove`.

_Usage:_

"I added my `Point` to a `HashSet` and `contains` on an identical `Point` says false. Why?"

"Your `Point` overrides `equals` but not `hashCode`, so the set hashes the new object into a different bucket and never compares it. Make `Point` a record, or override both from the same fields."
