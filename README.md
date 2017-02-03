[![npm](https://img.shields.io/npm/v/fulky.svg)](https://www.npmjs.com/package/fulky)
[![License](https://img.shields.io/npm/l/fulky.svg)](LICENSE)
[![Build Status](https://travis-ci.org/astorije/fulky.svg?branch=master)](https://travis-ci.org/astorije/fulky)

# fulky

## Usage

### Use it with [Mocha](https://mochajs.org/)

Run it with:

```sh
mocha --compilers md:fulky/md-compiler *.md
```

### Use it with [Jasmine](https://jasmine.github.io/)

In your `spec/support/jasmine.json` configuration file, add:

```json
{
  "spec_dir": "spec",
  "spec_files": [
    "../*.md"
  ],
  "helpers": [
    "../node_modules/fulky/md-compiler.js"
  ]
}
```

Then run it with:

```sh
jasmine
```

### Use it with [Tape](https://github.com/substack/tape)

```sh
tape -r fulky/md-compiler *.md
```
