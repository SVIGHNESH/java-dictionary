---
description: The unchecked exception thrown when a null reference is dereferenced - a field access, method call, array index, or unboxing.
---

A NullPointerException, or NPE, is the [unchecked exception](./Unchecked%20exception.md) thrown when code dereferences a null [reference](./Reference.md).
That covers calling a [method](./Method.md) on null, reading or writing a [field](./Field.md) of null, indexing a null array, throwing null, and - the one that surprises people - unboxing a null wrapper.

The unboxing case is worth knowing because it is invisible.
[Autoboxing](./Autoboxing.md) inserts an `intValue()` call for you, so assigning a null `Integer` to an `int` throws an NPE at a line where no dot appears.

Historically the message was useless: `NullPointerException` and nothing else, on a line with four chained calls.
Helpful NullPointerException messages, added in JDK 14 and on by default since JDK 15, fix this.
The [JVM](./JVM.md) reconstructs the failing expression from the [bytecode](./Bytecode.md) and names the exact culprit:

```
Cannot invoke "String.length()" because the return value of
"java.util.Map.get(Object)" is null
```

For values that are legitimately absent rather than accidentally null, [Optional](./Optional.md) makes the absence part of the [reference type](./Reference%20type.md) instead of a landmine.

_Usage:_

"The [stack trace](./Stack%20trace.md) says NPE on line 42 but there are three calls on that line."

"Check the JDK version. From 15 on, the message names the exact reference that was null."
