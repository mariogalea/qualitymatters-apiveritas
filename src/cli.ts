import { Command } from 'commander';
import { ConfigLoader } from './core/config/ConfigLoader';
import { ApiCaller } from './core/services/ApiCaller';
import { PayloadComparer } from './PayloadComparer';
import { Logger } from './core/utils/Logger';
import path from 'path';
import { PackageInfo } from './core/utils/PackageInfo';
import { TestSuiteLoader } from './core/services/TestSuiteLoader';
import chalk from 'chalk';

const program = new Command();
const version = PackageInfo.getInstance().getVersion();

program
  .name('apiveritas')
  .description('\nA lightweight CLI tool for API contract testing')
  .version(version)
  .showHelpAfterError('(add --help for additional info)');

const logger = new Logger({ level: 'info' });
const config = ConfigLoader.loadConfig();

// --- test command ---
program
  .command('test')
  .description('Run all API requests and save responses')
  .requiredOption('--tests <file>', 'Specify the test suite JSON file')
  .action(async (options, command) => {
    const testFile = options.tests;
    if (!testFile) {
      logger.error(chalk.red('❌ Missing required option: --tests <file>\n'));
      command.help({ error: true });
      return;
    }

    logger.info(chalk.cyan(`\n  Loading test file:  tests/${testFile}\n`));

    let requests;
    try {
      requests = TestSuiteLoader.loadSuite(testFile);
    } catch (err) {
      logger.error(chalk.red(`❌ Failed to load test suite: ${testFile}\n`));
      logger.error(chalk.red(`-> Make sure the file exists and contains valid JSON.`));
      return;
    }

    const caller = new ApiCaller(requests, logger);
    await caller.callAll();
  });

// --- list-tests command ---
program
  .command('list-tests')
  .description('List all available JSON test files in the tests/ folder')
  .action(() => {
    const testFiles = TestSuiteLoader.listAvailableSuites();
    if (testFiles.length === 0) {
      logger.info(chalk.yellow('No test files found in the tests/ directory.\n'));
    } else {
      logger.info(chalk.green('Available test suites:\n'));
      testFiles.forEach((file) => {
        logger.info(`  - ${chalk.white(file)}`);
      });
      console.log();
    }
  });

// --- payloads-path command ---
program
  .command('payloads-path')
  .description('Show where the payloads are stored')
  .action(() => {
    const payloadsPath = config.payloadsPath;
    logger.info(chalk.cyan('\n  Payloads storage:  ') + chalk.white(payloadsPath) + '\n');
  });

// --- reports-path command ---
program
  .command('reports-path')
  .description('Show where HTML reports are stored')
  .action(() => {
    const reportsPath = config.reportsPath;
    logger.info(chalk.cyan('\n  Reports storage:  ') + chalk.white(reportsPath) + '\n');
  });

// --- config command ---
program
  .command('config')
  .description('Show current configuration loaded from config.json')
  .action(() => {
    const configPath = path.resolve(process.cwd(), 'src/config/config.json');

    logger.info(chalk.white('\n  Configuration file: ') + chalk.white.bold(configPath) + '\n');

    const maxKeyLength = Math.max(...Object.keys(config).map(key => key.length));

    Object.entries(config).forEach(([key, value]) => {
      const paddedKey = key.padEnd(maxKeyLength, ' ');
      logger.info(`${chalk.white(paddedKey)} : ${chalk.green.bold(String(value))}`);
    });

    console.log(); // For spacing
  });

// --- set-config command ---
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
      changes.strictValues = options.strictValues === 'true';  
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
      logger.info(chalk.yellow('! No changes provided. Use set-config --help for options.\n'));
      return;
    }

    ConfigLoader.updateConfig(changes);
    logger.info(chalk.green('\n✅ Configuration updated successfully!\n'));
  });

// --- compare command ---
program
  .command('compare')
  .description('Compare the two most recent payload folders and show test results')
  .requiredOption('--testSuite <name>', 'Name of the test suite folder to compare')
  .action((options, command) => {
    const testSuite = options.testSuite;
    if (!testSuite) {
      logger.error(chalk.red('❌ Missing required option: --testSuite <name>\n'));
      command.help({ error: true });
      return;
    }

    const comparer = new PayloadComparer(config, logger);
    const folders = comparer.getLatestTwoPayloadFolders();

    if (!folders) {
      logger.error(chalk.red('❌ Could not find two payload folders to compare.\n'));
      logger.info(chalk.yellow('-> Make sure you have at least two payload runs saved in your payloads directory.\n'));
      return;
    }

    const [oldFolder, newFolder] = folders;
    comparer.compareFolders(oldFolder, newFolder, testSuite);
  });

// --- run command ---
program
  .command('run')
  .description('Run tests, compare payloads, and report results')
  .requiredOption('--tests <file>', 'Specify the test suite JSON file')
  .requiredOption('--testSuite <name>', 'Name of the test suite folder to compare')
  .action(async (options, command) => {
    const testFile = options.tests;
    const testSuite = options.testSuite;

    if (!testFile) {
      logger.error(chalk.red('❌ Missing required option: --tests <file>\n'));
      command.help({ error: true });
      return;
    }
    if (!testSuite) {
      logger.error(chalk.red('❌ Missing required option: --testSuite <name>\n'));
      command.help({ error: true });
      return;
    }

    logger.info(chalk.cyan('\nRunning full test and comparison...\n'));

    let requests;
    try {
      requests = TestSuiteLoader.loadSuite(testFile);
    } catch (err) {
      logger.error(chalk.red(`❌ Failed to load test suite: ${testFile}\n`));
      logger.error(chalk.red('-> Make sure the file exists and contains valid JSON.\n'));
      return;
    }

    const caller = new ApiCaller(requests, logger);
    await caller.callAll();

    const comparer = new PayloadComparer(config, logger);
    const folders = comparer.getLatestTwoPayloadFolders();

    if (!folders) {
      logger.error(chalk.red('❌ Could not find two payload folders to compare.\n'));
      logger.info(chalk.yellow('-> Make sure you have at least two payload runs saved in your payloads directory.\n'));
      return;
    }

    const [oldFolder, newFolder] = folders;
    comparer.compareFolders(oldFolder, newFolder, testSuite);
  });

// --- notest command (fun) ---
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

// --- Unknown command handler ---
program.on('command:*', (operands) => {
  logger.error(chalk.red(`❌ Unknown command: ${operands.join(' ')}\n`));
  program.help({ error: true });
});

program.parse(process.argv);
