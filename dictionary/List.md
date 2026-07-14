---
description: An ordered collection that allows duplicates and gives every element a positional index.
---

A `List` is an ordered collection in the [collection framework](./Collection%20framework.md) where each element has an integer index, duplicates are permitted, and insertion order is preserved unless you sort it.
It is an [interface](./Interface.md); the common implementations are `ArrayList`, backed by a resizable array, and `LinkedList`, backed by nodes.
`ArrayList` is the default choice: indexed access is constant time, and appending is amortised constant time.
`LinkedList` only pays off when you insert or remove at the ends of a large sequence.

Lists are generic, so `List<Order>` prevents you from putting a `String` in.
`List.of(...)` returns an immutable list, which fits the general preference for [immutability](./Immutability.md) and throws `UnsupportedOperationException` on `add`.

Searching with `contains` or `indexOf` calls `equals` on elements, so element types need a correct [equals and hashCode](./equals%20and%20hashCode.md), which a [record](./Record.md) gives you for free.
Iterating uses an [Iterator](./Iterator.md), and removing during a for-each raises [ConcurrentModificationException](./ConcurrentModificationException.md).
For bulk transformations, `list.stream()` opens a [Stream](./Stream.md) pipeline.

_Usage:_

"Should I use `ArrayList` or `LinkedList` for a queue of pending jobs?"

"Neither by reflex. If you only append and poll from the front, use `ArrayDeque`. If you genuinely need a list, `ArrayList` wins almost always; `LinkedList`'s pointer chasing costs more than the array copies it saves."
