/**
 * @file Logger.ts
 * @author Mario Galea
 * @description
 * Provides a simple colored console logger with support for log levels (`debug`, `info`, `warn`, `error`)
 * and optional silent mode. Supports boxed messages for emphasis (e.g., headers, summaries).
 * Uses `chalk` for styling console output.
 */

import chalk from 'chalk';
import { ILoggerOptions, LogLevel } from '../../interfaces/ILoggerOptions';

/**
 * A lightweight, color-coded logger with support for log levels and silent mode.
 */
export class Logger {
  private level: LogLevel;
  private silent: boolean;

  /**
   * Creates a new Logger instance.
   *
   * @param options - Optional logger configuration.
   * - `level`: Minimum log level to display (`debug` < `info` < `warn` < `error`)
   * - `silent`: If `true`, disables all logging output
   */
  constructor(options: ILoggerOptions = {}) {
    this.level = options.level || 'info';
    this.silent = options.silent || false;
  }

  /**
   * Determines whether a message of the given level should be logged,
   * based on the configured `level` and `silent` flag.
   *
   * @param level - The severity level of the message.
   * @returns `true` if the message should be logged; otherwise `false`.
   */
  private shouldLog(level: LogLevel): boolean {
    const levels: LogLevel[] = ['debug', 'info', 'warn', 'error'];
    return (
      !this.silent &&
      levels.indexOf(level) >= levels.indexOf(this.level)
    );
  }

  /**
   * Logs a plain white message at `info` level.
   *
   * @param message - The message to log.
   */
  info(message: string): void {
    if (this.shouldLog('info')) {
      console.log(chalk.white('  ' + message));
    }
  }

  /**
   * Logs a yellow warning message at `warn` level.
   *
   * @param message - The message to log.
   */
  warn(message: string): void {
    if (this.shouldLog('warn')) {
      console.warn(chalk.yellow('  ' + message));
    }
  }

  /**
   * Logs a red error message at `error` level.
   *
   * @param message - The message to log.
   */
  error(message: string): void {
    if (this.shouldLog('error')) {
      console.error(chalk.red('  ' + message));
    }
  }

  /**
   * Logs a grey debug message at `debug` level.
   *
   * @param message - The message to log.
   */
  debug(message: string): void {
    if (this.shouldLog('debug')) {
      console.log(chalk.grey('  ' + message));
    }
  }

  /**
   * Logs a boxed and optionally titled message block.
   *
   * Useful for drawing attention to important output (headers, test results, etc.).
   *
   * @param message - The multiline message to print.
   * @param title - Optional title to show above the box, styled in cyan.
   */
  boxed(message: string, title?: string): void {
    if (!this.silent) {
      const line = '-'.repeat(50);
      const boxTitle = title ? chalk.cyan.bold(title) + '\n' + line + '\n' : '';

      // Pad each line of the message
      const paddedMessage = message
        .split('\n')
        .map(line => '  ' + line)
        .join('\n');

      console.log(`\n${boxTitle}${paddedMessage}\n${line}\n`);
    }
  }
}
