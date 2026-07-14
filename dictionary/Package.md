---
description: A named namespace that groups related types and defines the default level of access between them.
---

A package is a namespace for types.
It is declared by the `package` statement at the top of a source file and it forms part of the fully qualified name of every [class](./Class.md), [interface](./Interface.md), and [record](./Record.md) inside it.
Package names are conventionally reverse domain names, lowercase, and they mirror the directory layout on disk, which is what lets a [classloader](./Classloader.md) find `com/example/Account.class` from the name `com.example.Account`.

Packages are also an access boundary.
A [field](./Field.md), [method](./Method.md), or [constructor](./Constructor.md) with no access modifier is package-private: visible to other types in the same package and nowhere else.
This is the coarsest tool Java gives you for [encapsulation](./Encapsulation.md) above the level of a single class.

Packages do not nest for access purposes.
`com.example.api` has no special visibility into `com.example.api.internal`; they are unrelated packages that merely share a prefix.
Two packages with the same name in different jars are the same package to the [JVM](./JVM.md), so a package-private member can be reached from another jar by a class that declares the matching package, a hole that split packages on the module path now close.

_Usage:_

"Why can't my subpackage see the package-private helper in its parent package?"

"Java packages are flat names, not a hierarchy; a.b.c gets no access to a.b, so either move the class or widen the modifier."
