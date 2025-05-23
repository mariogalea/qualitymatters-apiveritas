import { ApiCaller } from './core/services/ApiCaller';
import { PayloadComparer } from './PayloadComparer';
import { ConfigLoader } from './core/config/ConfigLoader';
import { ApiTestSuite } from './tests/ApiTestSuite';



export class ApiVeritas {
  
  private testSuite: ApiTestSuite;
  private caller: ApiCaller;
  private comparer: PayloadComparer;
  private config: any;

  constructor() {
    this.testSuite = new ApiTestSuite();
    this.caller = new ApiCaller(this.testSuite.getApis());

    this.config = ConfigLoader.loadConfig();
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



