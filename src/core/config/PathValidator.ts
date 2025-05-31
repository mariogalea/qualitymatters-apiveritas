/**
 * @file PathValidator.
 * @author Mario Galea
 * @description
 * Provides safety checks and resolution logic for user-specified folder paths.
 * Ensures configuration paths are not empty, malformed, or pointing to sensitive system directories.
 * This module protects against accidental misconfiguration that could overwrite or access critical files.
 */

import path from 'path';

/**
 * PathValidator validates folder paths used in the ApiVeritas config.
 * It prevents the use of dangerous or inappropriate system paths and ensures
 * that all folder paths used in the tool are safe and well-formed.
 */
export class PathValidator {
  /**
   * List of system-critical root paths considered unsafe to write into or use as output folders.
   */
  private static riskyRoots = ['/', '/etc', '/bin', '/boot', '/sys', '/proc'];

  /**
   * Determines if the given path is suspicious and potentially harmful (e.g., a system directory).
   * This prevents users from accidentally targeting critical areas of the filesystem.
   *
   * @param {string} p - Path to evaluate
   * @returns {boolean} True if the path is deemed risky
   */
  static isSuspiciousPath(p: string): boolean {
    const normalized = path.resolve(p).toLowerCase();

    return this.riskyRoots.some(root =>
      normalized === root || normalized.startsWith(root + path.sep)
    );
  }

  /**
   * Validates and resolves a folder path from the configuration.
   * If the path is empty, undefined, or suspicious, a fallback path is used instead.
   * Logs a warning when falling back, if a logger is provided.
   *
   * @param {string | undefined} folderPath - The path string provided by the user (relative or absolute)
   * @param {string} fallbackPath - The default path to use if validation fails
   * @param {string} label - Label used in logging to identify the setting (e.g., "payloadsPath")
   * @param {{ warn: (msg: string) => void }} [logger] - Optional logger with a `warn` method
   * @returns {string} A safe and validated absolute path
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
