import { Command } from 'commander';
import { ConfigLoader } from './core/config/ConfigLoader';
import { ApiCaller } from './core/services/ApiCaller';
import { PayloadComparer } from './PayloadComparer';
import { Logger } from './core/utils/Logger';
import fs from 'fs';
import path from 'path';
import packageJson from '../package.json';

const program = new Command();

program
  .name('apiveritas')
  .description('A lightweight CLI tool for API contract testing')
  .version(packageJson.version);

  const logger = new Logger({ level: 'info' });
  const config = ConfigLoader.loadConfig();

program
  .command('test')
  .description('Run all API requests and save responses')
  .action(async () => {
    const requestPath = path.join(process.cwd(), 'src/config/api-tests.json');
    const raw = fs.readFileSync(requestPath, 'utf-8');
    const requests = JSON.parse(raw);

    const caller = new ApiCaller(requests, logger);
    await caller.callAll();
  });

program
  .command('payloads-path')
  .description('Show where the payloads are stored')
  .action(() => {
    const payloadsPath = path.join(process.cwd(), 'payloads');
    logger.info(`Payloads are stored in: ${payloadsPath}`);
  });

program
  .command('reports-path')
  .description('Show where HTML reports are stored')
  .action(() => {
    const reportsPath = path.join(process.cwd(), 'reports');
    logger.info(`Reports are stored in: ${reportsPath}`);
  });

program
  .command('config')
  .description('Show current configuration loaded from config.json')
  .action(() => {
    console.log('Current Configuration:');
    console.log(JSON.stringify(config, null, 2));
  });

program
  .command('compare')
  .description('Compare the two most recent payload folders and show test results')
  .action(() => {
    const comparer = new PayloadComparer(config, logger);
    const folders = comparer.getLatestTwoPayloadFolders();
    if (!folders) return;

    const [oldFolder, newFolder] = folders;
    comparer.compareFolders(oldFolder, newFolder);
  });

program
  .command('run')
  .description('Run tests, compare payloads, and report results')
  .action(async () => {
    logger.info('Running full test and comparison pipeline...');

    const requestPath = path.join(process.cwd(), 'src/config/api-tests.json');
    const raw = fs.readFileSync(requestPath, 'utf-8');
    const requests = JSON.parse(raw);

    const caller = new ApiCaller(requests, logger);
    await caller.callAll();

    const comparer = new PayloadComparer(config, logger);
    const folders = comparer.getLatestTwoPayloadFolders();
    if (!folders) return;

    const [oldFolder, newFolder] = folders;
    comparer.compareFolders(oldFolder, newFolder);
  });

program
  .command('notest')
  .description('??')
  .action(() => {
    console.log(`"Say 'what' again. I dare you, I double dare you..." \n— Jules Winnfield, Pulp Fiction`);
    console.log('Just remember, contractual integrity matters. Always.');
  });

program.parse(process.argv);
