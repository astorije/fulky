# Using `globals` with a body

Statements in the body of `globals` will be run once prior to any test execution.

<!-- fulky:globals
const chai = require('chai');
const expect = chai.expect;
-->

```js
expect(6 * 7).to.be.within(41, 43);
```
