export class BasicComparator {
  private strictValues: boolean;

  constructor(strictValues: boolean = true) {
    this.strictValues = strictValues;
  }

  compare(oldData: any, newData: any, pathPrefix: string = ''): string[] {
    const diffs: string[] = [];

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
          diffs.push(`Value mismatch at ${fullPath}: "${oldData[key]}" vs "${newData[key]}"`);
        } else {
          console.warn(`⚠️  Ignored value mismatch at ${fullPath}: "${oldData[key]}" vs "${newData[key]}"`);
        }
      }
    }

    return diffs;
  }
}
