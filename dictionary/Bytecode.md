---
description: The compact instruction set that javac emits into .class files and the JVM executes.
---

Bytecode is the intermediate representation Java compiles to.
`javac` does not produce machine code for your CPU.
It produces a `.class` file per [class](./Class.md), containing a constant pool, [field](./Field.md) and [method](./Method.md) tables, and a stream of one-byte opcodes that the [JVM](./JVM.md) knows how to execute.

The instruction set is stack based rather than register based.
Operands are pushed onto an operand stack inside the current [stack frame](./Stack%20frame.md), an opcode consumes them, and the result is pushed back.
Opcodes are typed: `iadd` adds two ints, `dadd` adds two doubles, `invokevirtual` performs a virtual call and is how [method overriding](./Method%20overriding.md) is dispatched at runtime.

Bytecode is verified before it runs, so a malformed or hostile class file is rejected rather than crashing the process.
It is also where [type erasure](./Type%20erasure.md) becomes visible: [generics](./Generics.md) largely vanish, and you see `Object` and casts.

You can read it directly:

```shell
javac Account.java
javap -c Account
```

Because bytecode is a stable published format, it is also what agents, profilers, and mocking libraries rewrite at load time.

_Usage:_

"Where did my generic type parameter go at runtime?"

"Look at the bytecode with `javap -c`. Erasure means it compiled down to `Object` plus a checked cast."
