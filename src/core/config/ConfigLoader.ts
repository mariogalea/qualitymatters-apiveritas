import fs from 'fs';
import path from 'path';
import { IComparerOptions } from '../../interfaces/IComparerOptions';
import { Logger } from '../utils/Logger';
import { PathValidator } from './PathValidator';
import chalk from 'chalk';

export class ConfigLoader {
  private logger = new Logger({ level: 'info' });
  private configFolder: string;
  private configPath: string;

  constructor(configFolder?: string) {
    // Default to 'apiveritas' folder in cwd if none provided
    this.configFolder = configFolder
      ? path.resolve(configFolder)
      : path.resolve(process.cwd(), 'apiveritas');
    this.configPath = path.join(this.configFolder, 'config.json');
  }

  loadConfig(): IComparerOptions {
    const defaultPayloadsPath = path.resolve(this.configFolder, 'payloads');
    const defaultReportsPath = path.resolve(this.configFolder, 'reports');

    if (fs.existsSync(this.configPath)) {
      try {
        const rawData = fs.readFileSync(this.configPath, 'utf-8');
        const parsed = JSON.parse(rawData);

        const validatedPayloadsPath = PathValidator.validateFolderPath(
          parsed.payloadsPath,
          defaultPayloadsPath,
          'payloadsPath',
          this.logger
        );

        const validatedReportsPath = PathValidator.validateFolderPath(
          parsed.reportsPath,
          defaultReportsPath,
          'reportsPath',
          this.logger
        );

        const baseUrl = parsed.baseUrl ?? 'http://localhost:8080';

        return {
          strictSchema: parsed.strictSchema !== false,
          strictValues: parsed.strictValues !== false,
          tolerateEmptyResponses: parsed.tolerateEmptyResponses === true,
          payloadsPath: validatedPayloadsPath,
          reportsPath: validatedReportsPath,
          baseUrl,
          enableMockServer: parsed.enableMockServer === true,
        };
      } catch (err) {
        this.logger.warn('! Failed to parse config.json, using defaults.');
      }
    } else {
        console.log(chalk.yellow(`\nconfig.json not found at ${this.configPath}.\n\nRun 'apiveritas init' to create a working folder structure\n`))    
    }

    // Defaults fallback
    return {
      strictSchema: true,
      strictValues: false,
      tolerateEmptyResponses: true,
      payloadsPath: defaultPayloadsPath,
      reportsPath: defaultReportsPath,
      baseUrl: 'http://localhost:8080',
      enableMockServer: true,
    };
  }

  updateConfig(newValues: Partial<Record<string, any>>): void {
    const config = this.loadConfig();
    const updated = { ...config, ...newValues };
    fs.writeFileSync(this.configPath, JSON.stringify(updated, null, 2), 'utf-8');
    console.log(`Config updated successfully at ${this.configPath}. Run: "apiveritas config" to verify changes.\n`);
  }
}
