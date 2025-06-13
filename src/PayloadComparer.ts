/**
 * @file PayloadComparer.ts
 * @author Mario Galea
 * @description
 * The PayloadComparer class compares JSON payload files between two snapshot folders
 * representing different states of API responses. It supports schema generation,
 * structural comparison, JSON Schema validation, and reports differences.
 * The comparison results are logged and an HTML report is generated.
 */

import fs from 'fs';
import path from 'path';
import generateSchema from 'generate-schema';
import { HtmlReporter } from './core/reporters/HtmlReporter';
import { BasicComparator } from './core/comparators/BasicComparator';
import { SchemaValidator } from './core/schema/SchemaValidator';
import { SchemaStrictifier } from './core/schema/SchemaStrictifier';
import { IComparerOptions } from './interfaces/IComparerOptions';
import { IFileComparisonResult } from './interfaces/IFileComparisonResult';
import { Logger } from './core/utils/Logger';
import chalk from 'chalk';
import { ConfigLoader } from './core/config/ConfigLoader';

/**
 * Compares JSON payloads between two folders and reports differences.
 * Supports strict schema validation, value strictness, empty response tolerance,
 * and mock server overrides via config.
 */
export class PayloadComparer {
  private payloadsDir: string;
  private comparator: BasicComparator;
  private options: IComparerOptions;
  private logger: Logger;
  private config: any;
  private configLoader: ConfigLoader;


  /**
   * Creates a new PayloadComparer instance.
   * @param {IComparerOptions} [options] - Options to control comparison behavior.
   * @param {boolean} [options.strictSchema=true] - Enforce strict JSON schema validation.
   * @param {boolean} [options.strictValues=true] - Enforce strict value matching.
   * @param {boolean} [options.tolerateEmptyResponses=false] - Allow empty or missing payloads without failing.
   * @param {Logger} [logger] - Optional logger instance to capture logs.
   */
  constructor(
  testSuiteName: string,
  options: IComparerOptions = {
    strictSchema: true,
    strictValues: true,
    tolerateEmptyResponses: false,
  },
  logger: Logger = new Logger()
) {
  this.configLoader = new ConfigLoader();
  this.config = this.configLoader.loadConfig();

  // Use custom or default payloads path
  const basePayloadsDir = this.config.payloadsPath || path.join(process.cwd(), 'apiveritas', 'payloads');

  // Include test suite in the path
  this.payloadsDir = path.join(basePayloadsDir, testSuiteName);

  this.options = options;
  this.comparator = new BasicComparator(this.options.strictValues);
  this.logger = logger;

  logger.info(chalk.white.bold.underline('Payload Comparison:\n'));
  logger.info(`${chalk.white('Test Suite Folder:')} ${chalk.white(testSuiteName)}`);
  logger.info(`${chalk.white('Payload Directory:')} ${chalk.white(this.payloadsDir)}\n`);
}

  /**
   * Retrieves the two most recent payload snapshot folders for comparison.
   * Folders are sorted by name descending (newest assumed last).
   * @returns {[string, string] | null} - Tuple of [previousFolder, latestFolder] or null if insufficient data.
   
  getLatestTwoPayloadFolders(): [string, string] | null {
    if (!fs.existsSync(this.payloadsDir)) {
      this.logger.warn('No payloads directory found.');
      return null;
    }

  /**
     * Returns the names of the latest two timestamp folders which contain the given testSuite folder.
     * If no testSuite specified, returns the latest two timestamp folders.
     */
    getLatestTwoPayloadFolders(testSuite?: string): [string, string] | null {
      if (!fs.existsSync(this.payloadsDir)) {
        this.logger.warn('No payloads directory found.');
        return null;
      }

      // Read all timestamp folders sorted newest first
      const timestampFolders = fs
        .readdirSync(this.payloadsDir)
        .filter((file) => fs.statSync(path.join(this.payloadsDir, file)).isDirectory())
        .sort()
        .reverse();

      if (timestampFolders.length < 2) {
        this.logger.warn('Not enough payload folders to compare.');
        return null;
      }

      // No testSuite specified, just return latest two timestamp folders
      return [timestampFolders[0], timestampFolders[1]];
    }

      /**
   * Compares JSON payload files in two folders (optionally within a test suite subfolder).
   * Generates detailed logs, counts matched and differing files, validates schema,
   * and generates an HTML report.
   * @param {string} oldFolder - The folder name of the baseline payload snapshot.
   * @param {string} newFolder - The folder name of the new payload snapshot.
   * @param {string} [testSuite] - Optional test suite folder name within each snapshot folder.
   * If mock server is enabled in config, this will be overridden to 'mock'.
   * @returns {void}
   */
  compareFolders( newFolder: string, oldFolder: string, testSuite?: string): boolean {

    if (this.config.enableMockServer) {
      testSuite = 'mock';
    }

    const startTime = Date.now();

    this.logger.info(`${chalk.white('Present Prod :')} ${chalk.white(oldFolder)}`);
    this.logger.info(`${chalk.white('Future Prod  :')} ${chalk.white(newFolder)}`);
    if (testSuite) {
      this.logger.info(`${chalk.white('Test Suite   :')} ${chalk.white(testSuite)}\n`);
    } else {
      this.logger.info(chalk.yellowBright('! No test suite specified. Comparing top-level payload files.\n'));
    }

    if (!testSuite) {
      this.logger.warn('No test suite specified. Cannot compare folders.');
      return false;
    }

    const oldPath = path.join(this.payloadsDir, oldFolder);
    const newPath = path.join(this.payloadsDir, newFolder);

    if (!fs.existsSync(oldPath)) {
      this.logger.warn(`Old folder path does not exist: ${oldPath}`);
      return false;
    }

    if (!fs.existsSync(newPath)) {
      this.logger.warn(`New folder path does not exist: ${newPath}`);
      return false;
    }

    const files = fs.readdirSync(oldPath).filter((file) => file.endsWith('.json'));

    if (files.length === 0) {
      this.logger.warn('No payload files found in the old folder to compare.');
      console.log();
      this.logger.info(chalk.bgYellow.black('WARNING - NO FILES TO COMPARE'));
      return false;
    }

    let isDifferent = false;
    let matchedCount = 0;
    let diffCount = 0;

    const results: IFileComparisonResult[] = [];
    const validator = new SchemaValidator();

    files.forEach((file) => {
      const oldFilePath = path.join(oldPath, file);
      const newFilePath = path.join(newPath, file);

      if (!fs.existsSync(newFilePath)) {
        isDifferent = true;
        diffCount++;
        results.push({
          fileName: file,
          matched: false,
          differences: ['X File missing in new version'],
          oldContent: this.loadAndParseJson(oldFilePath),
        });
        return;
      }

      const oldData = this.loadAndParseJson(oldFilePath);
      const newData = this.loadAndParseJson(newFilePath);

      const oldIsEmpty = oldData === null;
      const newIsEmpty = newData === null;

      if (this.options.tolerateEmptyResponses && (oldIsEmpty || newIsEmpty)) {
        matchedCount++;
        const msg = `! One or both payloads in ${file} are empty or missing. Ignored due to tolerateEmptyResponses=true.`;
        results.push({
          fileName: file,
          matched: true,
          differences: [msg],
          oldContent: oldData,
          newContent: newData,
        });
        return;
      }

      if (!this.options.tolerateEmptyResponses && (oldIsEmpty || newIsEmpty)) {
        isDifferent = true;
        diffCount++;
        const diffs = [
          ...(oldIsEmpty ? ['X Old data is not a valid object. Got empty or missing.'] : []),
          ...(newIsEmpty ? ['X New data is not a valid object. Got empty or missing.'] : []),
        ];
        results.push({
          fileName: file,
          matched: false,
          differences: diffs,
          oldContent: oldData,
          newContent: newData,
        });
        return;
      }

      const structuralDiffs = this.comparator.compare(oldData, newData);
      const ignoredDiffs = structuralDiffs.filter((d: string) => d.startsWith('IGNORED::'));
      const realDiffs = structuralDiffs.filter((d: string) => !d.startsWith('IGNORED::'));

      const schema = generateSchema.json('Response', oldData);
      if (this.options.strictSchema) {
        SchemaStrictifier.enforceNoAdditionalProperties(schema);
      }
      schema.$schema = 'http://json-schema.org/draft-07/schema#';

      const isValid = validator.validate(schema, newData);
      const schemaErrors = isValid ? [] : validator.getErrors();

      const actualDiffs = [...realDiffs, ...schemaErrors];
      const matched = actualDiffs.length === 0;

      if (matched) {
        matchedCount++;
      } else {
        isDifferent = true;
        diffCount++;
      }

      results.push({
        fileName: file,
        matched,
        differences: [...actualDiffs, ...ignoredDiffs],
        oldContent: oldData,
        newContent: newData,
      });
    });

    results.forEach((result) => {
      if (result.matched) {
        this.logger.info(chalk.green(`✓ ${result.fileName} matches`));
        result.differences?.forEach((diff) => {
          if (diff.startsWith('IGNORED::')) {
            this.logger.warn(diff.replace(/^IGNORED::\s*/, ''));
          }
        });
      } else {
        this.logger.error(`X Differences found in ${result.fileName}`);
        result.differences?.forEach((diff) => this.logger.error(diff));
      }
    });

    this.configLoader = new ConfigLoader();  // create ConfigLoader instance
    this.config = this.configLoader.loadConfig();   
    const maxKeyLength = Math.max(...Object.keys(this.config).map(key => key.length));

    console.log();
    if (!isDifferent) {
      this.logger.info(chalk.bgGreen.bold('SUCCESS - ALL PAYLOAD FILES MATCH WITH SPECIFIED CONFIG'));
    } else {
      this.logger.info(chalk.bgRed('FAILURE - NOT ALL PAYLOAD FILES MATCH WITH SPECIFIED CONFIG'));
    }
    Object.entries(this.config).forEach(([key, value]) => {
      const paddedKey = key.padEnd(maxKeyLength, ' ');
      this.logger.info(`${chalk.white(paddedKey)} : ${chalk.white.bold(String(value))}`);
    });

    const endTime = Date.now();
    const elapsedSeconds = ((endTime - startTime) / 1000).toFixed(2);

    const summaryParts = [
      `${matchedCount} matched`,
      diffCount > 0 ? `${diffCount} differed` : null,
      `${files.length} total files`,
      `in ${elapsedSeconds}s`,
    ].filter(Boolean);

    this.logger.info(chalk.white('\n  ' + summaryParts.join(' | ') + '\n'));

    const reporter = new HtmlReporter();
    reporter.generateReport(oldFolder, newFolder, results);

    return isDifferent;

  }

  /**
   * Loads and parses a JSON file safely.
   * Returns null if the file is empty, null, or invalid JSON.
   * @param {string} filePath - Path to the JSON file.
   * @returns {any | null} Parsed JSON object or null if empty/invalid.
   */
  private loadAndParseJson(filePath: string): any | null {
    try {
      const raw = fs.readFileSync(filePath, 'utf-8').trim();
      if (!raw || raw === '""' || raw === 'null') {
        return null;
      }
      return JSON.parse(raw);
    } catch (err: unknown) {
      const error = err as Error;
      this.logger.warn(`! Failed to parse JSON at ${filePath}: ${error.message}`);
      return null;
    }
  }

  /**
   * Logs a formatted header block with a title, a separator line, and a message.
   * @param {string} title - Title text for the header.
   * @param {string} message - Message text under the title.
   */
  private logHeader(title: string, message: string): void {
    const separator = '-'.repeat(72);
    this.logger.info('');
    this.logger.info(chalk.cyan(title));
    this.logger.info(separator);
    this.logger.info(message);
    this.logger.info('');
  }
}
