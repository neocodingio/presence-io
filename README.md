# Attendance Tracker

A React application for tracking class attendance built with Vite.

## Features!

- User authentication with Supabase
- Attendance tracking for multiple subjects
- Statistics and streak tracking
- Modern UI with Tailwind CSS

## Development

### Prerequisites

- Node.js 25.3.0 or higher
- npm

### Setup

1. Install dependencies:
```bash
npm install
```

2. Create a `.env` file with your Supabase credentials:
```
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

3. Start the development server:
```bash
npm run dev
```

## Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint with all rules including secret detection
- `npm run lint:secrets` - Run ESLint focused on secret detection
- `npm test` - Run unit tests
- `npm run test:ui` - Run tests with UI

## Security

### Secret & Vulnerability Scanning

This project uses professional security tools separate from linting:

- **Secret Scanning**: Uses [Gitleaks](https://github.com/gitleaks/gitleaks) to detect hardcoded secrets, passwords, API keys, and tokens in all file types and git history
- **Vulnerability Scanning**: Uses `npm audit` to check for known vulnerabilities in dependencies

**Important**: Never commit secrets or credentials to the repository. Always use environment variables for sensitive data.

### Running Security Scans

```bash
# Scan for hardcoded secrets in all files and git history
npm run security:scan

# Scan only staged files (useful for pre-commit hooks)
npm run security:scan:staged

# Check for vulnerabilities in dependencies
npm run security:audit

# Run both security checks
npm run security:check
```

### Gitleaks Features

Gitleaks detects:
- API keys (Stripe, Supabase, AWS, etc.)
- Passwords and authentication tokens
- JWT tokens
- Database connection strings with credentials
- Private keys
- GitHub tokens, Slack tokens, and 100+ other secret types
- Scans both current files and git commit history

**Configuration**: See `.gitleaks.toml` for custom rules and allowlists.

**Note**: Gitleaks scans git history, so it can find secrets that were committed in the past, even if they've been removed from current files.

## Testing

The project includes unit tests using Vitest and React Testing Library. Run tests with:

```bash
npm test
```

## CI/CD

This project uses GitHub Actions for continuous integration. The workflow runs automatically on every pull request and push to main branches.

### CI Pipeline

The CI pipeline includes the following checks (each as a separate status check):

1. **Build** - Installs dependencies and builds the project
2. **Lint** - Runs ESLint to check code quality (only runs if build succeeds)
3. **Unit Tests** - Runs all unit tests (only runs if build succeeds)
4. **Secret Detection** - Scans for hardcoded secrets using Gitleaks (only runs if build succeeds)

All checks must pass before a PR can be merged (if branch protection is enabled).

### CI Workflow

The CI workflow is defined in `.github/workflows/ci.yml` and runs on:
- Pull requests to `main`, `master`, or `develop` branches
- Pushes to `main`, `master`, or `develop` branches

### CD Pipeline (Continuous Delivery)

The CD workflow automatically deploys to EC2 when code is merged to `main` or `master` branches.

**Deployment Steps:**
1. Pulls latest code from repository
2. Installs/updates dependencies (`npm ci`)
3. Builds the application (`npm run build`)
4. Restarts PM2 process (`attendance`) to load new code

**Workflow File**: `.github/workflows/cd.yml`

**Self-Hosted Runner:**
This workflow runs on a self-hosted GitHub Actions runner (`web-app`) that is already configured on the EC2 server. No SSH configuration or secrets are required.

**Note**: The runner must be registered and running on the EC2 instance for deployments to work.

**PM2 Process:**
The deployment expects a PM2 process named `attendance` running on the EC2 server. If the process doesn't exist, it will be started automatically.

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.
