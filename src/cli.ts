// cli.ts or CliRunner.ts
import { ApiVeritas } from './index'; // or './ApiVeritas' if preferred

(async () => {
  const app = new ApiVeritas();
  await app.run();
})();