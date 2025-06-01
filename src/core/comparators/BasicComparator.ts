/**
 * @file BasicComparator.ts
 * @author Mario Galea
 * @description
 * Provides a simple recursive comparison of two JSON-like objects,
 * optionally enforcing strict value matching.
 */

export class BasicComparator {
  private strictValues: boolean;

  /**
   * Creates an instance of BasicComparator.
   *
   * @param strictValues - If true, value mismatches are considered differences; otherwise, they are flagged but tolerated.
   */
  constructor(strictValues: boolean = true) {
    this.strictValues = strictValues;
  }

  /**
   * Recursively compares two JSON-like objects and returns an array of human-readable difference strings.
   *
   * @param oldData - The original (expected) data object.
   * @param newData - The new (actual) data object to compare against the original.
   * @param pathPrefix - Internal use for recursion; tracks the nested path of the current key being compared.
   * @returns An array of difference messages. Empty if objects match (under configured tolerance).
   */
  compare(oldData: any, newData: any, pathPrefix: string = ''): string[] {
    const diffs: string[] = [];

    if (typeof oldData !== 'object' || oldData === null) {
      diffs.push(`X Old data is not a valid object at ${this.formatPath(pathPrefix)}. Got: ${JSON.stringify(oldData)}`);
      return diffs;
    }

    if (typeof newData !== 'object' || newData === null) {
      diffs.push(`X New data is not a valid object at ${this.formatPath(pathPrefix)}. Got: ${JSON.stringify(newData)}`);
      return diffs;
    }

    for (const key in oldData) {
      const fullPath = pathPrefix ? `${pathPrefix}.${key}` : key;

      if (!(key in newData)) {
        diffs.push(`Missing key in new data: ${fullPath}`);
        continue;
      }

      if (typeof oldData[key] !== typeof newData[key]) {
        diffs.push(
          `Type mismatch at ${fullPath}: expected ${typeof oldData[key]}, got ${typeof newData[key]}`
        );
        continue;
      }

      if (typeof oldData[key] === 'object' && oldData[key] !== null) {
        diffs.push(...this.compare(oldData[key], newData[key], fullPath));
      } else if (oldData[key] !== newData[key]) {
        if (this.strictValues) {
          diffs.push(`X Value mismatch at ${fullPath}: "${oldData[key]}" vs "${newData[key]}"`);
        } else {
          diffs.push(`IGNORED:: ! Value mismatch at ${fullPath}: "${oldData[key]}" vs "${newData[key]}"`);
        }
      }
    }

    return diffs;
  }

  /**
   * Formats a path for display. If the path is empty, returns a root symbol.
   *
   * @param path - The current nested key path.
   * @returns A formatted string path or `#` if root.
   */
  private formatPath(path: string): string {
    return path || '#';
  }
}
