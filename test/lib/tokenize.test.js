'use strict';

const expect = require('chai').expect;
const tokenize = require('./../../lib/tokenize');

describe('#tokenize(content)', () => {

  describe('when tokenizing a Fulky command', () => {
    it('should pass against a simple command', () => {
      expect(tokenize('<!-- fulky:foobar -->')).to.deep.equal({
        token: { type: 'command', command: 'foobar' },
        contentRemainder: ''
      });
    });

    it('should ignore whitespaces and line returns', () => {
      expect(tokenize(`<!--
        fulky:foobar

      -->`)).to.deep.equal(tokenize('<!-- fulky:foobar -->'));
    });
  });

  describe('when tokenizing a JavaScript code block', () => {
    it('should pass against JavaScript code blocks', () => {
      expect(tokenize(`\`\`\`js
        console.log("foobar");
      \`\`\``)).to.deep.equal({
        token: { type: 'code', code: '        console.log("foobar");\n      ' },
        contentRemainder: ''
      });
    });

    it('should work with "js" and "javascript" language identifiers', () => {
      expect(tokenize(`\`\`\`js
        console.log("foobar");
      \`\`\``)).to.deep.equal(tokenize(`\`\`\`javascript
        console.log("foobar");
      \`\`\``));
    });
  });

  describe('when tokenizing anything else', () => {
    it('should return an unknown token against a line of text', () => {
      expect(tokenize('Lorem ipsum')).to.deep.equal({
        token: { type: 'unknown' },
        contentRemainder: ''
      });
    });

    it('should ignore non-JavaScript code blocks', () => {
      expect(tokenize(`\`\`\`
        Lorem ipsum
      \`\`\``)).to.have.property('token').that.deep.equals({ type: 'unknown' });

      expect(tokenize(`\`\`\`php
        $foo->bar();
      \`\`\``)).to.have.property('token').that.deep.equals({ type: 'unknown' });
    });

    it('should ignore non-Fulky commands', () => {
      expect(tokenize('<!-- Not a fulky command -->')).to.deep.equal({
        token: { type: 'unknown' },
        contentRemainder: ''
      })
    });
  });
});
