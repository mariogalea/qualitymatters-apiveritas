/**
 * @file cli.ts
 * @author Mario Galea
 * @description
 * Entry point for the ApiVeritas CLI tool.
 * Provides a set of commands for API contract testing, comparison, reporting, and configuration.
 * 
 */

import { Command } from 'commander';
import { ConfigLoader } from './core/config/ConfigLoader';
import { ApiCaller } from './core/services/ApiCaller';
import { PayloadComparer } from './PayloadComparer';
import { Logger } from './core/utils/Logger';
import path from 'path';
import { PackageInfo } from './core/utils/PackageInfo';
import { TestSuiteLoader } from './core/services/TestSuiteLoader';
import chalk from 'chalk';
import { MockServer } from './core/services/MockServer';

const program = new Command();
const version = PackageInfo.getInstance().getVersion();

program
  .name('apiveritas')
  .description('\nA lightweight CLI tool for API contract testing')
  .version(version)
  .showHelpAfterError('(add --help for additional info)');

const logger = new Logger({ level: 'info' });
const config = ConfigLoader.loadConfig();

/**
 * Run API tests by executing requests defined in a test suite.
 * Saves responses to timestamped payload folders.
 * Supports mock server mode.
 * 
 * @example
 * // Run tests with a given test suite JSON file
 * $ apiveritas test --tests bookings.json
 * 
 * @example
 * // Run tests in mock server mode (mock.json is forced)
 * $ apiveritas test --tests mock.json
 */
program
  .command('test')
  .description('Run all API requests and save responses')
  .requiredOption('--tests <file>', 'Specify the test suite JSON file')
  .action(async (options, command) => {
    let testFile = options.tests;

    if (config.enableMockServer) {
      logger.info('\n  Mock server mode enabled.');
      if (options.tests && options.tests !== 'mock.json') {
        logger.warn(`Ignoring passed test file "${options.tests}" — using "mock.json" due to enableMockServer=true`);
      }
      testFile = 'mock.json';
    } else if (!testFile) {
      logger.error(chalk.red('❌ Missing required option: --tests <file>\n'));
      command.help({ error: true });
      return;
    }

    let mockServer: MockServer | undefined;
    if (config.enableMockServer) {
      mockServer = new MockServer();
      await mockServer.start();
    }

    logger.info(chalk.cyan(`\n  Loading test suite: tests/${testFile}\n`));

    let requests;
    try {
      requests = TestSuiteLoader.loadSuite(testFile, config);
    } catch (err) {
      logger.error(chalk.red(`❌ Failed to load test suite: ${testFile}\n`));
      logger.error(chalk.red(`-> Make sure the file exists and contains valid JSON.`));
      if (mockServer) await mockServer.stop();
      return;
    }

    const caller = new ApiCaller(requests, logger, config.baseUrl);
    await caller.callAll();

    if (mockServer) await mockServer.stop();
  });

/**
 * List all JSON test suite files in the `tests/` directory.
 * 
 * @example
 * $ apiveritas list-tests
 */
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

/**
 * Show the current path where payloads are stored.
 * 
 * @example
 * $ apiveritas payloads-path
 */
program
  .command('payloads-path')
  .description('Show where the payloads are stored')
  .action(() => {
    const payloadsPath = config.payloadsPath;
    logger.info(chalk.cyan('\n  Payloads storage:  ') + chalk.white(payloadsPath) + '\n');
  });

/**
 * Show the current path where HTML reports are stored.
 * 
 * @example
 * $ apiveritas reports-path
 */
program
  .command('reports-path')
  .description('Show where HTML reports are stored')
  .action(() => {
    const reportsPath = config.reportsPath;
    logger.info(chalk.cyan('\n  Reports storage:  ') + chalk.white(reportsPath) + '\n');
  });

/**
 * Display the current loaded configuration from `config.json`.
 * 
 * @example
 * $ apiveritas config
 */
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

/**
 * Update configuration values interactively.
 * 
 * @example
 * // Enable strict schema validation and update base URL
 * $ apiveritas set-config --strictSchema true --baseUrl https://api.example.com
 * 
 * @example
 * // Disable mock server mode
 * $ apiveritas set-config --enableMockServer false
 */
program
  .command('set-config')
  .description('Update one or more config values')
  .option('--strictSchema <boolean>', 'Enable or disable strict schema validation (true/false)')
  .option('--strictValues <boolean>', 'Enable or disable strict values validation (true/false)')
  .option('--tolerateEmptyResponses <boolean>', 'Enable or disable tolerance for empty responses (true/false)')
  .option('--payloadsPath <path>', 'Set a new path for payload storage')
  .option('--reportsPath <path>', 'Set a new path for reports')
  .option('--baseUrl <url>', 'Set the base URL for API calls') 
  .option('--enableMockServer <boolean>', 'Run the Application in Mock Server Mode (tests/mock.json). All responses are sent to http://mockserver:3000') 
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
    if (options.baseUrl !== undefined) {
      changes.baseUrl = options.baseUrl;
    }
    if (options.enableMockServer !== undefined) {
      changes.enableMockServer = options.enableMockServer === 'true';
    }

    if (Object.keys(changes).length === 0) {
      logger.info(chalk.yellow('! No changes provided. Use set-config --help for options.\n'));
      return;
    }

    ConfigLoader.updateConfig(changes);
    logger.info(chalk.green('\n✅ Configuration updated successfully!\n'));
  });

/**
 * Compare two latest payload folders for a given test suite.
 * Reports schema/value differences.
 * 
 * @example
 * $ apiveritas compare --testSuite bookings
 */
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

/**
 * Run a full workflow:
 * - Execute API calls from a test suite
 * - Save responses
 * - Compare latest payload folders for differences
 * 
 * @example
 * $ apiveritas run --tests bookings.json --testSuite bookings
 */
program
  .command('run')
  .description('Run tests, compare payloads, and report results')
  .requiredOption('--tests <file>', 'Specify the test suite JSON file')
  .requiredOption('--testSuite <name>', 'Name of the test suite folder to compare')
  .action(async (options, command) => {
    let testFile = options.tests;
    const testSuite = options.testSuite;

    if (config.enableMockServer) {
      logger.info('\n  Mock server mode enabled.');
      
      if (options.tests && options.tests !== 'mock.json') {
        logger.warn(`Ignoring passed test file "${options.tests}" — using "mock.json" due to enableMockServer=true`);
      }

      testFile = 'mock.json';
    }

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

    let mockServer: MockServer | undefined;
    if (config.enableMockServer) {
      mockServer = new MockServer();
      await mockServer.start();
    }

    let requests;
    try {
      requests = TestSuiteLoader.loadSuite(testFile, config);
    } catch (err) {
      logger.error(chalk.red(`❌ Failed to load test suite: ${testFile}\n`));
      logger.error(chalk.red('-> Make sure the file exists and contains valid JSON.\n'));
      if (mockServer) await mockServer.stop();
      return;
    }

    const caller = new ApiCaller(requests, logger, config.baseUrl);
    await caller.callAll();

    const comparer = new PayloadComparer(config, logger);
    const folders = comparer.getLatestTwoPayloadFolders();

    if (!folders) {
      logger.error(chalk.red('❌ Could not find two payload folders to compare.\n'));
      logger.info(chalk.yellow('-> Make sure you have at least two payload runs saved in your payloads directory.\n'));
      if (mockServer) await mockServer.stop();
      return;
    }

    const [oldFolder, newFolder] = folders;
    comparer.compareFolders(oldFolder, newFolder, testSuite);

    if (mockServer) await mockServer.stop();
  });

/**
 * A fun easter egg inspired by Pulp Fiction.
 * 
 * @example
 * $ apiveritas notest
 */
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

/**
 * Handler for unknown commands.
 */
program.on('command:*', (operands) => {
  logger.error(chalk.red(`❌ Unknown command: ${operands.join(' ')}\n`));
  program.help({ error: true });
});

program.parse(process.argv);