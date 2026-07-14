---
description: Metadata attached to code, read by the compiler or at runtime by reflection, without changing behaviour by itself.
---

An annotation is a marker written as `@Name` on a declaration - a [class](./Class.md), [method](./Method.md), [field](./Field.md), parameter, or type use - that carries metadata rather than executable code.
On its own it does nothing.
Something else has to read it: the compiler, an annotation processor at build time, or a framework at runtime through reflection.

The retention policy decides which of those is possible.
`SOURCE` annotations are discarded after compilation, `CLASS` ones are stored in the [bytecode](./Bytecode.md) but not loaded, and `RUNTIME` ones survive into the [JVM](./JVM.md) where reflection can find them - this is how Spring finds `@Component` and JUnit finds `@Test`.

The one every Java developer meets first is `@Override`.
It changes nothing at runtime, but it makes the compiler verify that the method really does override a supertype method, so a typo in the name or a mismatched parameter list becomes a compile error instead of a silently unused method.
Without it, broken [method overriding](./Method%20overriding.md) fails quietly.

`@FunctionalInterface` works the same way, guarding the one-abstract-method property of a [functional interface](./Functional%20interface.md), and `@SafeVarargs` documents a [generics](./Generics.md) claim the compiler cannot check because of [type erasure](./Type%20erasure.md).

_Usage:_

"Is @Override actually necessary, or is it just noise?"

"It is an annotation the compiler checks - leave it off and a renamed superclass method turns your override into a dead method with no warning."
