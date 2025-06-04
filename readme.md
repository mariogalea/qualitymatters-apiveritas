
[![license](https://img.shields.io/npm/l/apiveritas.svg)](https://github.com/mariogalea/qualitymatters-apiveritas/blob/main/LICENSE)
[![Last Commit](https://img.shields.io/github/last-commit/mariogalea/qualitymatters-apiveritas.svg)](https://github.com/mariogalea/qualitymatters-apiveritas)

**ApiVeritas** — because your contracts should tell the truth.

---

## ✨ Feature Highlights

- 🧪 Validate API responses against JSON schemas
- 📂 Compare production vs development payloads
- 📝 Configurable via `config.json`
- 📊 Generate human-friendly HTML reports
- 🔁 CI/CD-friendly workflow
- 🧱 Built with TypeScript and OOP principles
- 🧪 Optional mock server for isolated testing

---

## 📦 Installation

```bash
npm install -g apiveritas
```

---

## 🚀 Usage

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

- `--strictSchema <boolean>`
- `--strictValues <boolean>`
- `--tolerateEmptyResponses <boolean>`
- `--payloadsPath <path>`
- `--reportsPath <path>`
- `--baseUrl <url>`
- `--enableMockServer <boolean>`

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

## ⚙️ Configuration File

Located at `src/config/config.json`. Use the `config` and `set-config` commands to view and update.

---

## 🧪 Mock Server Mode

When enabled (`enableMockServer: true`), ApiVeritas runs an internal mock server and uses `mock.json` test suite by default. This allows testing without a live API.

---

## ✅ CI Setup Snippet (GitHub Actions)

```yaml
name: CI

on:
  push:
    branches: [ main ]

jobs:
  verify-contracts:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'

      - name: Install dependencies
        run: npm ci

      - name: Install ApiVeritas globally
        run: npm install -g .

      - name: Run contract tests
        run: apiveritas run --tests mock.json --testSuite mock
```


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

---

## 👨‍💻 Author

Mario Galea – [GitHub](https://github.com/mariogalea)

---

## 📄 License

MIT © 2025 Mario Galea
