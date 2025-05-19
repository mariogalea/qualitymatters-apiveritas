// src/ConfigLoader.ts
import fs from 'fs';
import path from 'path';
import { ComparerOptions } from './ComparerOptions';


export class ConfigLoader {
  static loadConfig(): ComparerOptions {
    const configPath = path.join(__dirname, '..', 'config.json');

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
        console.warn('⚠️ Failed to parse config.json, using defaults.');
      }
    } else {
      console.warn('⚠️ config.json not found, using default settings.');
    }

    return {
      strictSchema: true,
      strictValues: true,
      tolerateEmptyResponses: false
    };
  }
}
