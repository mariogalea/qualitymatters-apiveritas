import axios from 'axios';
import chalk from 'chalk';
import { ApiRequest } from '../../interfaces/IApiRequest';
import { ResponseSaver } from '../utils/ResponseSaver';

type AxiosRequestConfig = Parameters<typeof axios>[0];

export class ApiCaller {
  private requests: ApiRequest[];

  constructor(requests: ApiRequest[]) {
    this.requests = requests;
  }

  public async callAll(): Promise<void> {
    const saver = new ResponseSaver();

    for (const req of this.requests) {
      const method = (req.method ?? 'GET').toUpperCase();
      const safeName = req.name.replace(/\s+/g, '_');

      try {
        const axiosConfig: AxiosRequestConfig = {
          url: req.url,
          method,
          auth: req.auth,
          data: req.body ?? undefined,
          validateStatus: () => true,
        };

        const response = await axios(axiosConfig);

        if (req.expectedStatus && response.status !== req.expectedStatus) {
          console.log(chalk.red(`❌ [${req.name}] returned status ${response.status}, expected ${req.expectedStatus}`));
        } else {
          console.log(chalk.green(`✅ [${req.name}] returned expected status ${response.status}`));
        }

        console.log(chalk.blueBright(`📨 Response from [${req.name}]`));

        // Save the response
        const savePath = saver.saveResponse(safeName, response.data);
        console.log(chalk.gray(`💾 Saved: ${savePath}`));

      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        console.error(chalk.red(`❌ Failed to call [${req.name}]: ${message}`));
      }
    }
  }
}
