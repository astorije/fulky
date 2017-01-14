# Using `init-block`

`init-block` declares a snippet to run once before all examples of the file.

<!-- init-block
const assert = require('assert');
let foo = 42;
-->

```js
assert.equal(foo - 1, 41);
foo = 'bar';
```

```js
assert.equal(foo, 'bar');
```
