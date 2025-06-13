/**
 * @file HtmlReporter.ts
 * @author Mario Galea
 * @description 
 * Generates a styled HTML report comparing old and new API responses,
 * including textual differences and JSON payload previews.
 */

import fs from 'fs';
import path from 'path';
import chalk from 'chalk';
import { Logger } from '../utils/Logger';

interface ComparisonResult {
  fileName: string;
  matched: boolean;
  differences?: string[];
  oldContent?: any;
  newContent?: any;
}

/**
 * Responsible for generating an HTML report summarizing API response comparisons.
 * Each report includes match status, textual differences, and side-by-side JSON views.
 */
export class HtmlReporter {
  private reportsDir: string;
  private logger: Logger;

  /**
   * Constructs the HtmlReporter.
   * Creates the reports directory if it does not exist, and initializes the logger.
   */
  constructor() {
    this.reportsDir = path.join(process.cwd(), 'apiveritas', 'reports');
    this.logger = new Logger({ level: 'info' });

    if (!fs.existsSync(this.reportsDir)) {
      fs.mkdirSync(this.reportsDir, { recursive: true });
      this.logger.info(`Reports directory created at: ${this.reportsDir}`);
    }
  }

  /**
   * Generates a timestamped HTML report file showing comparison results between two payload folders.
   *
   * @param oldFolder - Path to the older version of payloads.
   * @param newFolder - Path to the newer version of payloads.
   * @param comparisonResults - An array of comparison result objects with diff and content data.
   * @returns The full path to the generated HTML report.
   */
  generateReport(oldFolder: string, newFolder: string, comparisonResults: ComparisonResult[]): string {
    const now = new Date();
    const timestamp = `${now.getFullYear()}.${(now.getMonth() + 1)
      .toString()
      .padStart(2, '0')}.${now.getDate().toString().padStart(2, '0')}.${now
      .getHours()
      .toString()
      .padStart(2, '0')}${now.getMinutes().toString().padStart(2, '0')}${now
      .getSeconds()
      .toString()
      .padStart(2, '0')}`;

    const filename = `comparison-report-${timestamp}.html`;
    const filepath = path.join(this.reportsDir, filename);

    const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>API Payload Comparison Report</title>
  <style>
    body { font-family: Arial, sans-serif; padding: 20px; background: #fdfdfd; }
    h1 { color: #2c3e50; }
    .match { color: green; }
    .diff { color: red; }
    .container { max-width: 1000px; margin: auto; }
    pre { background: #f4f4f4; padding: 10px; border-radius: 4px; white-space: pre-wrap; }
    .section { margin-bottom: 40px; border-bottom: 1px dashed #ddd; padding-bottom: 20px; }
    .file-name { font-weight: bold; }
    details { margin-top: 10px; }
    summary { cursor: pointer; color: #3498db; font-weight: bold; }
  </style>
</head>
<body>
  <div class="container">
    <h1>API Payload Comparison Report</h1>
    <p><strong>Comparing folders:</strong></p>
    <ul>
      <li>Previous: <code>${oldFolder}</code></li>
      <li>Latest: <code>${newFolder}</code></li>
    </ul>
    <h2>Results</h2>
    ${comparisonResults
      .map(
        (result) => `
      <div class="section">
        <div class="file-name">${result.fileName}</div>
        <div>Status: <span class="${result.matched ? 'match' : 'diff'}">
          ${result.matched ? '✅ MATCH' : '❌ DIFFERENCES FOUND'}
        </span></div>
        ${
          !result.matched && result.differences
            ? `
          <details open>
            <summary>View Differences (Text)</summary>
            <pre>${result.differences.join('\n')}</pre>
          </details>
          <details>
            <summary>View Old Response</summary>
            <pre>${JSON.stringify(result.oldContent, null, 2)}</pre>
          </details>
          <details>
            <summary>View New Response</summary>
            <pre>${JSON.stringify(result.newContent, null, 2)}</pre>
          </details>
        `
            : ''
        }
      </div>
    `
      )
      .join('')}
  </div>
</body>
</html>
`;

    fs.writeFileSync(filepath, html, 'utf-8');

    this.logger.info(chalk.magenta.bold('HTML Report Generated Successfully in:'));
    this.logger.info(chalk.white(filepath + ':\n'));

    return filepath;
  }
}
