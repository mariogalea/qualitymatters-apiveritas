/**
 * @file PathResolver.ts
 * @author Mario Galea
 * @description Utility class to resolve paths from the project root or other locations.
 */

import path from 'path';

export class PathResolver {
    
  private readonly rootDir: string;

  constructor() {
    // Assumes this file is at dist/core/utils after transpilation
    this.rootDir = path.resolve(__dirname, '..', '..', '..');
  }

  /**
   * Resolve a path relative to the project root.
   * @param segments Path segments to append to the root.
   */
  public fromRoot(...segments: string[]): string {
    return path.resolve(this.rootDir, ...segments);
  }

  /**
   * Resolve a path relative to the `dist` directory (for runtime assets like templates).
   * @param segments Path segments under dist
   */
  public fromDist(...segments: string[]): string {
    return path.resolve(this.rootDir, 'dist', ...segments);
  }

  /**
   * Resolve path to the templates directory inside dist.
   */
  public templatesDir(): string {
    return this.fromDist('templates');
  }

  /**
   * Resolve path to the templates directory relative to the *runtime* location,
   * based on the __dirname of this file. This is important for global installed package usage.
   */
  public templatesDirRuntime(): string {
    // __dirname here is dist/core/utils after compilation,
    // so templates folder is typically located at dist/templates, 
    // so we go up two levels and into templates:
    return path.resolve(__dirname, '..', '..', 'templates');
  }

  /**
   * Resolve a path relative to a custom base directory.
   * @param baseDir The base directory.
   * @param segments Additional path segments.
   */
  public from(baseDir: string, ...segments: string[]): string {
    return path.resolve(baseDir, ...segments);
  }
}
