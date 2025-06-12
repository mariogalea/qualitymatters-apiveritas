/**
 * @file InitCommand.ts
 * @description Handles the 'init' CLI command to copy templates to target folder.
 */

import path from 'path';
import fs from 'fs-extra';
import chalk from 'chalk';
import { Logger } from '../core/utils/Logger';
import { PathResolver } from '../core/utils/PathResolver';

export class InitCommand {
  private logger: Logger;
  private templatesDir: string;

  constructor(logger: Logger) {
    this.logger = logger;
    const resolver = new PathResolver();
    this.templatesDir = resolver.templatesDir(); // ✅ updated to dist/templates
  }

  public async run(targetPath: string, force: boolean): Promise<void> {
    const destPath = path.resolve(process.cwd(), targetPath || '.');

    this.logger.info(chalk.cyan(`\nInitializing ApiVeritas templates in: ${chalk.white(destPath)}\n`));
    this.logger.info(`Templates directory resolved to: ${this.templatesDir}`);

    try {
      if (!await fs.pathExists(this.templatesDir)) {
        this.logger.error(chalk.red(`Templates directory not found at ${this.templatesDir}`));
        process.exit(1);
      }

      if (await fs.pathExists(destPath)) {
        if (!force) {
          this.logger.error(chalk.red(`Destination folder already exists. Use --force to overwrite.`));
          process.exit(1);
        } else {
          this.logger.info(chalk.yellow(`Overwriting existing files in ${destPath}...`));
        }
      }

      await fs.copy(this.templatesDir, destPath, { overwrite: force, errorOnExist: !force });

      this.logger.info(chalk.green('✅ Templates initialized successfully!\n'));
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : String(error);
      this.logger.error(chalk.red(`Failed to initialize templates: ${msg}`));
      process.exit(1);
    }
  }
}
