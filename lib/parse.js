'use strict';

/**
 * Validates that the `globals` command is used in a legal position, i.e. not
 * on a snippet (code block or comment body) that is also marked for an inline
 * command.
 */
function validateGlobals(commandBuffer) {
  if (commandBuffer.use || commandBuffer.name || commandBuffer.skip) {
    throw new SyntaxError(
      '`globals` must not be used with `define`, `skip-test`, or `use`.'
    );
  }
}

module.exports = function parse(tokens) {
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
              validateGlobals(commandBuffer);
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
          validateGlobals(commandBuffer);
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
};
