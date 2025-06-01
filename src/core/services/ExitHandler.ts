/**
 * @file ExitHandler.ts
 * @author Mario Galea
 * @description
 * This service class centralizes all process exit operations for the ApiVeritas CLI.
 * It ensures consistent logging and exit code handling across different CLI execution paths,
 * enabling more robust CI/CD integrations and easier debugging.
 * 
 * Each method maps to a well-defined `ExitCode` to indicate why the CLI exited,
 * supporting better automation and visibility into runtime outcomes.
 * 
 */

import { Logger } from '../utils/Logger';

/**
 * Enum representing all possible process exit codes used by the CLI.
 */
export enum ExitCode {
  /** Operation completed successfully */
  SUCCESS = 0,

  /** A general, unexpected error occurred */
  GENERAL_ERROR = 1,

  /** CLI was invoked with missing or invalid arguments */
  INVALID_ARGS = 2,

  /** Application configuration was missing or invalid */
  CONFIG_ERROR = 3,

  /** Test suite JSON file failed to load or parse */
  TEST_SUITE_LOADING_ERROR = 4,

  /** One or more API calls failed to complete successfully */
  API_CALL_FAILURE = 5,

  /** A payload comparison mismatch or schema diff was detected */
  COMPARISON_FAILURE = 6,

  /** Mock server failed to start, bind, or serve responses */
  MOCK_SERVER_ERROR = 7,
}

/**
 * Class responsible for managing application exits in a controlled, consistent manner.
 * It wraps all exit points with structured logging and appropriate `ExitCode`s.
 */
export class ExitHandler {
  private logger: Logger;

  /**
   * Constructs an ExitHandler with an injected logger.
   * @param logger Logger instance used for printing exit-related messages.
   */
  constructor(logger: Logger) {
    this.logger = logger;
  }

  /**
   * Generic method to terminate the process with a given exit code and log message.
   * @param code The exit code to terminate the process with.
   * @param message Optional message to log before exiting.
   * @param level Logging level to use (`info`, `warn`, or `error`). Defaults to `info`.
   * @throws This method never returns; it terminates the Node.js process.
   */
  exit(code: ExitCode, message?: string, level: 'info' | 'warn' | 'error' = 'info'): never {
    if (message) {
      this.log(level, message);
    } else {
      this.log(level, `Exiting with code ${code}`);
    }
    process.exit(code);
  }

  /**
   * Exits the application successfully.
   * @param message Optional message to log before exiting.
   * @throws This method terminates the process with `ExitCode.SUCCESS`.
   */
  success(message?: string): never {
    this.exit(ExitCode.SUCCESS, message ?? 'Operation completed successfully.', 'info');
  }

  /**
   * Exits due to a general, unexpected error.
   * @param message Optional error message to log.
   * @throws This method terminates the process with `ExitCode.GENERAL_ERROR`.
   */
  generalError(message?: string): never {
    this.exit(ExitCode.GENERAL_ERROR, message ?? 'An unexpected error occurred.', 'error');
  }

  /**
   * Exits when CLI arguments are missing or invalid.
   * @param message Optional warning message to log.
   * @throws This method terminates the process with `ExitCode.INVALID_ARGS`.
   */
  invalidArgs(message?: string): never {
    this.exit(ExitCode.INVALID_ARGS, message ?? 'Missing or invalid arguments provided.', 'warn');
  }

  /**
   * Exits when the configuration is invalid or missing.
   * @param message Optional error message to log.
   * @throws This method terminates the process with `ExitCode.CONFIG_ERROR`.
   */
  configError(message?: string): never {
    this.exit(ExitCode.CONFIG_ERROR, message ?? 'Configuration error encountered.', 'error');
  }

  /**
   * Exits when the test suite file cannot be loaded or parsed.
   * @param message Optional error message to log.
   * @throws This method terminates the process with `ExitCode.TEST_SUITE_LOADING_ERROR`.
   */
  testSuiteLoadingError(message?: string): never {
    this.exit(ExitCode.TEST_SUITE_LOADING_ERROR, message ?? 'Failed to load test suite.', 'error');
  }

  /**
   * Exits when one or more API calls fail.
   * @param message Optional error message to log.
   * @throws This method terminates the process with `ExitCode.API_CALL_FAILURE`.
   */
  apiCallFailure(message?: string): never {
    this.exit(ExitCode.API_CALL_FAILURE, message ?? 'API call failed.', 'error');
  }

  /**
   * Exits when a payload mismatch or contract violation is detected.
   * @param message Optional warning message to log.
   * @throws This method terminates the process with `ExitCode.COMPARISON_FAILURE`.
   */
  comparisonFailure(message?: string): never {
    this.exit(ExitCode.COMPARISON_FAILURE, message ?? 'Payload comparison failed.', 'warn');
  }

  /**
   * Exits when the mock server fails to initialize or respond.
   * @param message Optional error message to log.
   * @throws This method terminates the process with `ExitCode.MOCK_SERVER_ERROR`.
   */
  mockServerError(message?: string): never {
    this.exit(ExitCode.MOCK_SERVER_ERROR, message ?? 'Mock server encountered an error.', 'error');
  }

  /**
   * Internal method for logging messages at the appropriate log level.
   * @param level Log level (`info`, `warn`, `error`)
   * @param message Message to log.
   */
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
