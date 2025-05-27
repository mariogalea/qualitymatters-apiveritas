import { Command } from 'commander';
import { ConfigLoader } from './core/config/ConfigLoader';
import { ApiCaller } from './core/services/ApiCaller';
import { PayloadComparer } from './PayloadComparer';
import { Logger } from './core/utils/Logger';
import path from 'path';
import { PackageInfo } from './core/utils/PackageInfo';
import { ApiTestSuite } from './tests/ApiTestSuite';
import chalk from 'chalk';

const program = new Command();
const version = PackageInfo.getInstance().getVersion();

program
  .name('apiveritas')
  .description('\nA lightweight CLI tool for API contract testing')
  .version(version);

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
    const payloadsPath = config.payloadsPath;

    logger.info('\n  Payloads storage:  ' + payloadsPath + '\n');

  });

program
  .command('reports-path')
  .description('Show where HTML reports are stored')
  .action(() => {
    const reportsPath = config.reportsPath;

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
  .command('set-config')
  .description('Update one or more config values')
  .option('--strictSchema <boolean>', 'Enable or disable strict schema validation (true/false)')
  .option('--strictValues <boolean>', 'Enable or disable strict values validation (true/false)')
  .option('--tolerateEmptyResponses <boolean>', 'Enable or disable tolerance for empty responses (true/false)')
  .option('--payloadsPath <path>', 'Set a new path for payload storage')
  .option('--reportsPath <path>', 'Set a new path for reports')
  .action((options) => {
    const changes: any = {};

    if (options.strictSchema !== undefined) {
      changes.strictSchema = options.strictSchema === 'true';
    }

    if (options.strictValues !== undefined) {
      changes.strictValue = options.strictSchema === 'false';
    }

    if (options.payloadsPath !== undefined) {
      changes.payloadsPath = options.payloadsPath;
    }

    if (options.reportsPath !== undefined) {
      changes.reportsPath = options.reportsPath;
    }

    if (options.tolerateEmptyResponses !== undefined) {
      changes.tolerateEmptyResponses = options.tolerateEmptyResponses === 'true';
    }

    if (Object.keys(changes).length === 0) {
      console.log('! No changes provided. Use set-config --help for options.\n');
      return;
    }

    ConfigLoader.updateConfig(changes);
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