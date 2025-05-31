import express, { Request, Response } from 'express';
import { RequestHandler } from 'express';
import basicAuth from 'express-basic-auth';
import fs from 'fs';
import path from 'path';
import bodyParser from 'body-parser';
import { Logger } from '../utils/Logger';
import http from 'http';

export class MockServer {
  private app = express();
  private readonly port = 3000;
  private readonly mockDir = path.resolve('mock-responses');
  private logger = new Logger({ level: 'info' });
  private server?: http.Server;

  constructor() {
    console.log('✅ MockServer constructor starting...');
  
    this.logger.info('Initializing MockServer...');
    this.logger.info(`Expected mock response directory: ${this.mockDir}`);
    
    const mockDirExists = fs.existsSync(this.mockDir);
    if (!mockDirExists) {
      this.logger.warn(`⚠️ Mock directory does not exist: ${this.mockDir}`);
    } else {
      this.logger.info('✅ Mock directory found.');
    }
  
    this.app.use(bodyParser.json());
  
    // Basic auth middleware
    this.app.use(basicAuth({
      users: { 'admin': 'secret' },
      unauthorizedResponse: () => 'Unauthorized',
    }));
    this.logger.info('✅ Basic auth configured: user "admin"');
  
    this.setupRoutes();
  
    console.log('✅ Finished setting up MockServer constructor');
  }

  private setupRoutes() {
    const handler: RequestHandler = (req, res) => {
      const { method, path: reqPath } = req;
      const match = this.findMatchingTest(method, reqPath);
      
      this.logger.info(`> Incoming: ${method} ${reqPath}`);

      if (!match) {
        this.logger.warn(`❌ No match found for ${method} ${reqPath}`);
        res.status(404).send(`No mock response found for ${method} ${reqPath}`);
        return;
      }

      this.logger.info(`✅ Matched to file: ${match}.json`);
      const mockFile = path.join(this.mockDir, `${match}.json`);

      if (!fs.existsSync(mockFile)) {
        res.status(500).send(`Mock file not found: ${match}.json`);
        return;
      }

      const content = fs.readFileSync(mockFile, 'utf-8');
      try {
        const json = JSON.parse(content);
        res.json(json);
      } catch (e) {
        this.logger.error(`❌ Invalid JSON in mock file: ${match}.json`);
        res.status(500).send('Invalid mock JSON file');
      }
    };

    this.app._router?.stack?.forEach((layer: any) => {
        if (layer.route) {
          console.log('Existing route:', layer.route?.path);
        }
      });

    this.app.all(/.*/, handler);
}

  private findMatchingTest(method: string, reqPath: string): string | null {
    const cleanPath = reqPath.replace(/^\/|\/$/g, '').replace(/\//g, '_');
    console.log(cleanPath);

    const fileName = `${method.toUpperCase()}_${cleanPath}`;
    console.log(fileName);

    const mockFilePath = path.join(this.mockDir, `${fileName}.json`);
    console.log(mockFilePath);

    return fs.existsSync(mockFilePath) ? fileName : null;
  }

  public start(): Promise<void> {
    return new Promise((resolve) => {
      this.server = this.app.listen(this.port, () => {
        this.logger.info(`🚀 Mock server is running at http://localhost:${this.port}`);
        resolve();
      });
    });
  }

  public stop(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.server) {
        return resolve();
      }
      this.server.close((err) => {
        if (err) return reject(err);
        this.logger.info('🛑 Mock server stopped.');
        resolve();
      });
    });
  }
}
