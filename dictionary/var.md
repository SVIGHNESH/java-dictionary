---
description: A reserved type name, added in Java 10, that lets the compiler infer a local variable's type from its initialiser.
---

`var` declares a local variable whose type the compiler infers from the initialiser.
It is not dynamic typing and not an [object](./Object.md) type: the variable still has one [static](./Static.md), fixed type, decided at compile time and written into the [bytecode](./Bytecode.md) exactly as if you had spelled it out.
`var list = new ArrayList<String>()` gives you an `ArrayList<String>`, and nothing else may later be assigned to it.

It is deliberately limited.
`var` works for local variables, `for` loop variables and try-with-resources bindings; it cannot be used for a [field](./Field.md), a [method](./Method.md) parameter or a return type, and it needs an initialiser, so `var x = null` does not compile.

The usual complaint is readability: `var result = service.process(input)` hides what you got back.
The usual defence is that it removes duplicated noise, especially with long [generics](./Generics.md) types and [iterator](./Iterator.md) declarations.
Watch one trap - `var` infers the most specific type, so `var i = 0` is `int` and never widens on its own, and inferring from a diamond gives `ArrayList<Object>`.

_Usage:_

"Does `var` make Java dynamically typed?"

"No, the type is still fixed at compile time; `var` only saves you from writing it out."
