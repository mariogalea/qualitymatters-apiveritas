import path from 'path';

export class PathValidator {

  private static riskyRoots = ['/', '/etc', '/bin', '/boot', '/sys', '/proc'];

  /**
   * Checks if a given path is suspicious (e.g., points to critical system folders)
   */
  static isSuspiciousPath(p: string): boolean {
    const normalized = path.resolve(p).toLowerCase();

    return this.riskyRoots.some(root =>
      normalized === root || normalized.startsWith(root + path.sep)
    );
  }

  /**
   * Validates a folder path string from config.
   * If path is missing, empty, or suspicious, returns fallbackPath.
   * Otherwise returns resolved absolute path.
   * 
   * @param folderPath - user-configured path (can be relative or absolute)
   * @param fallbackPath - path to use if folderPath invalid or unsafe
   * @param label - config key name for logging/warnings
   * @param logger - optional logger with .warn(msg)
   * @returns resolved safe path string
   */
  static validateFolderPath(
    folderPath: string | undefined,
    fallbackPath: string,
    label: string,
    logger?: { warn: (msg: string) => void }
  ): string {
    if (!folderPath || folderPath.trim() === '') {
      logger?.warn(`Config: ${label} not set or empty. Using default: ${fallbackPath}`);
      return fallbackPath;
    }

    const resolved = path.resolve(folderPath);

    if (this.isSuspiciousPath(resolved)) {
      logger?.warn(`Config: ${label} path "${resolved}" is suspicious or unsafe. Using default: ${fallbackPath}`);
      return fallbackPath;
    }

    return resolved;
  }
}
