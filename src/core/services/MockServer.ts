import express, { RequestHandler } from 'express';
import basicAuth from 'express-basic-auth';
import fs from 'fs';
import path from 'path';
import bodyParser from 'body-parser';
import http from 'http';
import { Logger } from '../utils/Logger';

/**
 * MockServer serves static mock JSON responses based on HTTP method and URL path.
 * It is typically used in CI or development environments for API contract testing.
 */
export class MockServer {

  private app = express();
  private readonly port = 3000;
  private readonly mockDir = path.resolve('mock-responses');
  private logger = new Logger({ level: 'info' });
  private server?: http.Server;

  /**
   * Constructs a new MockServer and sets up middleware and routes.
   */
  constructor() {
    this.logger.info('Initializing MockServer...');
    this.logger.info(`Expected mock response directory: ${this.mockDir}`);

    const mockDirExists = fs.existsSync(this.mockDir);
    if (!mockDirExists) {
      this.logger.warn(`Mock directory does not exist: ${this.mockDir}`);
    } else {
      this.logger.info('Mock directory found.');
    }

    this.app.use(bodyParser.json());

    this.app.use(basicAuth({
      users: { 'admin': 'secret' },
      unauthorizedResponse: () => 'Unauthorized',
    }));
    this.logger.info('Basic authentication configured for user: "admin"');

    this.setupRoutes();
    this.logger.info('Finished setting up routes and middleware.');
  }

  /**
   * Sets up a universal route handler that matches incoming requests to mock response files.
   */
  private setupRoutes(): void {
    const handler: RequestHandler = (req, res) => {
      const { method, path: reqPath } = req;

      this.logger.info(`Incoming request: ${method} ${reqPath}`);

      const match = this.findMatchingTest(method, reqPath);

      if (!match) {
        this.logger.warn(`No mock match found for: ${method} ${reqPath}`);
        res.status(404).send(`No mock response found for ${method} ${reqPath}`);
        return;
      }

      this.logger.info(`Matched to file: ${match}.json`);
      const mockFile = path.join(this.mockDir, `${match}.json`);

      if (!fs.existsSync(mockFile)) {
        this.logger.error(`Mock file not found: ${mockFile}`);
        res.status(500).send(`Mock file not found: ${match}.json`);
        return;
      }

      const content = fs.readFileSync(mockFile, 'utf-8');
      try {
        const json = JSON.parse(content);
        res.json(json);
      } catch (e) {
        this.logger.error(`Invalid JSON in mock file: ${match}.json`);
        res.status(500).send('Invalid mock JSON file');
      }
    };

    this.app.all(/.*/, handler);
  }

  /**
   * Matches an incoming request method and path to a mock file name.
   * Converts path to a file-safe format: e.g., GET /api/user → GET_api_user.json
   *
   * @param method - HTTP method (GET, POST, etc.)
   * @param reqPath - Request path
   * @returns Matching file name without extension, or null if not found
   */
  private findMatchingTest(method: string, reqPath: string): string | null {
    const cleanPath = reqPath.replace(/^\/|\/$/g, '').replace(/\//g, '_');
    const fileName = `${method.toUpperCase()}_${cleanPath}`;
    const mockFilePath = path.join(this.mockDir, `${fileName}.json`);

    return fs.existsSync(mockFilePath) ? fileName : null;
  }

  /**
   * Starts the mock server and begins listening on the configured port.
   *
   * @returns A promise that resolves when the server has started
   */
  public start(): Promise<void> {
    return new Promise((resolve) => {
      this.server = this.app.listen(this.port, () => {
        this.logger.info(`Mock server is running at http://localhost:${this.port}`);
        resolve();
      });
    });
  }

  /**
   * Stops the mock server if it is currently running.
   *
   * @returns A promise that resolves when the server has stopped
   */
  public stop(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.server) {
        return resolve();
      }

      this.server.close((err) => {
        if (err) {
          this.logger.error('Error while stopping mock server.');
          return reject(err);
        }

        this.logger.info('Mock server stopped.');
        resolve();
      });
    });
  }
}
