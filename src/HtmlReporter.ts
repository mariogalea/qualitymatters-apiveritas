import fs from 'fs';
import path from 'path';
import chalk from 'chalk';
import boxen from 'boxen';

export class HtmlReporter {
  private reportsDir: string;

  constructor() {
    this.reportsDir = path.join(__dirname, '..', 'reports');
    if (!fs.existsSync(this.reportsDir)) {
      fs.mkdirSync(this.reportsDir, { recursive: true });
    }
  }

  generateReport(oldFolder: string, newFolder: string, comparisonResults: string[]): string {
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

    // Simple HTML template
    const html = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8" />
      <title>API Payload Comparison Report</title>
      <style>
        body { font-family: Arial, sans-serif; padding: 20px; }
        h1 { color: #2c3e50; }
        .match { color: green; }
        .diff { color: red; }
        .container { max-width: 800px; margin: auto; }
        pre { background: #f4f4f4; padding: 10px; border-radius: 4px; }
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
        <pre>${comparisonResults.join('\n')}</pre>
      </div>
    </body>
    </html>
    `;

    fs.writeFileSync(filepath, html, 'utf-8');

    const reportMessage = chalk.white.bold('📄 HTML report successfully generated!\n\n') +
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
