'use strict';

const expect = require('chai').expect;

const Mocha = require('mocha');

require('./../mocha-md-compiler');

describe('Running fixtures', () => {
  it('should pass a simple fixture', () => {
    const mocha = new Mocha();
    const fixture = 'test/fixtures/one.md';
    mocha.addFile(fixture);

    const emitter = mocha.run(failures => {
      process.on('exit', () => {
        process.exit(failures);  // exit with non-zero status if there were failures
      });
    });

    // https://github.com/mochajs/mocha/blob/8a3cab063cfe68fa2e9aea8feada23aaf1a4db6f/lib/runner.js#L49-L59
    // emitter.on('start', () => console.log('start'));
    // emitter.on('end', () => console.log('end'));
    // emitter.on('suite', () => console.log('suite'));
    // emitter.on('suite end', () => console.log('suite end'));
    // emitter.on('test', () => console.log('test'));
    // emitter.on('test end', () => console.log('test end'));
    // emitter.on('hook', () => console.log('hook'));
    // emitter.on('hook end', () => console.log('hook end'));
    // emitter.on('pass', () => console.log('pass'));
    // emitter.on('fail', (a, b) => console.log('fail', a));
    // emitter.on('pending', () => console.log('pending'));
  });
});
