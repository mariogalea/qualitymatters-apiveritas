export class BasicComparator {
  compare(oldData: any, newData: any, pathPrefix: string = ''): string[] {
    const diffs: string[] = [];

    for (const key in oldData) {
      const fullPath = pathPrefix ? `${pathPrefix}.${key}` : key;

      if (!(key in newData)) {
        diffs.push(`Missing key in new data: ${fullPath}`);
        continue;
      }

      if (typeof oldData[key] !== typeof newData[key]) {
        diffs.push(`Type mismatch at ${fullPath}: expected ${typeof oldData[key]}, got ${typeof newData[key]}`);
        continue;
      }

      if (typeof oldData[key] === 'object' && oldData[key] !== null) {
        diffs.push(...this.compare(oldData[key], newData[key], fullPath));
      } else if (oldData[key] !== newData[key]) {
        diffs.push(`Value mismatch at ${fullPath}: "${oldData[key]}" vs "${newData[key]}"`);
      }
    }

    return diffs;
  }
}
