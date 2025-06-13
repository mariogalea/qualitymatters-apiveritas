/**
 * @file ApiCaller.ts
 * @author Mario Galea
 * @description
 * Responsible for executing a list of API requests defined in a Test Suite.
 * This class handles HTTP request logic using Axios, saves the responses to disk, and logs execution details.
 */

import axios from 'axios';
import { IApiRequest } from '../../interfaces/IApiRequest';
import { ResponseSaver } from '../utils/ResponseSaver';
import { Logger } from '../utils/Logger';
import chalk from 'chalk';

type AxiosRequestConfig = Parameters<typeof axios>[0];

/**
 * Executes a list of API requests, logs outcomes, and saves payloads for contract testing.
 */
export class ApiCaller {
  private requests: IApiRequest[];
  private logger: Logger;

  /**
   * Constructs a new ApiCaller instance.
   *
   * @param requests - An array of API requests to be executed.
   * @param logger - A logger instance for structured logging. Defaults to a new Logger instance.
   * @param baseUrl - The base URL to prepend to all request paths unless overridden per request.
   */
  constructor(requests: IApiRequest[], logger: Logger = new Logger(), private baseUrl: string = '') {
    this.requests = requests;
    this.logger = logger;
    this.baseUrl = baseUrl;
  }

  /**
   * Iterates over the provided list of API requests, executes them using Axios, and saves each response to disk.
   * 
   * - Logs all actions using the provided Logger.
   * - Automatically validates HTTP status codes if `expectedStatus` is defined in the request.
   * - Responses are saved to the payloads directory using the ResponseSaver utility.
   * - Supports per-request `baseUrl` override (useful for mock server mode).
   * 
   * @returns A Promise that resolves when all API calls have completed (successfully or with handled failure).
   *
   * @throws If a request is missing its required `testSuite` field, an error is thrown immediately.
   *         If a request is missing its `url`, an error is logged and the request is skipped.
   */
  public async callAll(): Promise<void> {
    this.logger.info(`Base URL: ${this.baseUrl}`);

    const saver = new ResponseSaver();
    this.logger.info(chalk.white.bold.underline('Test Run:\n'));

    for (const req of this.requests) {
      const method = (req.method ?? 'GET').toUpperCase();
      const safeName = req.name.replace(/\s+/g, '_');
      const testSuite = req.testSuite;

      if (!testSuite) {
        throw new Error(`Missing testSuite name in request: ${req.name}`);
      }

      if (!req.url) {
        this.logger.error(`Missing URL in request: ${req.name}`);
        continue;
      }

      // Allow per-request base URL override
      const effectiveBaseUrl = req.baseUrl ?? this.baseUrl;
      const fullUrl = effectiveBaseUrl + req.url;

      console.log(fullUrl);
      this.logger.info(`Calling URL: ${fullUrl} (method: ${method})`);

      try {
        const axiosConfig: AxiosRequestConfig = {
          url: fullUrl,
          method,
          auth: req.auth,
          data: req.body ?? undefined,
          validateStatus: () => true, // allow all HTTP responses
        };

        this.logger.debug(`Calling [${req.name}] with config:`);
        this.logger.debug(JSON.stringify(axiosConfig, null, 2));

        const response = await axios(axiosConfig);

        if (req.expectedStatus && response.status !== req.expectedStatus) {
          this.logger.error(`[${req.name}] returned status ${response.status}, expected ${req.expectedStatus}`);
        } else {
          this.logger.info(`[${req.name}] returned expected status ${response.status}`);
        }

        this.logger.debug(`Response from [${req.name}]`);
        saver.saveResponse(testSuite, safeName, response.data);

        this.logger.info(
          `Saved response: payloads/${saver.getTimestampFolderName()}/${testSuite}/${safeName}.json`
        );

      } catch (error: unknown) {
  if (error instanceof Error) {
    this.logger.error(chalk.red(`❌ Failed to call [${req.name}]: ${error.message}`));

    // Cast error to any to access response (Axios error)
    const anyErr = error as any;
    if (anyErr.response) {
      this.logger.error(chalk.red(`-> HTTP Status: ${anyErr.response.status}`));
      this.logger.error(chalk.red(`-> Response body: ${JSON.stringify(anyErr.response.data)}`));
    }
  } else {
    this.logger.error(chalk.red(`❌ Failed to call [${req.name}]: Unknown error`));
  }


      }

      console.log('');
    }
  }
}
