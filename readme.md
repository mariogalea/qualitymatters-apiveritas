# ApiVeritas

ApiVeritas is a consumer-driven contract testing tool that adopts a black-box approach, enabling consumers to independently verify API contract integrity. 

It focuses on schema and data validation to ensure that APIs meet the expectations of their consumers.

**Work In Progress**  
This project is currently under active development. Features and APIs may change, and documentation is being updated continuously. Project is also intended to be an npm package for global usage.

Please use with caution and feel free to contribute or provide feedback!

## Features

- **Consumer-Driven Contract Testing**: Allows consumers to define and verify API contracts without requiring access to the provider's codebase.
- **Schema Validation**: Ensures that API responses conform to predefined schemas.
- **Data Validation**: Verifies that the data returned by APIs meets specified constraints and expectations.

## Installation

To install ApiVeritas, clone the repository and install the necessary dependencies:

```bash
git clone https://github.com/mariogalea/qualitymatters-apiveritas.git
cd qualitymatters-apiveritas
npm install -g 
npm run build
npm link
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

## Usage

Run the CLI with the command:

```bash
apiveritas <command> [options]
```

---

## Commands

### test

Run all API requests defined in a test suite JSON file and save the responses.

```bash
apiveritas test --tests <test-suite-file>
```

Example:

```bash
apiveritas test --tests bookings.json
```

If mock server mode is enabled, the test suite will default to `mock.json`.

---

### list-tests

List all available JSON test files in the `tests/` directory.

```bash
apiveritas list-tests
```

---

### payloads-path

Show the current path where payloads are stored.

```bash
apiveritas payloads-path
```

---

### reports-path

Show the current path where HTML reports are stored.

```bash
apiveritas reports-path
```

---

### config

Display the current loaded configuration from `config.json`.

```bash
apiveritas config
```

---

### set-config

Update configuration values interactively or via flags.

Options:

- `--strictSchema <boolean>`: Enable/disable strict schema validation
- `--strictValues <boolean>`: Enable/disable strict values validation
- `--tolerateEmptyResponses <boolean>`: Enable/disable tolerance for empty responses
- `--payloadsPath <path>`: Set a new path for payload storage
- `--reportsPath <path>`: Set a new path for reports
- `--baseUrl <url>`: Set the base URL for API calls
- `--enableMockServer <boolean>`: Enable mock server mode (`true` or `false`)

Example:

```bash
apiveritas set-config --strictSchema true --baseUrl http://localhost:8080
```

---

### compare

Compare the two most recent payload folders for a given test suite and report differences.

```bash
apiveritas compare --testSuite <name>
```

Example:

```bash
apiveritas compare --testSuite bookings
```

---

### run

Run a full workflow: execute API calls, save responses, and compare the latest payload folders.

```bash
apiveritas run --tests <test-suite-file> --testSuite <name>
```

Example:

```bash
apiveritas run --tests bookings.json --testSuite bookings
```

If mock server mode is enabled, the test suite will default to `mock.json`.

---

### notest

A fun easter egg inspired by *Pulp Fiction*.

```bash
apiveritas notest
```

---

## Configuration File

Located at `src/config/config.json`. Use the `config` and `set-config` commands to view and update.

---

## Mock Server Mode

When enabled (`enableMockServer: true`), ApiVeritas runs an internal mock server and uses `mock.json` test suite by default. This allows testing without a live API.

---

## Exit Codes

ApiVeritas uses the following exit codes to indicate the result of CLI operations. This helps with scripting, CI pipelines, and automated monitoring.

| Exit Code | Meaning                                   |
|-----------|-------------------------------------------|
| 0         | Success                                   |
| 1         | General error (unexpected)                |
| 2         | Missing or invalid arguments              |
| 3         | Configuration error                       |
| 4         | Test suite loading error                  |
| 5         | API call failure                          |
| 6         | Comparison failure (payload diff found)   |
| 7         | Mock server error                         |


## Author

Mario Galea

---


## License

ApiVeritas is licensed under the [MIT License](https://opensource.org/licenses/MIT).



