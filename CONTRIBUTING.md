# Contributing to AuraTune

Thank you for your interest in contributing to AuraTune!

## Getting Started

1. Fork the repository
2. Clone your fork: `git clone https://github.com/YOUR_USERNAME/auratune.git`
3. Install dependencies: `npm install`
4. Create a branch: `git checkout -b feature/your-feature-name`

## Development Workflow

```bash
# Start development server
npm run dev

# Run tests
npm run test

# Build for production
npm run build

# Sync with Android
npx cap sync android
```

## Code Style

- Use TypeScript for all new code
- Follow existing component patterns (shadcn/ui style)
- Use Tailwind CSS for styling
- Add aria-labels for accessibility
- Document complex logic with comments

## Pull Request Process

1. Update README.md if needed
2. Ensure tests pass
3. Update documentation for any new features
4. Request review from maintainers

## Commit Messages

Use conventional commits:
- `feat: add new feature`
- `fix: resolve bug`
- `docs: update documentation`
- `refactor: improve code structure`
- `test: add tests`

## Questions?

Open an issue or reach out to the maintainers.
