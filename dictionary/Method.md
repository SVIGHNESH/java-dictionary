---
description: A named block of code declared in a class, with parameters, a return type, and an optional body.
---

A method is a callable member of a [class](./Class.md) or [interface](./Interface.md).
It has a name, a parameter list, a return type, and a throws clause listing any [checked exceptions](./Checked%20exception.md) it can propagate.
An instance method runs against a particular [object](./Object.md), reachable inside the body as `this`; a [static](./Static.md) method belongs to the class and has no `this`.

Each call pushes a [stack frame](./Stack%20frame.md) holding the parameters and local variables, and pops it on return.
That frame chain is what a [stack trace](./Stack%20trace.md) prints, and unbounded recursion exhausts it as a `StackOverflowError`.

Arguments are passed by value.
For a [primitive type](./Primitive%20type.md) the value is the number itself; for a [reference type](./Reference%20type.md) the value is the [reference](./Reference.md), so a method can mutate the object it was handed but cannot make the caller's variable point somewhere else.

Overloading gives several methods the same name with different parameter types, resolved at compile time.
[Method overriding](./Method%20overriding.md) replaces a superclass method in a subclass and is resolved at runtime, which is the mechanism behind [polymorphism](./Polymorphism.md).
A method that is [final](./Final.md) cannot be overridden.

_Usage:_

"I reassigned the list parameter inside the method and the caller saw nothing."

"Java passes the reference by value, so reassigning the parameter only rebinds the local; call clear or add if you want the caller to see it."
