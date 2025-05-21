export type LogLevel = 'info' | 'warn' | 'error' | 'debug';

export interface ILoggerOptions {
  level?: LogLevel;
  silent?: boolean;
}