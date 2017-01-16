'use strict';

const formats = {
  command: /^<!--[\s\n]*fulky:([\s\S]+?)[\s\n]*-->/,
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
