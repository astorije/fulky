'use strict';

const fs = require('fs');

const tokenize = require('./lib/tokenize');
const parse = require('./lib/parse');

const runner = process.argv[1].split('/').pop();

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

  // Adding an end-of-file token to symbolize that the document was entirely
  // read. This is for example useful to check if there was a pending command.
  tokens.push({ type: 'EOF' });

  return tokens;
}

require.extensions['.md'] = function (module, filename) {
  const content = fs.readFileSync(filename, 'utf8');
  const tokens = lex(content);
  const parsed = parse(tokens);
  const globals = parsed.globals;
  const examples = parsed.code;

  let test;

  if (runner === 'tape') {
    test = `
      'use strict';

      const test = require('tape');

      ${globals}

      ${examples.map((example, index) => {
        let preview = example.replace(/'/g, "\\'");
        preview = preview.substr(0, preview.indexOf("\n")) || preview;

        return `test('Markdown file ${filename} should run API example #${index + 1}: ${preview}', function (t) {
          ${example}

          t.end();
        });`;
        }).join("\n")
      }
    `;
  } else {
    test = `
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
  }

  return module._compile(test, filename);
};
