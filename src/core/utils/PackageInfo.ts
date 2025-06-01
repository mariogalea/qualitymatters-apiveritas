/**
 * @file PackageInfo.
 * @author Mario Galea
 * @description
 * Singleton class for reading and exposing metadata from the root `package.json` file.
 * This is useful for logging the tool name, version, or description in CLI output, reports, etc.
 * The shape of the `package.json` is defined by the shared `IPackageJson` interface.
 * 
 */

import fs from 'fs';
import path from 'path';
import { IPackageJson } from '../../interfaces/IPackageJson';

/**
 * Singleton class that provides access to metadata from the root `package.json` file.
 */
export class PackageInfo {
  private static instance: PackageInfo; // Singleton instance
  private data: IPackageJson;           // Parsed package.json content

  /**
   * Private constructor ensures only one instance is created.
   * Loads and parses the root `package.json` at module load time.
   */
  private constructor() {
    const packageJsonPath = path.resolve(__dirname, '../../../package.json');
    
    // Read and parse package.json synchronously (expected at startup)
    const rawData = fs.readFileSync(packageJsonPath, 'utf-8');
    this.data = JSON.parse(rawData);
  }

  /**
   * Returns the singleton instance of `PackageInfo`.
   *
   * @returns {PackageInfo} The single, shared instance.
   */
  public static getInstance(): PackageInfo {
    if (!PackageInfo.instance) {
      PackageInfo.instance = new PackageInfo();
    }
    return PackageInfo.instance;
  }

  /**
   * Gets the package name (from `name` field in package.json).
   *
   * @returns {string} The package name.
   */
  public getName(): string {
    return this.data.name;
  }

  /**
   * Gets the package version (from `version` field in package.json).
   *
   * @returns {string} The version string (e.g., "1.0.0").
   */
  public getVersion(): string {
    return this.data.version;
  }

  /**
   * Gets the optional package description.
   *
   * @returns {string | undefined} The description text if available.
   */
  public getDescription(): string | undefined {
    return this.data.description;
  }

  /**
   * Gets the raw parsed content of `package.json`.
   *
   * @returns {IPackageJson} The full package.json object.
   */
  public getRaw(): IPackageJson {
    return this.data;
  }
}
