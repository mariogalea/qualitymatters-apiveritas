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
    // Use templatesDir() which resolves to dist/templates
    this.templatesDir = resolver.templatesDir();
  }

  public async run(targetPath?: string, force: boolean = false): Promise<void> {
    // Default to 'apiveritas' folder in current working directory
    const trimmed = targetPath?.trim();
    const finalTarget = trimmed && trimmed.length > 0 ? trimmed : 'apiveritas';
    const destPath = path.resolve(process.cwd(), finalTarget);

    this.logger.info(`Target path argument: "${targetPath}"`);
    this.logger.info(`Using final target folder: "${finalTarget}"`);
    this.logger.info(`Destination full path: "${destPath}"`);

    this.logger.info(chalk.cyan(`\nInitializing ApiVeritas templates in: ${chalk.white(destPath)}\n`));
    this.logger.info(`Templates directory resolved to: ${this.templatesDir}`);

    try {
      // Check templates folder exists
      if (!await fs.pathExists(this.templatesDir)) {
        this.logger.error(chalk.red(`Templates directory not found at ${this.templatesDir}`));
        process.exit(1);
      }

      // Check for existing files that would conflict
      const filesToCheck = await fs.readdir(this.templatesDir);
      const conflicts: string[] = [];

      for (const file of filesToCheck) {
        const destFilePath = path.join(destPath, file);
        if (await fs.pathExists(destFilePath)) {
          conflicts.push(destFilePath);
        }
      }

      if (conflicts.length > 0 && !force) {
        this.logger.error(chalk.red(`The following files already exist:\n  ${conflicts.join('\n  ')}\nUse --force to overwrite.`));
        process.exit(1);
      }

      // Ensure destination folder exists
      await fs.ensureDir(destPath);

      // Copy templates with overwrite depending on force flag
      await fs.copy(this.templatesDir, destPath, { overwrite: force, errorOnExist: false });

      this.logger.info(chalk.green(`✅ Templates initialized successfully in ${destPath}!\n`));
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : String(error);
      this.logger.error(chalk.red(`Failed to initialize templates: ${msg}`));
      process.exit(1);
    }
  }
}
