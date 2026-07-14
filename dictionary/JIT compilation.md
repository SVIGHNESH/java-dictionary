---
description: The JVM's runtime translation of frequently executed bytecode into optimised native machine code.
---

JIT (just-in-time) compilation is how the [JVM](./JVM.md) reaches native speed without compiling everything ahead of time.

Execution starts in the interpreter, which walks [bytecode](./Bytecode.md) one opcode at a time.
That is slow, but it starts instantly.
Meanwhile the JVM counts how often each [method](./Method.md) is entered and how often each loop iterates.
When a counter crosses a threshold, the method is queued for compilation on a background [thread](./Thread.md), and later invocations run the native version.
HotSpot uses two compilers in tiers: C1 compiles quickly with modest optimisation, C2 compiles slowly with aggressive optimisation.

The advantage over an ahead-of-time compiler is that the JIT sees what actually happens.
If a call site has only ever seen one implementation of an [interface](./Interface.md), it can inline that target directly and skip virtual dispatch, guarded by a cheap type check.
If the check ever fails, the JVM deoptimises back to the interpreter and recompiles.
Escape analysis works the same way: if the compiler can prove an [object](./Object.md) never outlives the call that made it, it can skip the [heap](./Heap.md) allocation and keep the fields in the [stack frame](./Stack%20frame.md) or in registers.

The visible symptom is warmup.
The first few hundred requests after a deploy are slow, latency percentiles look terrible, then they settle.
This is also why a benchmark that does not warm up measures the interpreter, not your code.

_Usage:_

"Why is the first minute after every deploy so slow?"

"JIT warmup. Until the hot paths are compiled you are running interpreted bytecode."
