---
description: The ability for one reference type to refer to objects of several classes, with calls dispatched to the actual runtime type.
---

Polymorphism means a variable of one [reference type](./Reference%20type.md) can hold [objects](./Object.md) of several different [classes](./Class.md), and a [method](./Method.md) call on it is dispatched to the implementation belonging to the object's actual runtime type.
Java resolves instance method calls dynamically, so a `List` variable holding an `ArrayList` runs `ArrayList.add`.
This is what makes [method overriding](./Method%20overriding.md) useful, and it works through both [inheritance](./Inheritance.md) and an [interface](./Interface.md).

Two things are not polymorphism, despite constant confusion.
Overloading picks one of several same-named methods by parameter types at compile time, using the declared type rather than the runtime type.
[Static](./Static.md) methods are not overridden, they are hidden, and the call is bound to the declared type.

[Generics](./Generics.md) add a parametric form of the same idea, though [type erasure](./Type%20erasure.md) means the type argument is gone at runtime.

```java
Shape s = new Circle(2);
s.area();          // Circle.area, chosen at runtime
```

Overuse shows up as long chains of subclasses where a [switch expression](./Switch%20expression.md) over a [sealed class](./Sealed%20class.md) would read better.

_Usage:_

"Why is my overloaded print(Object) called instead of print(String)?"

"Because overload resolution uses the declared type, not the runtime one. Only overriding is polymorphic. Declare the variable as String, or dispatch explicitly."
