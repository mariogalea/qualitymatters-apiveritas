import fs from 'fs';
import path from 'path';
import { IComparerOptions } from '../../interfaces/IComparerOptions';
import { Logger } from '../utils/Logger';

export class ConfigLoader {
  private static logger = new Logger({ level: 'info' });

  static loadConfig(): IComparerOptions {
    const configPath = path.resolve(process.cwd(), 'src/config/config.json'); // use project root

    if (fs.existsSync(configPath)) {
      try {
        const rawData = fs.readFileSync(configPath, 'utf-8');
        const parsed = JSON.parse(rawData);

        return {
          strictSchema: parsed.strictSchema === false ? false : true,  // default to true
          strictValues: parsed.strictValues === false ? false : true,  // default to true
          tolerateEmptyResponses: parsed.tolerateEmptyResponses === true ? true : false // default to false
        };
      } catch (err) {
        this.logger.warn('⚠️ Failed to parse config.json, using defaults.');
      }
    } else {
      this.logger.warn('⚠️ config.json not found, using default settings.');
    }

    return {
      strictSchema: true,
      strictValues: true,
      tolerateEmptyResponses: false
    };
  }
}
