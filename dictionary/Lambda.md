---
description: An anonymous block of code that Java compiles into an instance of a functional interface.
---

A lambda is a compact expression that produces an [object](./Object.md) implementing a [functional interface](./Functional%20interface.md), the single abstract [method](./Method.md) of that interface being the body you wrote.
The syntax `x -> x * 2` has no name, no [class](./Class.md) declaration, and no explicit type, but the compiler infers all three from the target type at the point of use.

Java does not have first-class functions.
A lambda is not a function value; it is an object with one method, and everywhere a lambda appears you could have written an anonymous class instead.
This matters because a lambda has no independent type: `Runnable r = () -> {};` compiles, `var r = () -> {};` does not, since [var](./var.md) has nothing to infer from.

A lambda may read local variables from its enclosing scope, but only if they are effectively [final](./Final.md), meaning never reassigned after initialisation.
The restriction exists because the lambda captures the variable's value by copying it, and its lifetime can outlive the [stack frame](./Stack%20frame.md) it came from.
[Fields](./Field.md) are not captured by value and so escape the rule.

Lambdas are the mechanism behind the [Stream](./Stream.md) API and [Optional](./Optional.md), and a [method reference](./Method%20reference.md) is shorthand for the common case.

_Usage:_

"Why won't the compiler let me increment a counter inside a lambda?"

"Because a lambda only captures effectively-final locals - use an AtomicInteger, or collect into a value with a stream."
