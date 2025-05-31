import axios from 'axios';
import { ApiRequest } from '../../interfaces/IApiRequest';
import { ResponseSaver } from '../utils/ResponseSaver';
import { Logger } from '../utils/Logger';
import chalk from 'chalk';

type AxiosRequestConfig = Parameters<typeof axios>[0];

export class ApiCaller {

  private requests: ApiRequest[];
  private logger: Logger;

  constructor(requests: ApiRequest[], logger: Logger = new Logger(), private baseUrl: string = '') {
    this.requests = requests;
    this.logger = logger;
    this.baseUrl = baseUrl;
  }

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

      // Allow baseUrl override per request (for mock server support)
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
          validateStatus: () => true,
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

        this.logger.info(`Saved response: payloads/${saver.getTimestampFolderName()}/${testSuite}/${safeName}.json`);

      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        this.logger.error(`Failed to call [${req.name}]: ${message}`);
      }

      console.log('');
    }
  }
}
