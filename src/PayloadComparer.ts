import fs from 'fs';
import path from 'path';
import chalk from 'chalk';
import { HtmlReporter } from './core/reporters/HtmlReporter';
import { BasicComparator } from './core/comparators/BasicComparator';
import generateSchema from 'generate-schema';
import { SchemaValidator } from './core/schema/SchemaValidator';
import { SchemaStrictifier } from './core/schema/SchemaStrictifier';
import { IComparerOptions } from './interfaces/IComparerOptions';
import { IFileComparisonResult } from './interfaces/IFileComparisonResult';


export class PayloadComparer {
  private payloadsDir: string;
  private comparator: BasicComparator;
  private options: IComparerOptions;

  constructor(options: IComparerOptions = { strictSchema: true, strictValues: true, tolerateEmptyResponses: false }) {
    this.payloadsDir = path.join(process.cwd(), 'payloads');
    console.log(chalk.blue('\n===================================================='));
    console.log('📁 Looking for payloads in:', this.payloadsDir);
    console.log(chalk.blue('\n===================================================='));

    this.options = options;
    this.comparator = new BasicComparator(this.options.strictValues);
  }

  getLatestTwoPayloadFolders(): [string, string] | null {
    if (!fs.existsSync(this.payloadsDir)) {
      console.warn('⚠️ No payloads directory found.');
      return null;
    }

    const folders = fs
      .readdirSync(this.payloadsDir)
      .filter((file) => fs.statSync(path.join(this.payloadsDir, file)).isDirectory())
      .sort()
      .reverse();

    if (folders.length < 2) {
      console.warn('⚠️ Not enough payload folders to compare.');
      return null;
    }

    return [folders[1], folders[0]];
  }

  compareFolders(oldFolder: string, newFolder: string): void {
  console.log(chalk.blue('\n===================================================='));
  console.log(
    chalk.blue(`📂 Comparing payloads folders:`) +
    `\n   Previous: ${chalk.yellow(oldFolder)}` +
    `\n   Latest:   ${chalk.yellow(newFolder)}`
  );
  console.log(chalk.blue('====================================================\n'));

  const oldPath = path.join(this.payloadsDir, oldFolder);
  const newPath = path.join(this.payloadsDir, newFolder);

  const files = fs.readdirSync(oldPath);
  let anyDifferences = false;

  const results: IFileComparisonResult[] = [];
  const validator = new SchemaValidator();

  files.forEach((file) => {
    const oldFilePath = path.join(oldPath, file);
    const newFilePath = path.join(newPath, file);

    if (!fs.existsSync(newFilePath)) {
      anyDifferences = true;
      results.push({
        fileName: file,
        matched: false,
        differences: ['File missing in new version'],
        oldContent: this.loadAndParseJson(oldFilePath),
      });
      return;
    }

    const oldData = this.loadAndParseJson(oldFilePath);
    const newData = this.loadAndParseJson(newFilePath);

    const oldIsEmpty = oldData === null;
    const newIsEmpty = newData === null;

    // Handle empty payloads optionally (tolerateEmptyResponses)
    if (this.options.tolerateEmptyResponses && (oldIsEmpty || newIsEmpty)) {
      const msg = `One or both payloads in ${file} are empty or missing. Ignored due to tolerateEmptyResponses=true.`;
      // Push matched with warning in differences, no console log here
      results.push({
        fileName: file,
        matched: true,
        differences: [msg],
        oldContent: oldData,
        newContent: newData,
      });
      return; // skip further comparison for this file
    }

    // Not tolerant: treat empty as error
    if (!this.options.tolerateEmptyResponses && (oldIsEmpty || newIsEmpty)) {
      anyDifferences = true;
      const diffs = [
        ...(oldIsEmpty ? ['Old data is not a valid object at #. Got empty or missing.'] : []),
        ...(newIsEmpty ? ['New data is not a valid object at #. Got empty or missing.'] : []),
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

    // Regular comparison logic
    const structuralDiffs = this.comparator.compare(oldData, newData);
    const ignoredDiffs = structuralDiffs.filter((d: string) => d.startsWith('IGNORED::'));
    const realDiffs = structuralDiffs.filter((d: string) => !d.startsWith('IGNORED::'));

    const schema = generateSchema.json('Response', oldData);
    if (this.options.strictSchema) {
      SchemaStrictifier.enforceNoAdditionalProperties(schema);
    }
    schema.$schema = "http://json-schema.org/draft-07/schema#";

    const isValid = validator.validate(schema, newData);
    const schemaErrors = isValid ? [] : validator.getErrors();

    const actualDiffs = [...realDiffs, ...schemaErrors];
    const matched = actualDiffs.length === 0;

    if (!matched) {
      anyDifferences = true;
    }

    results.push({
      fileName: file,
      matched,
      differences: [...actualDiffs, ...ignoredDiffs],
      oldContent: oldData,
      newContent: newData,
    });
  });

  // Now print the results nicely formatted
  results.forEach(result => {
    if (result.matched) {
      console.log(chalk.green(`✅ ${result.fileName} matches.`));
      if (result.differences && result.differences.length > 0) {
        result.differences.forEach(diff => {
          // Indent warnings under the file line
          console.log(chalk.yellow(`   ⚠️  ${diff.replace(/^IGNORED::\s*/, '')}`));
        });
      }
    } else {
      console.log(chalk.red(`❌ Differences found in ${result.fileName}:`));
      result.differences?.forEach(diff => console.log(chalk.red('   →', diff)));
    }
  });

  if (!anyDifferences) {
    console.log(chalk.green('\n🎉 All payload files match perfectly!'));
  }

  console.log(chalk.blue('\n====================================================\n'));

  const reporter = new HtmlReporter();
  reporter.generateReport(oldFolder, newFolder, results);


  }

  private loadAndParseJson(filePath: string): any | null {
    try {
      const raw = fs.readFileSync(filePath, 'utf-8').trim();

      if (!raw || raw === '""' || raw === 'null') {
        // Treat empty, empty JSON string, or null literal as null
        return null;
      }

      return JSON.parse(raw);
    } catch (err: unknown) {
      const error = err as Error;
      console.warn(chalk.red(`⚠️ Failed to parse JSON at ${filePath}: ${error.message}`));
      return null;
    }
  }
}
