// src/ApiCaller.ts
import axios from 'axios';
import { ApiRequest } from './models/ApiRequest';
import { ResponseSaver } from './ResponseSaver';

export class ApiCaller {
  private requests: ApiRequest[];

  constructor(requests: ApiRequest[]) {
    this.requests = requests;
  }

  public async callAll(): Promise<void> {

    const saver = new ResponseSaver(); 

    for (const req of this.requests) {
        try {
        const axiosConfig = {
            auth: req.auth
        };

        let response;

        const method = (req.method ?? 'GET').toUpperCase();

        if (method === 'POST') {
            response = await axios.post(req.url, req.body, axiosConfig);
        } else if (method === 'PUT') {
            response = await axios.put(req.url, req.body, axiosConfig);
        } else if (method === 'DELETE') {
            // DELETE usually doesn't have a body, but axios supports it optionally:
            response = await axios.delete(req.url, axiosConfig);
        } else {
            response = await axios.get(req.url, axiosConfig);
        }

        console.log(`✅ Response from [${req.name}]:`);
        console.log(`✅ Response from [${req.name}] - Status: ${response.status}`);
        console.log(JSON.stringify(response.data, null, 2));

        // Save the response
        const safeName = req.name.replace(/\s+/g, '_'); // filename safe
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