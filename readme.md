# ApiVeritas

ApiVeritas is a consumer-driven contract testing tool that adopts a black-box approach, enabling consumers to independently verify API contract integrity. 
> It focuses on schema and data validation to ensure that APIs meet the expectations of their consumers.

**Work In Progress**  
This project is currently under active development. Features and APIs may change, and documentation is being updated continuously.  
>Please use with caution and feel free to contribute or provide feedback!

## Features

- **Consumer-Driven Contract Testing**: Allows consumers to define and verify API contracts without requiring access to the provider's codebase.
- **Schema Validation**: Ensures that API responses conform to predefined schemas.
- **Data Validation**: Verifies that the data returned by APIs meets specified constraints and expectations.

## Installation

To install ApiVeritas, clone the repository and install the necessary dependencies:

```bash
git clone https://github.com/mariogalea/qualitymatters-apiveritas.git
cd qualitymatters-apiveritas
npm install
```

## Usage
ApiVeritas allows you to define consumer expectations and validate API responses against those expectations through a series of steps:

#### Define your API contract tests
Create JSON test suites specifying the expected schema and response characteristics.

#### Capture API responses
Use the tool to call the target APIs and save actual responses for comparison.

#### Run validation
ApiVeritas compares the actual API responses against the defined contracts, checking schema integrity, data types, and response status codes.

#### Review reports
After running tests, generate detailed HTML reports highlighting any mismatches or contract violations.

## Commands

```bash
  test [options]        Run all API requests and save responses
  list-tests            List all available JSON test files in the tests/ folder
  payloads-path         Show where the payloads are stored
  reports-path          Show where HTML reports are stored
  config                Show current configuration loaded from config.json
  set-config [options]  Update one or more config values
  compare [options]     Compare the two most recent payload folders and show test results
  run [options]         Run tests, compare payloads, and report results
  notest                A little surprise inspired by Pulp Fiction
  help [command]        display help for command
```

## License

ApiVeritas is licensed under the [MIT License](https://opensource.org/licenses/MIT).



