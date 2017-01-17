'use strict';

/*
 * Concatenates items from the function arguments into a RegExp
 * This is a helper function to be able to break long RegExp's into multiple
 * lines and add comments for them.
 */
function makeRegExp() {
  return new RegExp([].reduce.call(arguments, (acc, x) => acc + x.source, ''));
}

const formats = {
  command: makeRegExp(
    /^<!--\s*/, // Comment opening, optional spaces/tabs/returns
    /fulky:(\S+)/, // Command 'fulky:xxx', xxx being captured
    /([ \t]+[ \t\w-]+)?/, // Optional, captured, arguments separated by spaces/tabs
    /(\n+[\s\S]+)*/, // Optional, ignored, "body" of a command
    /\s*-->/ // Optional spaces/tabs/returns, comment closing
  ),

  code: /^```(?:js|javascript)[\s\n]*\n+([\s\S]+?)```/,
  newline: /^\s*\n+/,
  unknown: /.*/
};

module.exports = function tokenize(content) {
  let match;
  let token;

  if (match = content.match(formats.newline)) {
    token = null;
  } else if (match = content.match(formats.code)) {
    token = {
      type: 'code',
      code: match[1],
    };
  } else if (match = content.match(formats.command)) {
    token = {
      type: 'command',
      command: match[1]
    };

    // Positional arguments split into an array if they exist
    if (match[2] && match[2].trim().length > 0) {
      token.arguments = match[2].trim().split(/[ \t]+/);
    }

    // Comment body trimmed and stored into `body` if it exists
    if (match[3]) {
      const trimmedBody = match[3].replace(/^\s+|\s+$/g, '');
      if (trimmedBody.length > 0) {
        token.body = trimmedBody;
      }
    }
  } else if (match = content.match(formats.unknown)) {
    token = {
      type: 'unknown'
    };
  } else {
    throw 'boom'; // TODO Get rid of this
  }

  return {
    contentRemainder: content.substring(match[0].length),
    token: token
  };
}
