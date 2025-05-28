import fs from 'fs';
import path from 'path';
import chalk from 'chalk';
import { Logger } from '../utils/Logger';

export class ResponseSaver {
  private baseFolder: string;
  private logger: Logger;

  constructor() {
    this.logger = new Logger();
    this.baseFolder = path.join(process.cwd(), 'payloads', this.generateTimestamp());
    this.ensureFolderExists(this.baseFolder);
  }

  private generateTimestamp(): string {
    const now = new Date();
    return `${now.getFullYear()}.${
      (now.getMonth() + 1).toString().padStart(2, '0')
    }.${now.getDate().toString().padStart(2, '0')}.${now.getHours()
      .toString()
      .padStart(2, '0')}${now.getMinutes().toString().padStart(2, '0')}${now
      .getSeconds()
      .toString()
      .padStart(2, '0')}`;
  }

  private ensureFolderExists(folderPath: string): void {
    if (!fs.existsSync(folderPath)) {
      fs.mkdirSync(folderPath, { recursive: true });
      this.logger.info(`\n  Storage folder: ${chalk.white(folderPath)}\n`);
    }
  }

  saveResponse(suite: string, name: string, data: any): void {
    const suiteFolder = path.join(this.baseFolder, suite);
    this.ensureFolderExists(suiteFolder);
    const filePath = path.join(suiteFolder, `${name}.json`);
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
  }

  /** Returns the timestamp folder name (e.g., "2025.05.28.142530") */
  getTimestampFolderName(): string {
    return path.basename(this.baseFolder);
  }

  /** Returns the absolute path to the base payload folder (timestamp folder) */
  getBaseFolderPath(): string {
    return this.baseFolder;
  }
}
