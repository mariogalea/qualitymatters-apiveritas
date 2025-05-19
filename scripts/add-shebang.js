const fs = require('fs');
const path = require('path');

const cliPath = path.resolve(__dirname, '../dist/cli.js');
const content = fs.readFileSync(cliPath, 'utf8');

if (!content.startsWith('#!')) {
  const shebang = '#!/usr/bin/env node\n';
  fs.writeFileSync(cliPath, shebang + content);
  console.log('✅ Shebang added to dist/cli.js');
} else {
  console.log('ℹ️ Shebang already exists.');
}
