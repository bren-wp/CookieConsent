'use strict';
const fs = require('node:fs');
const path = require('node:path');
const {createHash} = require('node:crypto');
function renderLoader(root) {
  const template = fs.readFileSync(path.join(root, 'cdn/loader.js'), 'utf8');
  const sri = name => 'sha384-' + createHash('sha384')
    .update(fs.readFileSync(path.join(root, 'packages/core', name))).digest('base64');
  return Buffer.from(template.replace('__BCC_CSS_SRI__', sri('brendigo-cookieconsent.css'))
    .replace('__BCC_JS_SRI__', sri('brendigo-cookieconsent.js')));
}
module.exports = {renderLoader};
