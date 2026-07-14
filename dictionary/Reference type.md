---
description: A Java type whose values are references to objects, rather than the values themselves as with primitives.
---

A reference type is any type whose variables hold a [reference](./Reference.md) to an [object](./Object.md) on the [heap](./Heap.md), rather than holding the value directly.
Every [class](./Class.md), [interface](./Interface.md), [record](./Record.md), enum, annotation and array type is a reference type.
The only types that are not are the eight [primitive types](./Primitive%20type.md).

The distinction shows up constantly.
A reference type variable can be `null`, so it can produce a [NullPointerException](./NullPointerException.md) when dereferenced; an `int` cannot.
Assignment copies the reference, not the object, so two variables can name the same mutable object and see each other's changes.
Comparison with `==` tests reference identity, which is why value comparison needs [equals and hashCode](./equals%20and%20hashCode.md).

Only reference types participate in [inheritance](./Inheritance.md) and [polymorphism](./Polymorphism.md), and until value types arrive, only reference types can be used as [generics](./Generics.md) type arguments.
That last restriction is why [autoboxing](./Autoboxing.md) exists at all: `List<int>` does not compile, so the compiler wraps `int` in `Integer`.

_Usage:_

"Why does `List<int>` not compile?"

"Generic type arguments have to be reference types, so you need `List<Integer>` and let autoboxing do the wrapping."
