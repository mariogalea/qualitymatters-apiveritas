import fs from 'fs';
import path from 'path';
import chalk from 'chalk';
import { HtmlReporter } from './HtmlReporter';

interface FileComparisonResult {
  fileName: string;
  matched: boolean;
  differences?: string[];
  oldContent?: any;
  newContent?: any;
}

export class PayloadComparer {
  private payloadsDir: string;

  constructor() {
    this.payloadsDir = path.join(__dirname, '..', 'payloads');
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

      const differences = this.compareJSON(oldData, newData);

      if (differences.length > 0) {
        anyDifferences = true;
        console.log(chalk.red(`❌ Differences found in ${file}:`));
        differences.forEach((diff) => console.log(chalk.red('   →', diff)));

        results.push({
          fileName: file,
          matched: false,
          differences,
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

    // Pass full structured results to HtmlReporter
    const reporter = new HtmlReporter();
    reporter.generateReport(oldFolder, newFolder, results);
  }

  private compareJSON(oldData: any, newData: any, pathPrefix: string = ''): string[] {
    const diffs: string[] = [];

    for (const key in oldData) {
      const fullPath = pathPrefix ? `${pathPrefix}.${key}` : key;

      if (!(key in newData)) {
        diffs.push(`Missing key in new data: ${fullPath}`);
        continue;
      }

      if (typeof oldData[key] !== typeof newData[key]) {
        diffs.push(
          `Type mismatch at ${fullPath}: expected ${typeof oldData[key]}, got ${typeof newData[key]}`
        );
        continue;
      }

      if (typeof oldData[key] === 'object' && oldData[key] !== null) {
        diffs.push(...this.compareJSON(oldData[key], newData[key], fullPath));
      } else if (oldData[key] !== newData[key]) {
        diffs.push(`Value mismatch at ${fullPath}: "${oldData[key]}" vs "${newData[key]}"`);
      }
    }

    return diffs;
  }
}
