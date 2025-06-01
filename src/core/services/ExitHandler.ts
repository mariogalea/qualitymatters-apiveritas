/**
 * @file ExitHandler.ts
 * @description Service class for handling process exit codes and logging
 * @author Mario Galea
 */

import { Logger } from '../utils/Logger';

export enum ExitCode {
  SUCCESS = 0,
  GENERAL_ERROR = 1,
  INVALID_ARGS = 2,
  CONFIG_ERROR = 3,
  TEST_SUITE_LOADING_ERROR = 4,
  API_CALL_FAILURE = 5,
  COMPARISON_FAILURE = 6,
  MOCK_SERVER_ERROR = 7,
}

export class ExitHandler {
  private logger: Logger;

  constructor(logger: Logger) {
    this.logger = logger;
  }

  /** Generic exit method */
  exit(code: ExitCode, message?: string, level: 'info' | 'warn' | 'error' = 'info'): never {
    if (message) {
      this.log(level, message);
    } else {
      this.log(level, `Exiting with code ${code}`);
    }
    process.exit(code);
  }

  /** Logs and exits with success code (0) */
  success(message?: string): never {
    this.exit(ExitCode.SUCCESS, message ?? 'Operation completed successfully.', 'info');
  }

  /** Handles general unexpected errors */
  generalError(message?: string): never {
    this.exit(ExitCode.GENERAL_ERROR, message ?? 'An unexpected error occurred.', 'error');
  }

  /** Handles missing or invalid arguments */
  invalidArgs(message?: string): never {
    this.exit(ExitCode.INVALID_ARGS, message ?? 'Missing or invalid arguments provided.', 'warn');
  }

  /** Handles configuration errors */
  configError(message?: string): never {
    this.exit(ExitCode.CONFIG_ERROR, message ?? 'Configuration error encountered.', 'error');
  }

  /** Handles test suite loading errors */
  testSuiteLoadingError(message?: string): never {
    this.exit(ExitCode.TEST_SUITE_LOADING_ERROR, message ?? 'Failed to load test suite.', 'error');
  }

  /** Handles API call failures */
  apiCallFailure(message?: string): never {
    this.exit(ExitCode.API_CALL_FAILURE, message ?? 'API call failed.', 'error');
  }

  /** Handles comparison failures (payload diff found) */
  comparisonFailure(message?: string): never {
    this.exit(ExitCode.COMPARISON_FAILURE, message ?? 'Payload comparison failed.', 'warn');
  }

  /** Handles mock server errors */
  mockServerError(message?: string): never {
    this.exit(ExitCode.MOCK_SERVER_ERROR, message ?? 'Mock server encountered an error.', 'error');
  }

  /** Internal logger helper */
  private log(level: 'info' | 'warn' | 'error', message: string): void {
    switch (level) {
      case 'info':
        this.logger.info(message);
        break;
      case 'warn':
        this.logger.warn(message);
        break;
      case 'error':
        this.logger.error(message);
        break;
    }
  }
}
