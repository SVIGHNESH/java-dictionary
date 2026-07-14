---
description: The unchecked exception thrown by fail-fast iterators when the underlying collection is structurally modified during iteration.
---

ConcurrentModificationException is the [unchecked exception](./Unchecked%20exception.md) thrown by the fail-fast [iterators](./Iterator.md) of the [collection framework](./Collection%20framework.md) when the backing collection is structurally modified while an iteration is in progress.
Structural modification means adding or removing elements; replacing the value at an existing index or [map](./Map.md) key does not count.

The name is misleading.
It is usually not about concurrency at all.
The overwhelmingly common cause is single-threaded: removing from a [list](./List.md) inside a for-each loop over that same list.
The for-each is compiled to an `Iterator`, the iterator compares a modification counter against the one it recorded at creation, and `list.remove(x)` bumps that counter behind its back.

```java
for (String s : names) {
    if (s.isBlank()) names.remove(s);  // throws
}
```

The fixes are `iterator.remove()`, `Collection.removeIf`, or building a new list with a [stream](./Stream.md) and `filter`.
Under actual multi-threading, the check is only best-effort - the counter is not [volatile](./volatile.md) - so this exception is a debugging aid, not a [race condition](./Race%20condition.md) guarantee.
Real shared mutation needs [synchronized](./synchronized.md) access or a concurrent collection.

_Usage:_

"How am I getting a ConcurrentModificationException? This code is single-threaded."

"It almost always is. You are removing from the list inside a for-each over it. Use `removeIf` instead."
