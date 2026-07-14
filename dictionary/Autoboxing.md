---
description: The compiler's automatic conversion between primitive types and their wrapper classes, in both directions.
---

Autoboxing is the automatic conversion the compiler inserts between a [primitive type](./Primitive%20type.md) and its wrapper [class](./Class.md) - `int` to `Integer`, `double` to `Double`, and so on.
The reverse direction, unboxing, is the same feature.
It exists mostly because [generics](./Generics.md) only accept [reference types](./Reference%20type.md), so a [collection framework](./Collection%20framework.md) type such as `List<Integer>` cannot hold raw `int` values.

The conversions are invisible in the source, which is where the trouble starts.
Unboxing a `null` wrapper throws a [NullPointerException](./NullPointerException.md) on a line with no visible method call - a `Map<String,Integer>` lookup that misses, assigned to an `int`, is the classic case.
`==` on two wrappers compares references, not values, and the small-value cache makes it accidentally work for `127` and fail for `128`, so use [equals and hashCode](./equals%20and%20hashCode.md) instead.
Boxing in a tight loop also allocates on the [heap](./Heap.md) and gives the [garbage collection](./Garbage%20collection.md) more to do, which is why [Stream](./Stream.md) offers `IntStream`.

```java
Map<String, Integer> counts = new HashMap<>();
int n = counts.get("missing"); // NullPointerException on unboxing
```

_Usage:_

"This line just throws NPE and there is nothing on it that could be null."

"There is: the `Integer` from the map is null and autoboxing is unboxing it into an `int`."
