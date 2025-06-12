// scripts/copy-templates.ts
import fs from 'fs-extra';
import path from 'path';

async function copyTemplates() {
  try {
    const src = path.resolve(__dirname, '..', 'src', 'templates');
    const dest = path.resolve(__dirname, '..', 'dist', 'templates');

    console.log(`Copying templates from ${src} to ${dest}`);

    await fs.copy(src, dest, { overwrite: true });
    console.log('Templates copied successfully.');
  } catch (err) {
    console.error('Error copying templates:', err);
    process.exit(1);
  }
}

copyTemplates();
