# Using `define` and `use`

The first one declares a named example using `define` and the second one makes
use of it with `use`. Both will be run separately by test runners.

<!-- fulky:define my-saved-example -->
```js
const assert = require('assert');
const count = 42;
assert.equal(count, 42);
```

<!-- fulky:use my-saved-example -->
```js
assert.equal(count + 1, 43);
```
