/**
 * @file TestSuiteLoader.ts
 * @author Mario Galea
 * @description
 * Responsible for loading API test suites from disk and preparing them for execution by enriching them with metadata.
 * Supports both real and mock test modes depending on configuration.
 */

import fs from 'fs';
import path from 'path';
import { IApiRequest } from '../../interfaces/IApiRequest';
import { Logger } from '../utils/Logger';
import { IComparerOptions } from '../../interfaces/IComparerOptions';

/**
 * Handles loading of test suite files (JSON), enriching each test with metadata like baseUrl and testSuite name.
 * Also supports mock server mode for isolated contract test runs.
 */
export class TestSuiteLoader {

  private static logger = new Logger({ level: 'info' });

  /**
   * Loads and parses a test suite JSON file, returning a list of API requests enriched with suite-specific metadata.
   *
   * - Validates file presence and schema integrity.
   * - Supports switching to mock test mode via `config.enableMockServer`.
   * - Injects `testSuite` and `baseUrl` fields into each request.
   *
   * @param testFileName - The name of the test suite JSON file (e.g., `bookings.json`).
   * @param config - Optional comparer configuration, including mock mode and base URL overrides.
   * @returns An array of enriched `ApiRequest` objects ready to be called.
   *
   * @throws Will throw if:
   * - The file doesn't exist.
   * - The file doesn't contain an array.
   * - Any test entry is missing required fields (`name`, `url`).
   * - JSON parse fails.
   */
  static loadSuite(testFileName: string, config?: IComparerOptions): IApiRequest[] {
    const useMock = config?.enableMockServer;
    const actualFile = useMock ? 'mock.json' : testFileName;
    const baseUrl = useMock
      ? 'http://localhost:3000'
      : config?.baseUrl || 'http://localhost:8080';

    if (useMock) {
      this.logger.info(
        '\n> Mock server mode enabled\n> Mock Test Suite: mock.json\n> Mock BaseUrl: http://localhost:3000\n'
      );
    }

    const testFolder = useMock ? 'mock' : 'real';
    const testFilePath = path.resolve(process.cwd(), 'apiveritas', 'tests', testFolder, actualFile);

    console.log(testFolder);

    // Check file existence
    if (!fs.existsSync(testFilePath)) {
      this.logger.error(`Test file not found: ${testFilePath}`);
      throw new Error(`Test file not found: ${testFilePath}`);
    }

    try {
      // Read and parse the test suite JSON
      const rawData = fs.readFileSync(testFilePath, 'utf-8');
      const parsed = JSON.parse(rawData);

      if (!Array.isArray(parsed)) {
        throw new Error('Test suite JSON must be an array of API definitions');
      }

      const suiteName = path.basename(actualFile, '.json');

      // Validate and enrich each test case
      const enrichedRequests = parsed.map((entry, i) => {
        if (!entry.name || !entry.url) {
          throw new Error(`Test case at index ${i} is missing required fields (name, url)`);
        }

        return {
          ...entry,
          testSuite: suiteName,
          baseUrl, // inject resolved base URL
        };
      });

      return enrichedRequests as IApiRequest[];
    } catch (err: any) {
      this.logger.error(`Failed to parse or validate test suite file: ${err.message}`);
      throw err;
    }
  }

  /**
   * Lists all available test suite JSON files in the `tests/` directory.
   *
   * Useful for CLI commands like `apiveritas list-tests` or for UI tools.
   *
   * @returns A list of file names ending in `.json` from the `tests/` folder.
   */
  static listAvailableSuites(): string[] {
  const testsDir = path.resolve(process.cwd(), 'apiveritas', 'tests', 'real');

    // If folder doesn't exist, return empty list
    if (!fs.existsSync(testsDir)) return [];

    return fs
      .readdirSync(testsDir)
      .filter((file) => file.endsWith('.json'));
  }
}
