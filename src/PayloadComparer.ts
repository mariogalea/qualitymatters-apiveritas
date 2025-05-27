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

export class PayloadComparer {
  private payloadsDir: string;
  private comparator: BasicComparator;
  private options: IComparerOptions;
  private logger: Logger;

  constructor(
    options: IComparerOptions = {
      strictSchema: true,
      strictValues: true,
      tolerateEmptyResponses: false,
    },
    logger: Logger = new Logger()
  ) {
    this.payloadsDir = path.join(process.cwd(), 'payloads');
    this.options = options;
    this.comparator = new BasicComparator(this.options.strictValues);
    this.logger = logger;

    logger.info(chalk.white.bold.underline('Payload Comparison:\n'));
    logger.info(`${chalk.white('Payload Folder:')} ${chalk.white(this.payloadsDir)}\n`);

  }

  getLatestTwoPayloadFolders(): [string, string] | null {
    if (!fs.existsSync(this.payloadsDir)) {
      this.logger.warn('No payloads directory found.');
      return null;
    }

    const folders = fs
      .readdirSync(this.payloadsDir)
      .filter((file) => fs.statSync(path.join(this.payloadsDir, file)).isDirectory())
      .sort()
      .reverse();

    if (folders.length < 2) {
      this.logger.warn('Not enough payload folders to compare.');
      return null;
    }

    return [folders[1], folders[0]];
  }

  compareFolders(oldFolder: string, newFolder: string): void {
    const startTime = Date.now();

    this.logger.info(`${chalk.white('Present Prod :')} ${chalk.white(oldFolder)}`);
    this.logger.info(`${chalk.white('Future Prod  :')} ${chalk.white(newFolder)}\n`);


    const oldPath = path.join(this.payloadsDir, oldFolder);
    const newPath = path.join(this.payloadsDir, newFolder);

    const files = fs.readdirSync(oldPath);

    if (files.length === 0) {
      this.logger.warn("No payload files found in the old folder to compare.");
      console.log();
      this.logger.info(chalk.bgYellow.black('WARNING - NO FILES TO COMPARE'));
      return;
    }
    

    let anyDifferences = false;
    let matchedCount = 0;
    let diffCount = 0;

    const results: IFileComparisonResult[] = [];
    const validator = new SchemaValidator();

    files.forEach((file) => {
      const oldFilePath = path.join(oldPath, file);
      const newFilePath = path.join(newPath, file);

      if (!fs.existsSync(newFilePath)) {
        anyDifferences = true;
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
        anyDifferences = true;
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
        anyDifferences = true;
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

    if (!anyDifferences) {
      console.log();
      this.logger.info(chalk.bgGreen.bold('SUCCESS - ALL PAYLOAD FILES MATCH WITH SPECIFIED CONFIG'));
        const config = ConfigLoader.loadConfig();
        const maxKeyLength = Math.max(...Object.keys(config).map(key => key.length));    
        Object.entries(config).forEach(([key, value]) => {
          const paddedKey = key.padEnd(maxKeyLength, ' ');
          this.logger.info(`${chalk.white(paddedKey)} : ${chalk.white.bold(String(value))}`);
    });
    } else {
      console.log();
      this.logger.info(chalk.bgRed('FAILURE - NOT ALL PAYLOAD FILES MATCH WITH SPECIFIED CONFIG'));
        const config = ConfigLoader.loadConfig();
        const maxKeyLength = Math.max(...Object.keys(config).map(key => key.length));    
        Object.entries(config).forEach(([key, value]) => {
          const paddedKey = key.padEnd(maxKeyLength, ' ');
          this.logger.info(`${chalk.white(paddedKey)} : ${chalk.white.bold(String(value))}`);
    });
      
    }

    const endTime = Date.now();
    const elapsedSeconds = ((endTime - startTime) / 1000).toFixed(2);

    // Summary line
    const summaryParts = [
      `${matchedCount} matched`,
      diffCount > 0 ? `${diffCount} differed` : null,
      `${files.length} total files`,
      `in ${elapsedSeconds}s`,
    ].filter(Boolean);

    this.logger.info(chalk.white('\n  ' + summaryParts.join(' | ') + '\n'));

    const reporter = new HtmlReporter();
    reporter.generateReport(oldFolder, newFolder, results);
  }

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

  private logHeader(title: string, message: string): void {
    const line = '-'.repeat(40);
    this.logger.info(`\n${title}\n${line}\n${message}\n`);
  }
}
