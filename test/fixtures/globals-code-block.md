# Using `globals` with a code block

The first code block will be used as a global statement and will not be run as a
test case.

<!-- fulky:globals -->
```js
const assert = require('assert');
let foo = 42;
```

```js
assert.equal(foo - 1, 41);
foo = 'bar';
```

```js
assert.equal(foo, 'bar');
```
