export class BasicComparator {
  private strictValues: boolean;

  constructor(strictValues: boolean = true) {
    this.strictValues = strictValues;
  }



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

  private formatPath(path: string): string {
     return path || '#';
  }
}
