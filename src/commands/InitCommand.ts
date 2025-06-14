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
    this.templatesDir = resolver.templatesDir();
  }

  public async run(force: boolean = false): Promise<void> {
    // Fixed target folder: 'apiveritas' under current working directory
    const finalTarget = 'apiveritas';
    const destPath = path.resolve(process.cwd(), finalTarget);

    this.logger.info(`Using fixed target folder: "${finalTarget}"`);
    this.logger.info(`Destination full path: "${destPath}"`);

    this.logger.info(chalk.cyan(`\nInitializing ApiVeritas templates in: ${chalk.white(destPath)}\n`));
    this.logger.info(`Templates directory resolved to: ${this.templatesDir}`);

    try {
      if (!await fs.pathExists(this.templatesDir)) {
        this.logger.error(chalk.red(`Templates directory not found at ${this.templatesDir}`));
        process.exit(1);
      }

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

      await fs.ensureDir(destPath);
      await fs.copy(this.templatesDir, destPath, { overwrite: force, errorOnExist: false });

      this.logger.info(chalk.green(`✅ Templates initialized successfully in ${destPath}!\n`));
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : String(error);
      this.logger.error(chalk.red(`Failed to initialize templates: ${msg}`));
      process.exit(1);
    }
  }
}
