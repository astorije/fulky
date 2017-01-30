'use strict';

const expect = require('chai').expect;
const spawnSync = require('child_process').spawnSync;

function runFixture(fixture) {
  return spawnSync(
    'node_modules/.bin/jasmine',
    ['JASMINE_CONFIG_PATH=test/runners/jasmine.json', `--filter=${fixture}`],
    { encoding: 'utf-8' }
  );
}

describe('Executing Markdown fixtures against the Jasmine compiler', function () {
  // On dev and CI environments, each call to `spawnSync` takes about ~150-200ms
  // so Mocha's default "slow" test threshold of 75ms always marks them in red.
  // This marks tests > 250ms in yellow and > 500ms in red. It is suitable for
  // tests with a single call to `spawnSync`.
  this.slow(500);

  it('should pass a simple passing fixture', () => {
    const result = runFixture('basic-passing');

    expect(result.status).to.equal(0);
    expect(result.stdout).to.include('1 spec');
  });

  it('should fail a simple failing fixture', () => {
    const result = runFixture('basic-failing');

    expect(result.status).to.equal(1);
    expect(result.stdout).to.include('1 failure');
    expect(result.stdout).to.include('AssertionError: false == true');
  });

  it('should pass against an empty document', () => {
    const result = runFixture('empty');

    expect(result.status).to.equal(0);
    expect(result.stdout).to.include('0 specs');
    expect(result.stdout).to.include('0 failures');
    expect(result.stderr).to.be.empty;
  });

  it('should skip examples marked with `skip-test`', () => {
    const result = runFixture('skip-test');

    expect(result.status).to.equal(0);
    expect(result.stdout).to.include('1 spec');
  });

  it('should save a `define`d example and prepend it later with `use`', () => {
    const result = runFixture('define-and-use');

    expect(result.status).to.equal(0);
    expect(result.stdout).to.include('2 specs');
  });

  it('should run body of `globals` once before all tests are run', () => {
    const result = runFixture('globals-comment');

    expect(result.status).to.equal(0);
    expect(result.stdout).to.include('1 spec');
  });

  it('should run a `globals` code block once before all tests are run', () => {
    const result = runFixture('globals-code-block');

    expect(result.status).to.equal(0);
    expect(result.stdout).to.include('2 specs');
  });

  it('should allow for multiple `globals` commands', () => {
    const result = runFixture('globals-multiple-times');

    expect(result.status).to.equal(0);
    expect(result.stdout).to.include('1 spec');
  });
});
