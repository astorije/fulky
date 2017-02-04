'use strict';

const expect = require('chai').expect;
const spawnSync = require('child_process').spawnSync;

function runFixture(fixture) {
  return spawnSync(
    'node_modules/.bin/jest',
    ['--no-cache', '--config', 'test/runners/jest.json', `test/fixtures/${fixture}.md`],
    { encoding: 'utf-8' }
  );
}

describe('Executing Markdown fixtures against the Jest compiler', function () {
  // On dev and CI environments, each call to `spawnSync` takes about ~1-1.5s
  // so Mocha's default "slow" test threshold of 75ms always marks them in red.
  // This marks tests > 300ms in yellow and > 600ms in red. It is suitable for
  // tests with a single call to `spawnSync`.
  this.slow(2500);
  this.timeout(5000);

  it('should pass a simple passing fixture', () => {
    const result = runFixture('basic-passing');

    expect(result.status).to.equal(0);
    expect(result.stderr).to.include('Markdown');
    expect(result.stderr).to.include(`${process.cwd()}/test/fixtures/basic-passing.md`);
    expect(result.stderr).to.include("should run API example #1: require('assert').ok(true);");
    expect(result.stderr).to.include('1 passed');
  });

  it('should fail a simple failing fixture', () => {
    const result = runFixture('basic-failing');

    expect(result.status).to.equal(1);
    expect(result.stderr).to.include('1 failed');
    expect(result.stderr).to.include('AssertionError: false == true');
  });

  it('should fail against an empty document', () => {
    const result = runFixture('empty');

    expect(result.status).to.equal(1);
    expect(result.stderr).to.include('Your test suite must contain at least one test.');
    expect(result.stderr).to.include('1 failed');
  });

  it('should skip examples marked with `skip-test`', () => {
    const result = runFixture('skip-test');

    expect(result.status).to.equal(0);
    expect(result.stderr).to.include('1 passed');
    expect(result.stderr).to.include("should run API example #1: require('assert').ok(true);");
  });

  it('should save a `define`d example and prepend it later with `use`', () => {
    const result = runFixture('define-and-use');

    expect(result.status).to.equal(0);
    expect(result.stderr).to.include('2 passed');
  });

  it('should run body of `globals` once before all tests are run', () => {
    const result = runFixture('globals-comment');

    expect(result.status).to.equal(0);
    expect(result.stderr).to.include('1 passed');
  });

  it('should run a `globals` code block once before all tests are run', () => {
    const result = runFixture('globals-code-block');

    expect(result.status).to.equal(0);
    expect(result.stderr).to.include('2 passed');
  });

  it('should allow for multiple `globals` commands', () => {
    const result = runFixture('globals-multiple-times');

    expect(result.status).to.equal(0);
    expect(result.stderr).to.include('1 passed');
  });
});
