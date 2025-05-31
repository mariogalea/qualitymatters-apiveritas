import fs from 'fs';
import path from 'path';
import { ApiRequest } from '../../interfaces/IApiRequest';
import { Logger } from '../utils/Logger';
import { IComparerOptions } from '../../interfaces/IComparerOptions';

export class TestSuiteLoader {
  private static logger = new Logger({ level: 'info' });

  static loadSuite(testFileName: string, config?: IComparerOptions): ApiRequest[] {
    
    const useMock = config?.enableMockServer;
    const actualFile = useMock ? 'mock.json' : testFileName;
    const baseUrl = useMock ? 'http://localhost:3000' : config?.baseUrl || 'http://localhost:8080';

    if (useMock) {
      this.logger.info('\n> Mock server mode enabled\n> Mock Test Suite: mock.json\n> Mock BaseUrl: http://localhost:3000\n');
    }

    const testFilePath = path.resolve(process.cwd(), 'tests', actualFile);

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

      const suiteName = path.basename(actualFile, '.json');

      const enrichedRequests = parsed.map((entry, i) => {
        if (!entry.name || !entry.url) {
          throw new Error(`Test case at index ${i} is missing required fields (name, url)`);
        }

        return {
          ...entry,
          testSuite: suiteName,
          baseUrl // inject baseUrl in each request explicitly
        };
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
