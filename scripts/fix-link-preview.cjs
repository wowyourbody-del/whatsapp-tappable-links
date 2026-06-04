// Recreates the link-preview-js root shim that Baileys needs under Node's
// resolver (it looks for index.js at the package root, but the package ships
// build/index.js with an exports map Node skips here). Without this shim,
// link preview generation fails ("url generation failed") and links in long
// Hebrew (RTL) WhatsApp messages render but aren't tappable. Runs on postinstall.
const fs = require('fs');
const path = require('path');

const target = path.join(__dirname, '..', 'node_modules', 'link-preview-js', 'index.js');
try {
  if (fs.existsSync(path.dirname(target))) {
    fs.writeFileSync(target, "module.exports = require('./build/index.js');\n");
    console.log('[fix-link-preview] shim written:', target);
  }
} catch (e) {
  console.warn('[fix-link-preview] could not write shim:', e.message);
}
