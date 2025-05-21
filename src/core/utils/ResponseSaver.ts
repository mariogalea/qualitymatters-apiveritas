import fs from 'fs';
import path from 'path';
import chalk from 'chalk';
import { Logger } from '../utils/Logger';

export class ResponseSaver {
  private timestampFolder: string;
  private logger: Logger;

  constructor() {
    this.logger = new Logger(); // default options
    this.timestampFolder = path.join(process.cwd(), 'payloads', this.generateTimestamp());
    this.ensureFolderExists(this.timestampFolder);
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

  saveResponse(name: string, data: any): void {
    const filePath = path.join(this.timestampFolder, `${name}.json`);
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
  }

  getFolderName(): string {
    return path.basename(this.timestampFolder);
  }
}
