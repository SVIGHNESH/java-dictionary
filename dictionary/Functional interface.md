---
description: An interface with exactly one abstract method, so it can be the target type of a lambda or method reference.
---

A functional interface is an [interface](./Interface.md) that declares exactly one abstract [method](./Method.md).
That single method is what gives a [lambda](./Lambda.md) or a [method reference](./Method%20reference.md) something to be: the compiler checks the lambda's parameters and return type against it, then produces an [object](./Object.md) of that interface type.

Default and static methods do not count against the total, so an interface can carry any number of them and still be functional.
The `@FunctionalInterface` [annotation](./Annotation.md) is optional; it does not create the property, it only asks the compiler to fail the build if the property is ever broken by a second abstract method.

The [JDK](./JDK.md) ships a standard set in `java.util.function`: `Function<T,R>`, `Predicate<T>`, `Supplier<T>`, `Consumer<T>`, `BiFunction`, and primitive-specialised variants such as `IntPredicate` that exist to avoid [autoboxing](./Autoboxing.md) in hot loops.
Older single-method types like `Runnable`, `Callable`, and `Comparator` are functional interfaces too, which is why they work with lambdas without any change.

Because these types are [generic](./Generics.md), the erased signature at runtime is `Object`-based; see [type erasure](./Type%20erasure.md).

_Usage:_

"Do I need to write my own interface to accept a lambda parameter?"

"Usually not - if it takes one argument and returns a value, `Function<T,R>` is already the functional interface you want."
