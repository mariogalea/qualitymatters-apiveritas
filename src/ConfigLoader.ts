// src/ConfigLoader.ts
import fs from 'fs';
import path from 'path';

export interface ComparerOptions {
  strictSchema?: boolean;
}

export class ConfigLoader {
  static loadConfig(): ComparerOptions {
    const configPath = path.join(__dirname, '..', 'config.json');
    if (fs.existsSync(configPath)) {
      try {
        const rawData = fs.readFileSync(configPath, 'utf-8');
        const parsed = JSON.parse(rawData);
        return {
          strictSchema: parsed.strictSchema === true, // enforce boolean
        };
      } catch (err) {
        console.warn('⚠️ Failed to parse config.json, using defaults.');
      }
    } else {
      console.warn('⚠️ config.json not found, using default settings.');
    }

    return { strictSchema: true }; // default config
  }
}
