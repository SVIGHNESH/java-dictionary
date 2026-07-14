---
description: The standard library of interfaces and classes for storing and manipulating groups of objects, rooted at Collection and Map.
---

The collection framework is the set of [interfaces](./Interface.md) and implementations in `java.util` that model groups of objects: `Collection`, `List`, `Set`, `Queue`, `Deque`, and the separate `Map` hierarchy.
The design is interface-first.
You program against [List](./List.md) or [Map](./Map.md), and pick an implementation such as `ArrayList`, `HashMap`, or `TreeSet` based on cost, ordering, and duplication rules.

Every collection is generic, so `List<String>` is checked at compile time and unchecked at runtime because of [type erasure](./Type%20erasure.md).
Collections hold [reference types](./Reference%20type.md) only, so [primitive types](./Primitive%20type.md) go through [autoboxing](./Autoboxing.md).

Two contracts hold the framework together.
Hash-based and sorted collections depend on [equals and hashCode](./equals%20and%20hashCode.md) being implemented correctly on the elements.
Traversal is defined by [Iterator](./Iterator.md), which is what a for-each loop uses and what throws [ConcurrentModificationException](./ConcurrentModificationException.md) when you structurally modify a collection while looping over it.

[Stream](./Stream.md) sits on top rather than inside: `collection.stream()` gives you a pipeline view, but a stream is not itself a collection.

_Usage:_

"Why does everyone write `List<String> names = new ArrayList<>()` instead of `ArrayList<String> names`?"

"Because the collection framework is interface-first. Declaring the variable as `List` means the rest of your code only depends on the contract, and you can swap in a `LinkedList` or an immutable list later without touching callers."
