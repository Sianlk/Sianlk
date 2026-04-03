# Contributing Guide

Thank you for your interest in contributing! Please follow these guidelines to ensure a smooth process.

## Code of Conduct

Be respectful and constructive. Harassment or abusive behavior will not be tolerated.

## Getting Started

### Prerequisites
- Node.js ≥ 20 (for React Native / Expo)
- Python ≥ 3.12 (for FastAPI backend)
- Docker & Docker Compose
- Expo CLI: `npm install -g expo-cli eas-cli`

### Local Setup
```bash
# Clone the repo
git clone https://github.com/Sianlk/<repo>.git
cd <repo>

# Install JS dependencies
npm install

# Install Python dependencies
pip install -r requirements.txt

# Copy environment variables
cp .env.example .env
# Edit .env with your values

# Start development (mobile + backend)
npm run start          # Expo dev server
uvicorn app.main:app --reload   # FastAPI backend
```

## Development Workflow

### Branching Strategy
- `main` — production-ready code (protected)
- `feat/<name>` — new features
- `fix/<name>` — bug fixes
- `chore/<name>` — maintenance, deps
- `docs/<name>` — documentation only

### Commit Convention
Follow [Conventional Commits](https://www.conventionalcommits.org/):
```
feat: add user authentication
fix: resolve login crash on iOS 17
chore(deps): bump fastapi to 0.115.0
docs: update API reference
```

### Making Changes
1. Fork the repository
2. Create a branch: `git checkout -b feat/my-feature`
3. Make your changes
4. Run tests: `pytest && jest`
5. Lint: `ruff check . && eslint .`
6. Commit: `git commit -m "feat: my feature"`
7. Push: `git push origin feat/my-feature`
8. Open a Pull Request against `main`

## Testing

### Backend (Python)
```bash
pytest --cov=app tests/
```

### Mobile (React Native)
```bash
npm test
npm run test:e2e       # Detox E2E (if configured)
```

### Type Checking
```bash
mypy app/             # Python
npx tsc --noEmit      # TypeScript
```

## Code Style

### Python
- Formatter: `ruff format .`
- Linter: `ruff check .`
- Type checker: `mypy`
- Line length: 100

### TypeScript / JavaScript
- Formatter: Prettier (via `.prettierrc`)
- Linter: ESLint (via `.eslintrc`)
- Follow React Native best practices

## Pull Request Guidelines

- One feature/fix per PR
- Reference the related issue (`Closes #123`)
- All CI checks must pass
- PR template must be filled out

## Reporting Bugs

Use the [Bug Report issue template](.github/ISSUE_TEMPLATE/bug_report.md).
Include: steps to reproduce, expected vs actual behavior, environment details.

## Proposing Features

Use the [Feature Request issue template](.github/ISSUE_TEMPLATE/feature_request.md).
Explain the problem it solves and how it should work.

## Security

Please do **not** open public issues for security vulnerabilities.
See [SECURITY.md](SECURITY.md) for responsible disclosure.

## License

By contributing, you agree that your contributions will be licensed under the same license as this project.
