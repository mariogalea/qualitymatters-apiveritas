import { ApiCaller } from './ApiCaller';
import { PayloadComparer } from './PayloadComparer';
import { ConfigLoader } from './ConfigLoader';
import { ApiTestSuite } from './ApiTestSuite';

export class ApiVerifierApp {
  
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

  public async run(): Promise<void> {
    await this.caller.callAll();

    const latestFolders = this.comparer.getLatestTwoPayloadFolders();
    if (!latestFolders) {
      console.error('No payload folders found to compare.');
      return;
    }

    const [previous, latest] = latestFolders;
    this.comparer.compareFolders(previous, latest);
  }
}

// Bootstrapping the app
(async () => {
  const app = new ApiVerifierApp();
  await app.run();
})();
