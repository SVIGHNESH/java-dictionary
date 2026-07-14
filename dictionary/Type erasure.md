---
description: The compiler's removal of generic type arguments, so generic types carry no type information at runtime.
---

Type erasure is how [generics](./Generics.md) are implemented.
The compiler checks type arguments, then discards them: `List<String>` becomes plain `List` in the [bytecode](./Bytecode.md), type variables are replaced by their bound (or `Object`), and the compiler inserts casts where needed.
This is why generics were addable to Java without changing the [JVM](./JVM.md) or breaking existing [classes](./Class.md).

The consequences are the things people trip on.
`List<String>` and `List<Integer>` have the same `getClass()`.
You cannot write `new T[]`, call `instanceof List<String>`, or overload two [methods](./Method.md) that differ only in type argument, because after erasure they are the same signature.
Bridge methods are generated silently to make [method overriding](./Method%20overriding.md) work across erased signatures.

Erasure also means unchecked casts are unchecked for real: nothing at runtime stops a `String` from landing in a `List<Integer>`, and the `ClassCastException` appears at the point of use rather than the point of the mistake.

```java
List<String> a = new ArrayList<>();
List<Integer> b = new ArrayList<>();
a.getClass() == b.getClass(); // true
```

_Usage:_

"Can I check whether this is a `List<String>` at runtime?"

"No, type erasure removed the type argument; all you can see is that it is a `List`."
