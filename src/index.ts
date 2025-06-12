import { TestSuiteLoader } from './core/services/TestSuiteLoader';
import { ApiCaller } from './core/services/ApiCaller';
import { PayloadComparer } from './PayloadComparer';
import { ConfigLoader } from './core/config/ConfigLoader';
import path from 'path';

export class ApiVeritas {
  private caller: ApiCaller;
  private comparer: PayloadComparer;
  private config: any;
  private configLoader: ConfigLoader;


  constructor() {
    const testFilePath = path.join(process.cwd(), 'tests', 'bookings.json');
    const testSuite = TestSuiteLoader.loadSuite(testFilePath);

    this.configLoader = new ConfigLoader();  
    this.config = this.configLoader.loadConfig();  
    this.caller = new ApiCaller(testSuite, this.config);
    this.comparer = new PayloadComparer(this.config);
  }

  public async run(reportOnly: boolean = false): Promise<void> {
    if (!reportOnly) {
      await this.caller.callAll();
    }

    const latestFolders = this.comparer.getLatestTwoPayloadFolders();
    if (!latestFolders) {
      console.error('No payload folders found to compare.');
      return;
    }

    const [previous, latest] = latestFolders;
    this.comparer.compareFolders(previous, latest);
  }
}
