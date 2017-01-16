'use strict';

const fs = require('fs');

const tokenize = require('./lib/tokenize');

function lex(content) {
  const tokens = [];

  while (content) {
    const result = tokenize(content);
    content = result.contentRemainder;
    let token = result.token;

    if (token === null) {
      continue;
    }

    if (token.type === 'unknown' && tokens.length > 0 && tokens[tokens.length - 1].type === 'unknown') {
      continue;
    }

    tokens.push(token);
  }

  return tokens;
}

function parse(tokens) {

  return tokens.reduce((acc, token, index) => {
    switch (token.type) {
      case 'command':
        if (token.command.startsWith('globals')) {
          acc.globals = token.command.substr(7 + 1);
          break;
        }
        // Find next token that is not a command
        while (tokens[index] && tokens[index].type === 'command') {
          ++index;
        }
        if (tokens[index] && tokens[index].type === 'code') {
          let match;
          if (token.command === 'skip-test') {
            tokens[index].skip = true;
          } else if (match = token.command.match(/define (\w+)/)) {
            tokens[index].name = match[1];
          } else if (match = token.command.match(/use (\w+)/)) {
            tokens[index].use = tokens[index].use || [];
            tokens[index].use.push(match[1]);
          } else {
            // Error: command not attached to code?
          }
        }
        break;
      case 'code':
        let code = token.code;
        if (token.use && token.use.length > 0) {
          code = token.use.reduce(
            (acc2, name) => acc2 + acc.declarations.get(name),
            ''
          ) + code;
        }
        if (token.name) {
          acc.declarations.set(token.name, code);
        }
        if (!token.skip) {
          acc.code.push(code);
        }
        break;
    }

    return acc;
  }, { globals: '', code: [], declarations: new Map() });
}

require.extensions['.md'] = function (module, filename) {
  const content = fs.readFileSync(filename, 'utf8');
  const tokens = lex(content);
  const parsed = parse(tokens);
  const globals = parsed.globals;
  const examples = parsed.code;

  const test = `
    'use strict';

    ${globals}

    describe('Markdown file: ${filename}', function () {
      ${examples.map((example, index) => {
        let preview = example.replace(/'/g, "\\'");
        preview = preview.substr(0, preview.indexOf("\n")) || preview;

        return `it('should run API example #${index + 1}: ${preview}', function () {
          ${example}
        });`;
      }).join("\n")}
    });`;

  return module._compile(test, filename);
};
