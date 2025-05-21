import { Command } from 'commander';
import { ConfigLoader } from './core/config/ConfigLoader';
import { ApiCaller } from './core/services/ApiCaller';
import { PayloadComparer } from './PayloadComparer';
import { Logger } from './core/utils/Logger';
import path from 'path';
import packageJson from '../package.json';
import { ApiTestSuite } from './tests/ApiTestSuite';
import chalk from 'chalk';

const program = new Command();

program
  .name('apiveritas')
  .description('\nA lightweight CLI tool for API contract testing')
  .version(packageJson.version);

  const logger = new Logger({ level: 'info' });
  const config = ConfigLoader.loadConfig();

program
  .command('test')
  .description('Run all API requests and save responses')
  .action(async () => {
    const testFileName = 'ApiTestSuite.ts';
    const testFilePath = path.join(process.cwd(), 'src', 'tests', testFileName);

    logger.info('\n  Test File:  ' + testFilePath);

    const testSuite = new ApiTestSuite();
    const requests = testSuite.getApis();

    const caller = new ApiCaller(requests, logger);
    await caller.callAll();
  });

program
  .command('payloads-path')
  .description('Show where the payloads are stored')
  .action(() => {
    const payloadsPath = path.join(process.cwd(), 'payloads');

    logger.info('\n  Payloads storage:  ' + payloadsPath + '\n');

  });

program
  .command('reports-path')
  .description('Show where HTML reports are stored')
  .action(() => {
    const reportsPath = path.join(process.cwd(), 'reports');

    logger.info('\n  Reports storage:  ' + reportsPath + '\n');

  });


program
  .command('config')
  .description('Show current configuration loaded from config.json')
  .action(() => {
    const configPath = path.resolve(process.cwd(), 'src/config/config.json');

    logger.info(`${chalk.white('\n  Configuration file:')} ${chalk.white(configPath)}\n`);

    const maxKeyLength = Math.max(...Object.keys(config).map(key => key.length));

    Object.entries(config).forEach(([key, value]) => {
      const paddedKey = key.padEnd(maxKeyLength, ' ');
      logger.info(`${chalk.white(paddedKey)} : ${chalk.white.bold(String(value))}`);
    });

    console.log(); // For spacing
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

    const testSuite = new ApiTestSuite();
    const requests = testSuite.getApis();

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
  .description('A little surprise inspired by Pulp Fiction')
  .action(() => {
    console.log(
      chalk.bold.yellow(
        `\n"Say 'what' again. I dare you, I double dare you..."`,
      ),
    );
    console.log(chalk.gray('— Jules Winnfield, Pulp Fiction\n'));
    console.log(
      chalk.cyanBright(
        'Just remember, contractual integrity matters. Always.\n',
      ),
    );
  });

program.parse(process.argv);