// src/ApiCaller.ts
import axios from 'axios';
import { ApiRequest } from './models/ApiRequest';
import { ResponseSaver } from './ResponseSaver';
type AxiosRequestConfig = Parameters<typeof axios>[0];


export class ApiCaller {
  private requests: ApiRequest[];

  constructor(requests: ApiRequest[]) {
    this.requests = requests;
  }

  public async callAll(): Promise<void> {
    const saver = new ResponseSaver();

    for (const req of this.requests) {
      try {
        const method = (req.method ?? 'GET').toUpperCase();

        const axiosConfig: AxiosRequestConfig = {
          url: req.url,
          method: method,
          auth: req.auth,
          data: req.body ?? undefined,
          validateStatus: () => true // don't throw on non-2xx status
        };

        const response = await axios(axiosConfig);

        // ✅ Status code assertion
        if (req.expectedStatus && response.status !== req.expectedStatus) {
          console.error(
            `❌ [${req.name}] returned status ${response.status}, expected ${req.expectedStatus}`
          );
        } else {
          console.log(`✅ [${req.name}] returned expected status ${response.status}`);
        }

        console.log(`✅ Response from [${req.name}]`);
        console.log(JSON.stringify(response.data, null, 2));

        // Save the response
        const safeName = req.name.replace(/\s+/g, '_');
        saver.saveResponse(safeName, response.data);

      } catch (error) {
        if (error instanceof Error) {
          console.error(`❌ Failed to call [${req.name}]:`, error.message);
        } else {
          console.error(`❌ Failed to call [${req.name}]:`, error);
        }
      }
    }
  }
}
