/**
 * @file MockServer.ts
 * @author Mario Galea
 * @description
 * The MockServer class provides an Express-based HTTP server that serves static
 * JSON mock responses for API contract testing. It maps incoming HTTP requests
 * to JSON files in a configured directory based on the request method and path,
 * then returns the file contents as the HTTP response. The server supports
 * basic authentication and can be started and stopped programmatically, making
 * it suitable for development and CI environments where a mock backend is needed.
 */

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
  private readonly mockDir = path.resolve('apiveritas/tests/mock/mock-responses');
  private logger = new Logger({ level: 'info' });
  private server?: http.Server;

  /**
   * Constructs a new MockServer instance.
   * Sets up middleware for JSON parsing and basic authentication,
   * checks the mock responses directory existence,
   * and configures routing for serving mock responses.
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
   * Sets up a universal route handler for all incoming HTTP requests.
   * The handler attempts to locate a corresponding mock JSON response file
   * based on HTTP method and path, then returns its contents as the response.
   * If no matching file is found or the file contains invalid JSON,
   * appropriate HTTP error codes and messages are returned.
   *
   * @private
   * @returns {void}
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
   * Matches an incoming HTTP request method and path to a mock JSON file name.
   * Converts the request path to a safe filename by stripping leading/trailing slashes
   * and replacing internal slashes with underscores.
   *
   * Example: GET /api/user -> GET_api_user.json
   *
   * @private
   * @param {string} method - The HTTP method (e.g., GET, POST).
   * @param {string} reqPath - The request URL path.
   * @returns {string | null} The matching filename without extension, or null if no file exists.
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
   * @public
   * @returns {Promise<void>} A promise that resolves once the server is successfully started.
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
   * @public
   * @returns {Promise<void>} A promise that resolves once the server is stopped.
   * If the server is not running, the promise resolves immediately.
   * If an error occurs while closing the server, the promise rejects with the error.
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
