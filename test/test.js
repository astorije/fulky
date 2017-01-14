'use strict';

const expect = require('chai').expect;
const spawnSync = require('child_process').spawnSync;

function runFixture(fixture) {
  return spawnSync(
    'mocha',
    ['--compilers', 'md:mocha-md-compiler', `test/fixtures/${fixture}.md`],
    { encoding: 'utf-8' }
  );
}

describe('Executing Markdown fixtures against the Mocha compiler', () => {
  it('should pass a simple passing fixture', () => {
    const result = runFixture('basic-passing');

    expect(result.status).to.equal(0);
    expect(result.stdout).to.include('Markdown');
    expect(result.stdout).to.include(`${process.cwd()}/test/fixtures/basic-passing.md`);
    expect(result.stdout).to.include("should run API example #1: require('assert').ok(true);");
    expect(result.stdout).to.include('1 passing');
  });

  it('should fail a simple failing fixture', () => {
    const result = runFixture('basic-failing');

    expect(result.status).to.equal(1);
    expect(result.stdout).to.include('1 failing');
    expect(result.stdout).to.include('AssertionError: false == true');
  });

  it('should skip examples marked with `skip-test`', () => {
    const result = runFixture('skip-test');

    expect(result.status).to.equal(0);
    expect(result.stdout).to.include('1 passing');
    expect(result.stdout).to.include("should run API example #1: require('assert').ok(true);");
  });

  it('should save a `define`d example and prepend it later with `use`', () => {
    const result = runFixture('define-and-use');

    expect(result.status).to.equal(0);
    expect(result.stdout).to.include('2 passing');
  });

  it('should run `init-block` once before all tests are run', () => {
    const result = runFixture('init-block');

    expect(result.status).to.equal(0);
    expect(result.stdout).to.include('2 passing');
  });
});
