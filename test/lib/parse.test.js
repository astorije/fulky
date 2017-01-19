'use strict';

const expect = require('chai').expect;
const parse = require('./../../lib/parse');

describe('#parse(tokens)', () => {
  const inlineCommandTokens = [
    { type: 'command', command: 'define', arguments: ['foo'] },
    { type: 'command', command: 'globals' },
    { type: 'command', command: 'skip-test' },
    { type: 'command', command: 'use', arguments: ['foo'] },
  ];

  describe('when ending with an inline command', () => {
    inlineCommandTokens.forEach(commandToken => {
      it(`should throw an error for ${commandToken.command}`, () => {
        const tokens = [commandToken, { type: 'EOF' }];

        expect(() => { parse(tokens); }).to.throw(
          SyntaxError,
          'Inline commands must be directly followed by a code block.'
        );
      });
    });
  });

  describe('when an inline command is not followed by a code block', () => {
    inlineCommandTokens.forEach(commandToken => {
      it(`should throw an error for ${commandToken.command}`, () => {
        const tokens = [
          commandToken,
          { type: 'unknown' },
          { type: 'code', code: "require('assert').ok(true);" }
        ];

        expect(() => { parse(tokens); }).to.throw(
          SyntaxError,
          'Inline commands must be directly followed by a code block.'
        );
      });
    });
  });

  describe('when cumulating inline commands with `globals`', () => {
    const incompatibleTokens = inlineCommandTokens
      .filter(commandToken => commandToken.command !== 'globals');

    describe('with a body', () => {
      incompatibleTokens.forEach(commandToken => {
        it(`should throw an error for ${commandToken.command}`, () => {
          const tokens = [
            commandToken,
            {
              type: 'command',
              command: 'globals',
              body: "require('assert').ok(true);"
            },
          ];

          expect(() => { parse(tokens); }).to.throw(
            SyntaxError,
            new RegExp('`globals` must not be used with.*' + commandToken.command)
          );
        });
      });
    });

    describe('with a code block', () => {
      incompatibleTokens.forEach(commandToken => {
        it(`should throw an error for ${commandToken.command}`, () => {
          const tokens = [
            commandToken,
            { type: 'command', command: 'globals' },
            { type: 'code', code: "require('assert').ok(true);" },
          ];

          expect(() => { parse(tokens); }).to.throw(
            SyntaxError,
            new RegExp('`globals` must not be used with.*' + commandToken.command)
          );
        });
      });
    });
  });
});
