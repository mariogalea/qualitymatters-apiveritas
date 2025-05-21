// Logger.ts
import chalk from 'chalk';
import { ILoggerOptions, LogLevel } from '../../interfaces/ILoggerOptions';

export class Logger {
  private level: LogLevel;
  private silent: boolean;

  constructor(options: ILoggerOptions = {}) {
    this.level = options.level || 'info';
    this.silent = options.silent || false;
  }

  private shouldLog(level: LogLevel): boolean {
    const levels: LogLevel[] = ['debug', 'info', 'warn', 'error'];
    return (
      !this.silent &&
      levels.indexOf(level) >= levels.indexOf(this.level)
    );
  }

  info(message: string): void {
    if (this.shouldLog('info')) {
      console.log(chalk.white('  ' + message));
    }
  }

  warn(message: string): void {
    if (this.shouldLog('warn')) {
      console.warn(chalk.yellow('  ' + message));
    }
  }

  error(message: string): void {
    if (this.shouldLog('error')) {
      console.error(chalk.red('  ' + message));
    }
  }

  debug(message: string): void {
    if (this.shouldLog('debug')) {
      console.log(chalk.grey('  ' + message));
    }
  }

  boxed(message: string, title?: string): void {
    if (!this.silent) {
      const line = '-'.repeat(50);
      const boxTitle = title ? chalk.cyan.bold(title) + '\n' + line + '\n' : '';
      const paddedMessage = message
        .split('\n')
        .map(line => '  ' + line)
        .join('\n');
      console.log(`\n${boxTitle}${paddedMessage}\n${line}\n`);
    }
  }
}
