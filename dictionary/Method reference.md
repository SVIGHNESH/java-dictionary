---
description: Shorthand syntax for a lambda whose whole body is a single call to an existing method.
---

A method reference is a `::` expression that names an existing [method](./Method.md) instead of writing a [lambda](./Lambda.md) that does nothing but call it.
`String::length` means the same thing as `s -> s.length()`, and like any lambda it evaluates to an instance of a [functional interface](./Functional%20interface.md), not to a function value.

There are four forms.
A static reference, `Integer::parseInt`, calls a [static](./Static.md) method.
A bound instance reference, `System.out::println`, fixes the receiver [object](./Object.md) at the point the reference is created.
An unbound instance reference, `String::toUpperCase`, leaves the receiver as the first parameter, so a one-argument lambda becomes a zero-argument call.
A [constructor](./Constructor.md) reference, `ArrayList::new`, allocates on the [heap](./Heap.md) each time it is invoked.

The bound form evaluates its receiver once, eagerly, which matters if the receiver could be null: the [NullPointerException](./NullPointerException.md) is thrown when the reference is built, not when it is used.

Method references read best in [Stream](./Stream.md) pipelines, where the intent is "apply this named operation" rather than "compute this expression".

_Usage:_

"Is `map(User::getName)` any faster than `map(u -> u.getName())`?"

"No, the method reference is just shorthand for the same lambda - pick it because it names the operation, not for speed."
