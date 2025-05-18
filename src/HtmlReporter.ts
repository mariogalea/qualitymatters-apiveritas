import fs from 'fs';
import path from 'path';
import chalk from 'chalk';
import boxen from 'boxen';

interface ComparisonResult {
  fileName: string;
  matched: boolean;
  differences?: string[];
  oldContent?: any;
  newContent?: any;
}

export class HtmlReporter {
  private reportsDir: string;

  constructor() {
    this.reportsDir = path.join(__dirname, '..', 'reports');
    if (!fs.existsSync(this.reportsDir)) {
      fs.mkdirSync(this.reportsDir, { recursive: true });
    }
  }

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
      .section { margin-bottom: 40px; border-bottom: 1px solid #ddd; padding-bottom: 20px; }
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

  const reportMessage =
    chalk.white.bold('📄 HTML report successfully generated!\n\n') +
    chalk.cyan.underline(filepath);

  console.log(
    boxen(reportMessage, {
      padding: 1,
      borderColor: 'red',
      borderStyle: 'round',
      backgroundColor: '#330000',
      title: chalk.redBright.bold('ApiVeritas Report'),
      titleAlignment: 'center',
    })
  );

  return filepath;
  }
}
