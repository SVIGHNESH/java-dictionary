---
description: A named template that declares the fields and methods shared by the objects created from it.
---

A class is the unit of declaration in Java.
It groups state and behaviour under one name, and it is the thing an [object](./Object.md) is an instance of.
A class body holds [fields](./Field.md), [methods](./Method.md), [constructors](./Constructor.md), initialiser blocks, and nested types.

Every class lives in a [package](./Package.md), which is why the true identity of a class is its fully qualified name, not its simple name.
The compiler turns each class into a separate `.class` file of [bytecode](./Bytecode.md), which a [classloader](./Classloader.md) reads at runtime.
Two classes with the same fully qualified name loaded by different classloaders are different types to the [JVM](./JVM.md), which is the root of the `ClassCastException: Foo cannot be cast to Foo` message that looks impossible the first time you see it.

A class can extend one other class ([inheritance](./Inheritance.md)) and implement any number of [interfaces](./Interface.md).
It can be declared [abstract](./Abstract%20class.md) so it cannot be instantiated, [final](./Final.md) so it cannot be extended, or [sealed](./Sealed%20class.md) so only listed types may extend it.
A [record](./Record.md) is a restricted class form for plain data carriers.

```java
public class Account {
    private final String id;
    Account(String id) { this.id = id; }
    public String id() { return id; }
}
```

_Usage:_

"Why does my cast fail when the class name in the error is the same on both sides?"

"That class was loaded by two different classloaders, so the JVM sees two distinct types with identical names."
