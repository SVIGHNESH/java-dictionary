---
description: Providing a new implementation in a subclass for an inherited instance method with the same signature.
---

Method overriding is a subclass supplying its own body for an instance [method](./Method.md) it inherited, using the same name and parameter types.
The [JVM](./JVM.md) dispatches the call on the object's runtime type, which is the mechanism behind [polymorphism](./Polymorphism.md).
An override may widen access and may narrow the return type covariantly, but it cannot reduce visibility or add new [checked exceptions](./Checked%20exception.md).

The persistent confusion is overriding versus overloading.
Changing the parameter types produces an overload, a separate method chosen at compile time, not an override.
Writing `equals(Employee other)` instead of `equals(Object other)` is the classic version of this bug, and it quietly breaks every [collection framework](./Collection%20framework.md) lookup that relies on [equals and hashCode](./equals%20and%20hashCode.md).
The `@Override` [annotation](./Annotation.md) exists to catch exactly this: it makes the compiler fail when nothing is actually being overridden.

```java
@Override
public boolean equals(Object o) { ... }   // signature must be Object
```

[Static](./Static.md) methods are hidden rather than overridden, and a [final](./Final.md) method cannot be overridden at all.
Overriding is only available through [inheritance](./Inheritance.md) or an [interface](./Interface.md), never through [composition](./Composition.md).

_Usage:_

"My custom equals never gets called from HashSet."

"You overloaded it. Your parameter is Employee, so it isn't the equals the collection calls. Add @Override and take an Object."
