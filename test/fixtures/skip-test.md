# Using `skip-test`

This example demonstrates how to use `skip-test`. Only the second example will
be tested in this file.

<!-- fulky:skip-test -->
```js
require('assert').ok(true);
```

```js
require('assert').ok(true);
```

<!-- fulky:skip-test -->
```js
require('assert').ok(false);
```
