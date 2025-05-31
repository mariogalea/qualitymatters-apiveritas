/**
 * @file ConfigLoader.ts
 * @author Mario Galea
 * @description
 * The ConfigLoader class reads, validates, and manages runtime configuration options 
 * for ApiVeritas. It loads settings from `config.json`, applies fallbacks when necessary,
 * and supports programmatic updates. It ensures paths like `payloadsPath` and 
 * `reportsPath` are always valid, defaulting them when missing or incorrect.
 * 
 * This module plays a central role in initializing comparison behavior, 
 * mock server activation, and default test paths used throughout the tool.
 */

import fs from 'fs';
import path from 'path';
import { IComparerOptions } from '../../interfaces/IComparerOptions';
import { Logger } from '../utils/Logger';
import { PathValidator } from './PathValidator';

/**
 * ConfigLoader handles reading and writing the configuration for ApiVeritas from a JSON file.
 * It ensures valid fallback defaults and resolves all relevant paths for comparison and reporting.
 */
export class ConfigLoader {
  private static logger = new Logger({ level: 'info' });
  private static configPath = path.resolve(process.cwd(), 'src/config/config.json');

  /**
   * Loads configuration options from `config.json`, falling back to safe defaults if
   * the file does not exist or is malformed.
   * 
   * Validates `payloadsPath` and `reportsPath` using the `PathValidator`, and ensures
   * all flags and options are safely assigned.
   * 
   * @returns {IComparerOptions} - Parsed and validated configuration object for use in tests
   */
  static loadConfig(): IComparerOptions {
    const configPath = ConfigLoader.configPath;

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
          baseUrl,
          enableMockServer: parsed.enableMockServer === true
        };
      } catch (err) {
        this.logger.warn('! Failed to parse config.json, using defaults.');
      }
    } else {
      this.logger.warn('! config.json not found, using default settings.');
    }

    // Default fallback configuration
    return {
      strictSchema: true,
      strictValues: true,
      tolerateEmptyResponses: false,
      payloadsPath: defaultPayloadsPath,
      reportsPath: defaultReportsPath,
      baseUrl: 'http://localhost:8080',
      enableMockServer: false
    };
  }

  /**
   * Updates specific properties in the configuration file (`config.json`).
   * It merges new values with the existing config and persists them to disk.
   *
   * @param {Partial<Record<string, any>>} newValues - Key-value pairs to override in the config
   */
  static updateConfig(newValues: Partial<Record<string, any>>): void {
    const config = this.loadConfig();
    const updated = { ...config, ...newValues };
    fs.writeFileSync(ConfigLoader.configPath, JSON.stringify(updated, null, 2), 'utf-8');
    console.log('Config updated successfully.  Run: "apiveritas config" to verify changes.\n');
  }
}
