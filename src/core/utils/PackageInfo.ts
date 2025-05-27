import fs from 'fs';
import path from 'path';

interface PackageJson {
  name: string;
  version: string;
  description?: string;
  dependencies?: Record<string, string>;
  devDependencies?: Record<string, string>;
  [key: string]: any;
}

export class PackageInfo {
  private static instance: PackageInfo;
  private data: PackageJson;

  private constructor() {
    const packageJsonPath = path.resolve(__dirname, '../../../package.json');
    const rawData = fs.readFileSync(packageJsonPath, 'utf-8');
    this.data = JSON.parse(rawData);
  }

  public static getInstance(): PackageInfo {
    if (!PackageInfo.instance) {
      PackageInfo.instance = new PackageInfo();
    }
    return PackageInfo.instance;
  }

  public getName(): string {
    return this.data.name;
  }

  public getVersion(): string {
    return this.data.version;
  }

  public getDescription(): string | undefined {
    return this.data.description;
  }

  public getRaw(): PackageJson {
    return this.data;
  }
}
