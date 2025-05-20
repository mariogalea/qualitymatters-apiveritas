import axios from 'axios'
import { ApiRequest } from '../../interfaces/IApiRequest'
import { ResponseSaver } from '../utils/ResponseSaver'
import { Logger } from '../utils/Logger'

type AxiosRequestConfig = Parameters<typeof axios>[0]

export class ApiCaller {
  private requests: ApiRequest[]
  private logger: Logger

  constructor(requests: ApiRequest[], logger: Logger = new Logger()) {
    this.requests = requests
    this.logger = logger
  }

  public async callAll(): Promise<void> {
    const saver = new ResponseSaver()

    for (const req of this.requests) {
      const method = (req.method ?? 'GET').toUpperCase()
      const safeName = req.name.replace(/\s+/g, '_')

      try {
        const axiosConfig: AxiosRequestConfig = {
          url: req.url,
          method,
          auth: req.auth,
          data: req.body ?? undefined,
          validateStatus: () => true,
        }

        const response = await axios(axiosConfig)

        if (req.expectedStatus && response.status !== req.expectedStatus) {
          this.logger.error(`[${req.name}] returned status ${response.status}, expected ${req.expectedStatus}`)
        } else {
          this.logger.info(`[${req.name}] returned expected status ${response.status}`)
        }

        this.logger.debug(`Response from [${req.name}]`)

        saver.saveResponse(safeName, response.data)

        this.logger.info(`Saved response: payloads/${saver.getFolderName()}/${safeName}.json`)

      } catch (error) {
        const message = error instanceof Error ? error.message : String(error)
        this.logger.error(`Failed to call [${req.name}]: ${message}`)
      }

      console.log('')
    }
  }
}
