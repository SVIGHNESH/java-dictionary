---
description: One of Java's eight built-in value types - boolean, byte, short, char, int, long, float, double.
---

A primitive type holds a value directly rather than a [reference](./Reference.md) to an [object](./Object.md).
There are eight: `boolean`, `byte`, `short`, `char`, `int`, `long`, `float`, and `double`.
A primitive local variable lives in the [stack frame](./Stack%20frame.md) of the [method](./Method.md) that declares it; a primitive [field](./Field.md) is stored inline in the owning object on the [heap](./Heap.md).
Primitives are never `null`, so they cannot cause a [NullPointerException](./NullPointerException.md) on their own, and they are not subject to [garbage collection](./Garbage%20collection.md).

Each primitive has a wrapper [class](./Class.md) - `int`/`Integer`, `double`/`Double`, and so on - and [autoboxing](./Autoboxing.md) converts between them implicitly.
That conversion is where primitives cause trouble.
[Generics](./Generics.md) cannot be parameterised on a primitive, so a `List<Integer>` boxes every element, and unboxing a `null` `Integer` back to an `int` throws a NullPointerException from a line with no visible dereference.
Comparing two boxed values with `==` compares references and starts failing above the cached range of -128 to 127.

```java
Integer a = 128, b = 128;
System.out.println(a == b);      // false
System.out.println(a.equals(b)); // true
```

Note that `char` is 16 bits and unsigned, and `float` and `double` are IEEE 754, so `0.1 + 0.2 != 0.3`.

_Usage:_

"My Integer comparison works in tests and fails in production."

"You are comparing boxed Integers with ==, which only looks right below 128 because of the cache; use equals or int."
