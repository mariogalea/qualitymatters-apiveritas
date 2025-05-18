import fs from 'fs';
import path from 'path';
import chalk from 'chalk';
import { HtmlReporter } from './HtmlReporter';
import { BasicComparator } from './BasicComparator';
import generateSchema from 'generate-schema';
import { SchemaValidator } from './SchemaValidator';
import { SchemaStrictifier } from './SchemaStrictifier';
import { ConfigLoader, ComparerOptions } from './ConfigLoader';

interface FileComparisonResult {
  fileName: string;
  matched: boolean;
  differences?: string[];
  oldContent?: any;
  newContent?: any;
}

export class PayloadComparer {

  private payloadsDir: string;
  private comparator: BasicComparator;
  private options: ComparerOptions;


  constructor(options: ComparerOptions = { strictSchema: true }) {
    this.payloadsDir = path.join(__dirname, '..', 'payloads');
    this.comparator = new BasicComparator(options.strictValues);
    this.options = options;
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

    const results: FileComparisonResult[] = [];
    const validator = new SchemaValidator();

    files.forEach((file) => {
      const oldFilePath = path.join(oldPath, file);
      const newFilePath = path.join(newPath, file);

      if (!fs.existsSync(newFilePath)) {
        console.log(chalk.red(`⚠️ File missing in new version: ${file}`));
        anyDifferences = true;
        results.push({
          fileName: file,
          matched: false,
          differences: ['File missing in new version'],
          oldContent: JSON.parse(fs.readFileSync(oldFilePath, 'utf-8')),
        });
        return;
      }

      const oldData = JSON.parse(fs.readFileSync(oldFilePath, 'utf-8'));
      const newData = JSON.parse(fs.readFileSync(newFilePath, 'utf-8'));

      const structuralDiffs = this.comparator.compare(oldData, newData);

      const schema = generateSchema.json('Response', oldData);

      if (this.options.strictSchema) {
        SchemaStrictifier.enforceNoAdditionalProperties(schema);
      }
      
      schema.$schema = "http://json-schema.org/draft-07/schema#";

      const isValid = validator.validate(schema, newData);
      const schemaErrors = isValid ? [] : validator.getErrors();      

      const allDifferences = [...structuralDiffs, ...schemaErrors];


      if (allDifferences.length > 0) {
        anyDifferences = true;
        console.log(chalk.red(`❌ Differences found in ${file}:`));
        allDifferences.forEach((diff) => console.log(chalk.red('   →', diff)));

        results.push({
          fileName: file,
          matched: false,
          differences: allDifferences,
          oldContent: oldData,
          newContent: newData,
        });
      } else {
        console.log(chalk.green(`✅ ${file} matches.`));
        results.push({
          fileName: file,
          matched: true,
          oldContent: oldData,
          newContent: newData,
        });
      }
    });

    if (!anyDifferences) {
      console.log(chalk.green('\n🎉 All payload files match perfectly!'));
    }

    console.log(chalk.blue('\n====================================================\n'));

    const reporter = new HtmlReporter();
    reporter.generateReport(oldFolder, newFolder, results);
  }
}
