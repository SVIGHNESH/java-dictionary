---
description: The interface that walks a collection one element at a time, via hasNext, next, and optionally remove.
---

An `Iterator` is the traversal abstraction of the [collection framework](./Collection%20framework.md).
It exposes `hasNext()`, `next()`, and an optional `remove()`, and it hides whether it is walking an array, a linked structure, or a hash table.
Any type that implements `Iterable` can supply one, which is exactly what the for-each loop requires: `for (String s : names)` is compiled into calls on an iterator obtained from `names`.

Most iterators are fail-fast.
They record the collection's modification count when created and check it on every `next()`.
If you add or remove elements through the collection itself while a loop is in progress, the counts diverge and the iterator throws [ConcurrentModificationException](./ConcurrentModificationException.md).
Removing from a [List](./List.md) inside a for-each is the standard way to hit this.
The fix is to remove through the iterator, or to use `removeIf`.

```java
Iterator<Order> it = orders.iterator();
while (it.hasNext()) {
    if (it.next().isCancelled()) it.remove();
}
```

Iterators are single-use and stateful, which is the same shape as a [Stream](./Stream.md) pipeline, though a stream adds laziness and composition on top.

_Usage:_

"My for-each over a list of orders blows up with ConcurrentModificationException. What did I do wrong?"

"You called `orders.remove(...)` inside the loop. The iterator behind the for-each notices the structural change and refuses to continue. Use `orders.removeIf(Order::isCancelled)`, or iterate explicitly and call `it.remove()`."
