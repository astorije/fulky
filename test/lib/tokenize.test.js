'use strict';

const expect = require('chai').expect;
const tokenize = require('./../../lib/tokenize');

describe('#tokenize(content)', () => {

  describe('when tokenizing a Fulky command', () => {
    describe('without any further modifiers', () => {
      it('should parse a simple command', () => {
        expect(tokenize('<!-- fulky:foobar -->')).to.deep.equal({
          token: { type: 'command', command: 'foobar' },
          contentRemainder: ''
        });
      });

      it('should ignore whitespaces and line returns', () => {
        [
          '<!--fulky:foobar-->',
          '<!-- fulky:foobar-->',
          '<!--fulky:foobar -->',
          '<!-- fulky:foobar -->',
          '<!--  fulky:foobar  -->',
          `<!--
            fulky:foobar

          -->`,
          `<!--

            fulky:foobar
          -->`
        ].forEach(actual => {
          expect(tokenize(actual)).to.deep.equal({
            token: { type: 'command', command: 'foobar' },
            contentRemainder: ''
          });
        });
      });
    });

    describe('with positional arguments', () => {
      it('should parse one argument', () => {
        expect(tokenize('<!-- fulky:foobar arg -->')).to.deep.equal({
          token: {
            type: 'command',
            command: 'foobar',
            arguments: ['arg']
          },
          contentRemainder: ''
        });
      });

      it('should parse multiple arguments', () => {
        expect(tokenize('<!-- fulky:foobar arg1 arg2 arg3 -->')).to.deep.equal({
          token: {
            type: 'command',
            command: 'foobar',
            arguments: ['arg1', 'arg2', 'arg3']
          },
          contentRemainder: ''
        });
      });

      it('should ignore whitespaces and line returns', () => {
        [
          '<!-- fulky:foobar arg1 arg2 -->',
          '<!-- fulky:foobar arg1 arg2-->',
          '<!-- fulky:foobar arg1   arg2-->',
          `<!--
            fulky:foobar arg1 arg2
          -->`
        ].forEach(input => {
          expect(tokenize(input)).to.deep.equal({
            token: {
              type: 'command',
              command: 'foobar',
              arguments: ['arg1', 'arg2']
            },
            contentRemainder: ''
          });
        });
      });

      it('should not treat subsequent lines as arguments', () => {
        [
          `<!--
            fulky:foobar
            notArg1 notArg2
          -->`,
          `<!--
            fulky:foobar
            notArg1
            notArg2
          -->`
        ].forEach(input => {
          const token = tokenize(input).token;
          expect(token.command).to.equal('foobar');
          expect(token).to.not.have.property('arguments');
        });
      });
    });

    describe('with a body', () => {
      it('should parse the given body into the token body', () => {
        expect(tokenize(`<!-- fulky:foobar
        body-line-1
        body-line-2
        -->`)).to.deep.equal({
          token: {
            type: 'command',
            command: 'foobar',
            body: 'body-line-1\n        body-line-2'
          },
          contentRemainder: ''
        });
      });

      it('should correctly extract a command followed by another one', () => {
        expect(tokenize(
          `<!-- fulky:foo
          block1();
          -->
          <!-- fulky:bar
          block2();
          -->`
        )).to.deep.equal({
          token: { type: 'command', command: 'foo', body: `block1();` },
          contentRemainder: `
          <!-- fulky:bar
          block2();
          -->`
        });
      });
    });

    describe('with positional arguments and a body', () => {
      it('should correctly parse both the arguments and body', () => {
        expect(tokenize(`<!-- fulky:foobar arg1 arg2
        body-line-1
        body-line-2
        -->`)).to.deep.equal({
          token: {
            type: 'command',
            command: 'foobar',
            arguments: ['arg1', 'arg2'],
            body: 'body-line-1\n        body-line-2'
          },
          contentRemainder: ''
        });
      });
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
