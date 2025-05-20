#!/usr/bin/env node

import { Command } from 'commander';
import { ApiVeritas } from './index';
import path from 'path';
import { Logger } from './core/utils/Logger';

const logger = new Logger();

const program = new Command();

program
  .name('apiveritas')
  .description('Run API contract validation')
  .version('1.0.0')
  .option('-c, --config <path>', 'Specify config file path')
  .option('-r, --report', 'Generate report only, skip API calls')
  .parse(process.argv);

const options = program.opts();

if (options.config) {
  process.env.APIVERITAS_CONFIG = path.resolve(options.config);
  logger.info(`Using config file: ${process.env.APIVERITAS_CONFIG}`);
}

const app = new ApiVeritas();

app.run(options.report).catch((err) => {
  logger.error(`Error running ApiVeritas: ${err instanceof Error ? err.message : err}`);
});
