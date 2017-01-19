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

  // Adding an end-of-file token to symbolize that the document was entirely
  // read. This is for example useful to check if there was a pending command.
  tokens.push({ type: 'EOF' });

  return tokens;
}

function parse(tokens) {
  // As commands are parsed, this buffer gets populated to be applied to the
  // next code block following the command. This allows for cumulating commands.
  let commandBuffer = {};

  return tokens.reduce((acc, token) => {
    switch (token.type) {
      case 'command':
        switch (token.command) {
          case 'globals':
            // `globals` can either have a body hidden from the rendered
            // document or be attached to a code block.
            // If there is a body, then the next code block is just a regular
            // code block.
            if (token.body) {
              acc.globals = token.body;
            } else {
              commandBuffer.globals = true;
            }
            break;
          case 'skip-test':
            commandBuffer.skip = true;
            break;
          case 'define':
            commandBuffer.name = token.arguments[0];
            break;
          case 'use':
            commandBuffer.use = commandBuffer.use || [];
            commandBuffer.use.push(token.arguments[0]);
            break;
        }
        break;
      case 'code':
        let code = token.code;
        if (commandBuffer.globals) {
          acc.globals = token.code;

          if (commandBuffer.use || commandBuffer.name || commandBuffer.skip) {
            throw new SyntaxError(
              '`globals` must not be used with `use`, `name` or `skip-test`.'
            );
          }

          commandBuffer.skip = true;
        }

        if (commandBuffer.use) {
          code = commandBuffer.use.reduce(
            (acc2, name) => acc2 + acc.declarations.get(name),
            ''
          ) + code;
        }

        if (commandBuffer.name) {
          acc.declarations.set(commandBuffer.name, code);
        }

        if (!commandBuffer.skip) {
          acc.code.push(code);
        }

        // All commands have been applied to this code block, clear it
        commandBuffer = {};
        break;
      default:
        // If the command buffer is not empty here, it means that something else
        // than a code block was met after the previous command(s) and before a
        // code block or that EOF was reached with an inline command at the end.
        // This is means the document is erroneous.
        if (Object.keys(commandBuffer).length > 0) {
          throw new SyntaxError(
            'Inline commands must be directly followed by a code block.'
          );
        }
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
