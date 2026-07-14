---
description: A value that points to an object on the heap; Java variables of reference type hold references, never objects themselves.
---

A reference is the value stored in a variable of [reference type](./Reference%20type.md).
It identifies an [object](./Object.md) living on the [heap](./Heap.md).
A [primitive type](./Primitive%20type.md) variable holds its value directly; a reference variable holds only a handle to the object, and copying the variable copies the handle, not the object.
Java has no pointer arithmetic and no way to dereference an arbitrary address, but a reference can be `null`, and dereferencing it then throws [NullPointerException](./NullPointerException.md).

Two references may point to the same object (identity) or to two objects that compare as equal, which is why [equals and hashCode](./equals%20and%20hashCode.md) exists as a separate contract from `==`.
Arguments are passed by value in Java, and for reference types the value passed is the reference: the callee can mutate the object it points to but cannot make the caller's variable point somewhere else.

Reachability through references is exactly what [garbage collection](./Garbage%20collection.md) traces.
`java.lang.ref` also offers weak, soft, and phantom references, which participate in reachability more loosely and are the standard tool for caches that must not become a [memory leak](./Memory%20leak.md).

_Usage:_

"I passed the list into the method and it came back modified. Isn't Java pass-by-value?"

"It is. You passed the reference by value, so the method got its own copy of the reference to the same list, and it mutated that list."
