import fs from 'fs';
import path from 'path';
import { IComparerOptions } from '../../interfaces/IComparerOptions';
import { Logger } from '../utils/Logger';
import { PathValidator } from './PathValidator';

export class ConfigLoader {

  private static logger = new Logger({ level: 'info' });

  private static configPath = path.resolve(process.cwd(), 'src/config/config.json');


  static loadConfig(): IComparerOptions {

    const configPath = ConfigLoader.configPath;

    // Defaults:
    const defaultPayloadsPath = path.resolve(process.cwd(), 'payloads');
    const defaultReportsPath = path.resolve(process.cwd(), 'reports');

    if (fs.existsSync(configPath)) {
      try {
        const rawData = fs.readFileSync(configPath, 'utf-8');
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
          baseUrl
        };
      } catch (err) {
        this.logger.warn('! Failed to parse config.json, using defaults.');
      }
    } else {
      this.logger.warn('! config.json not found, using default settings.');
    }

    // Return defaults if config file missing or invalid
    return {
      strictSchema: true,
      strictValues: true,
      tolerateEmptyResponses: false,
      payloadsPath: defaultPayloadsPath,
      reportsPath: defaultReportsPath,
      baseUrl: 'http://localhost:8080' 
    };
  }

  static updateConfig(newValues: Partial<Record<string, any>>): void {
    const config = this.loadConfig();
    const updated = { ...config, ...newValues };
    fs.writeFileSync(ConfigLoader.configPath, JSON.stringify(updated, null, 2), 'utf-8');
    console.log('Config updated successfully.  Run: "apiveritas config" to verify changes.\n');
  }
}
