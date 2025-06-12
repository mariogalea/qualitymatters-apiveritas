/**
 * @file InitService.ts
 * @description Handles the logic to initialize the ApiVeritas folder structure.
 */

import fs from 'fs-extra';
import chalk from 'chalk';
import { Logger } from '../utils/Logger';
import { PathResolver } from '../utils/PathResolver';

export class InitService {
  private readonly logger: Logger;
  private readonly templatesDir: string;

  constructor(
    private baseDir: string,
    private force: boolean,
    logger: Logger = new Logger(),
    resolver: PathResolver = new PathResolver()
  ) {
    this.logger = logger;
    this.templatesDir = resolver.templatesDir(); // ✅ now resolves to dist/templates
  }

  public async initialize(): Promise<void> {
    this.logger.info(`Initializing ApiVeritas folder structure in: ${this.baseDir}`);
    this.logger.info(`Templates directory resolved to: ${this.templatesDir}`);

    try {
      // Ensure base directory exists
      await fs.ensureDir(this.baseDir);

      // Copy templates recursively
      await this.copyTemplates();

      this.logger.info(`ApiVeritas initialized successfully in ${this.baseDir}`);
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      this.logger.error(`Init failed: ${message}`);
      throw err;
    }
  }

  private async copyTemplates(): Promise<void> {
    const copyOptions = { overwrite: this.force, errorOnExist: false };

    this.logger.info(`Copying templates from ${this.templatesDir} to ${this.baseDir} (force=${this.force})`);

    if (!(await fs.pathExists(this.templatesDir))) {
      this.logger.error(`Templates directory not found at ${this.templatesDir}`);
      throw new Error('Templates directory missing in dist. Have you run the build?');
    }

    await fs.copy(this.templatesDir, this.baseDir, copyOptions);

    this.logger.info('Templates copied');
  }
}
