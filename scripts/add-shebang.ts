import fs from 'fs';
import path from 'path';

const cliPath = path.resolve(__dirname, '../dist/cli.js');
const content = fs.readFileSync(cliPath, 'utf8');

if (!content.startsWith('#!')) {
  const shebang = '#!/usr/bin/env node\n';
  fs.writeFileSync(cliPath, shebang + content);
  console.log('ℹ Shebang added to dist/cli.js');
} else {
  console.log('ℹ Shebang already exists');
}
