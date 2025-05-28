import fs from 'fs';
import path from 'path';
import { ApiRequest } from '../../interfaces/IApiRequest';
import { Logger } from '../utils/Logger';

export class TestSuiteLoader {
    
  private static logger = new Logger({ level: 'info' });

  static loadSuite(testFileName: string): ApiRequest[] {
    const testFilePath = path.resolve(process.cwd(), 'tests', testFileName);

    if (!fs.existsSync(testFilePath)) {
      this.logger.error(`Test file not found: ${testFilePath}`);
      throw new Error(`Test file not found: ${testFilePath}`);
    }

    try {
      const rawData = fs.readFileSync(testFilePath, 'utf-8');
      const parsed = JSON.parse(rawData);

      if (!Array.isArray(parsed)) {
        throw new Error('Test suite JSON must be an array of API definitions');
      }

      // Extract suite name from file name (e.g., bookings.json → bookings)
      const suiteName = path.basename(testFileName, '.json');

      // Inject testSuite field
      const enrichedRequests = parsed.map((entry, i) => {
        if (!entry.name || !entry.url) {
          throw new Error(`Test case at index ${i} is missing required fields (name, url)`);
        }
        return { ...entry, testSuite: suiteName };
      });

      return enrichedRequests as ApiRequest[];
    } catch (err: any) {
      this.logger.error(`Failed to parse or validate test suite file: ${err.message}`);
      throw err;
    }
  }

  static listAvailableSuites(): string[] {
    const testsDir = path.resolve(process.cwd(), 'tests');
    if (!fs.existsSync(testsDir)) return [];

    return fs.readdirSync(testsDir)
      .filter((file) => file.endsWith('.json'))
      .map((file) => file);
  }
}
