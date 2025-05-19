import fs from 'fs';
import path from 'path';

export class ResponseSaver {
  private timestampFolder: string;

  constructor() {
    const now = new Date();
   const timestamp = `${now.getFullYear()}.${(now.getMonth() + 1)
  .toString()
  .padStart(2, '0')}.${now.getDate().toString().padStart(2, '0')}.${now
  .getHours()
  .toString()
  .padStart(2, '0')}${now.getMinutes().toString().padStart(2, '0')}${now
  .getSeconds()
  .toString()
  .padStart(2, '0')}`;
    this.timestampFolder = path.join(process.cwd(), 'payloads', timestamp);
    this.ensureFolderExists(this.timestampFolder);
  }

  private ensureFolderExists(folderPath: string) {
    if (!fs.existsSync(folderPath)) {
      fs.mkdirSync(folderPath, { recursive: true });
    }
  }

  saveResponse(name: string, data: any): void {
    const filePath = path.join(this.timestampFolder, `${name}.json`);
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
    console.log(`💾 Saved: ${filePath}`);
  }

  getFolderName(): string {
    return path.basename(this.timestampFolder);
  }
  
}
