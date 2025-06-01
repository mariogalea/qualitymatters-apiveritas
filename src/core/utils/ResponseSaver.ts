/**
 * @file ResponseSaver.ts
 * @author Mario Galea
 * @description
 * Handles saving API responses to timestamped payload folders during test runs.
 * Each suite's responses are organized into subfolders under the timestamped directory.
 * This supports historical test data tracking and diffing between runs.
 * 
 * Example folder structure:
 * payloads/2025.05.28.142530/<suite>/<name>.json
 * 
 */

import fs from 'fs';
import path from 'path';
import chalk from 'chalk';
import { Logger } from '../utils/Logger';

/**
 * Saves API responses to timestamped directories for tracking test outputs over time.
 */
export class ResponseSaver {
  private baseFolder: string;
  private logger: Logger;

  /**
   * Initializes the `ResponseSaver`, creating a timestamped payload folder.
   */
  constructor() {
    this.logger = new Logger();
    this.baseFolder = path.join(process.cwd(), 'payloads', this.generateTimestamp());
    this.ensureFolderExists(this.baseFolder);
  }

  /**
   * Generates a unique timestamp folder name in the format `YYYY.MM.DD.HHmmss`.
   *
   * @returns {string} The timestamp string used for the current run.
   */
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

  /**
   * Ensures that the given folder exists. Creates it recursively if it does not.
   *
   * @param {string} folderPath - The absolute path of the folder to check/create.
   */
  private ensureFolderExists(folderPath: string): void {
    if (!fs.existsSync(folderPath)) {
      fs.mkdirSync(folderPath, { recursive: true });
      this.logger.info(`\n  Storage folder: ${chalk.white(folderPath)}\n`);
    }
  }

  /**
   * Saves a JSON API response to the correct suite and test name folder.
   *
   * @param {string} suite - The name of the test suite (used as subfolder).
   * @param {string} name - The individual test name (filename).
   * @param {any} data - The API response payload to save.
   */
  public saveResponse(suite: string, name: string, data: any): void {
    const suiteFolder = path.join(this.baseFolder, suite);
    this.ensureFolderExists(suiteFolder);

    const filePath = path.join(suiteFolder, `${name}.json`);
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
  }

  /**
   * Returns the folder name used for this run (e.g., "2025.05.28.142530").
   *
   * @returns {string} The timestamp folder name.
   */
  public getTimestampFolderName(): string {
    return path.basename(this.baseFolder);
  }

  /**
   * Returns the absolute path to the base folder where payloads are stored.
   *
   * @returns {string} Absolute path to the timestamped payload folder.
   */
  public getBaseFolderPath(): string {
    return this.baseFolder;
  }
}
