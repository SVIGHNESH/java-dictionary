---
description: The Java Development Kit - the compiler, tools, and standard library needed to build Java programs, not just run them.
---

The JDK is what you install to develop in Java.
It contains `javac` (the compiler that emits [bytecode](./Bytecode.md)), `java` (the launcher that starts a [JVM](./JVM.md)), the standard library, and diagnostic tools like `javap`, `jar`, `jshell`, `jstack`, and `jcmd`.

The recurring confusion is JDK versus JRE.
The JRE was a runtime-only distribution: a JVM and the class library, enough to run a program but with no compiler.
Since Java 9 there is no separately shipped JRE.
You install a JDK, and if you want a trimmed runtime for deployment you build one with `jlink` containing only the modules your application uses.

Typical build and run:

```shell
javac -d out src/Account.java
java -cp out Account
```

A JDK is versioned and has a release cadence: a feature release every six months, with occasional long-term-support versions (8, 11, 17, 21, 25) that most production systems track.
The version matters at two separate points.
The compiler decides which language features you may use, for example [records](./Record.md), [switch expressions](./Switch%20expression.md), [pattern matching](./Pattern%20matching.md), or [virtual threads](./Virtual%20thread.md).
The runtime decides which bytecode version it will accept, which is why running new class files on an old JVM produces `UnsupportedClassVersionError`.

_Usage:_

"UnsupportedClassVersionError: class file version 65.0."

"You compiled with JDK 21 and are running on an older JVM. Match the runtime, or compile with `--release` set to the version you deploy on."
