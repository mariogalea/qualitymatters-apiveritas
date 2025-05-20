import chalk from 'chalk';

export type LogLevel = 'info' | 'warn' | 'error' | 'debug';

interface LoggerOptions {
  level?: LogLevel;
  silent?: boolean;
}

export class Logger {
  private level: LogLevel;
  private silent: boolean;

  constructor(options: LoggerOptions = {}) {
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
      // Using simple unicode info character with blue color and indent
      console.log(chalk.blue('ℹ') + '  ' + message);
    }
  }

  warn(message: string): void {
    if (this.shouldLog('warn')) {
      // Warning triangle unicode with bright yellow, indent to stand out more
      console.warn(chalk.yellowBright('⚠') + '   ' + chalk.yellow(message));
    }
  }

  error(message: string): void {
    if (this.shouldLog('error')) {
      // Cross mark unicode with red color, indent
      console.error(chalk.red('✗') + '  ' + chalk.red(message));
    }
  }

  debug(message: string): void {
    if (this.shouldLog('debug')) {
      // Bug unicode with gray color, indent
      console.log(chalk.gray('🐞') + '  ' + chalk.gray(message));
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
