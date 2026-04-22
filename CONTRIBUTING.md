# 🤝 Contributing to SHIELD

Thank you for your interest in contributing to SHIELD! We welcome contributions from developers of all skill levels. This document provides guidelines and information to help you get started.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Workflow](#development-workflow)
- [Coding Standards](#coding-standards)
- [Testing](#testing)
- [Submitting Changes](#submitting-changes)
- [Reporting Issues](#reporting-issues)
- [Documentation](#documentation)

## Code of Conduct

This project follows a code of conduct to ensure a welcoming environment for all contributors. By participating, you agree to:

- Be respectful and inclusive
- Focus on constructive feedback
- Accept responsibility for mistakes
- Show empathy towards other contributors
- Help create a positive community

## Getting Started

### Prerequisites

- Node.js 14+ and npm 6+
- Google Chrome or Chromium browser
- Git
- A code editor (VS Code recommended)

### Setup

1. **Fork the repository** on GitHub
2. **Clone your fork** locally:
   ```bash
   git clone https://github.com/mveekshan1/Sheild-extension.git
   cd shield-extension
   ```

3. **Install dependencies**:
   ```bash
   npm install
   ```

4. **Set up environment variables**:
   ```bash
   cp .env.example .env
   # Edit .env with your Gemini API key
   ```

5. **Load the extension** in Chrome:
   - Open `chrome://extensions/`
   - Enable "Developer mode"
   - Click "Load unpacked"
   - Select the project root directory

## Development Workflow

### Branching Strategy

- `main`: Production-ready code
- `develop`: Integration branch for features
- `feature/*`: New features
- `bugfix/*`: Bug fixes
- `hotfix/*`: Critical fixes for production

### Development Process

1. **Create a feature branch**:
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make your changes** following our coding standards

3. **Test your changes**:
   ```bash
   npm run lint
   npm run build
   ```

4. **Test the extension** manually using the demo guide

5. **Commit your changes**:
   ```bash
   git add .
   git commit -m "feat: add your feature description"
   ```

6. **Push and create a pull request**:
   ```bash
   git push origin feature/your-feature-name
   ```

## Coding Standards

### JavaScript Style

- Use ES6+ features
- 2 spaces for indentation
- Single quotes for strings
- Semicolons always
- Descriptive variable and function names
- JSDoc comments for functions

### File Structure

```
src/
├── background/     # Service worker code
├── content/        # Content scripts
├── popup/          # Popup UI
└── services/       # External service integrations
```

### Naming Conventions

- **Functions**: camelCase (`analyzeThreat()`)
- **Variables**: camelCase (`threatScore`)
- **Constants**: UPPER_SNAKE_CASE (`MAX_THREATS`)
- **Classes**: PascalCase (`ThreatAnalyzer`)
- **Files**: kebab-case (`threat-analyzer.js`)

### Code Quality

- Run ESLint before committing: `npm run lint`
- Fix linting issues: `npm run lint:fix`
- Write self-documenting code
- Add comments for complex logic
- Keep functions small and focused

## Testing

### Manual Testing

Use the demo guide (`docs/demo.md`) for comprehensive testing:

1. **Unit Testing**: Test individual functions
2. **Integration Testing**: Test component interactions
3. **End-to-End Testing**: Test complete user workflows
4. **Security Testing**: Test threat detection accuracy

### Automated Testing

```bash
# Run linting
npm run lint

# Build the extension
npm run build

# Package for distribution
npm run package
```

## Submitting Changes

### Pull Request Process

1. **Ensure your code passes all checks**:
   - Linting passes
   - Build succeeds
   - Manual testing completed

2. **Update documentation** if needed:
   - README.md for user-facing changes
   - docs/ for technical documentation
   - Code comments for implementation details

3. **Write a clear PR description**:
   - What changes were made
   - Why the changes were needed
   - How to test the changes
   - Any breaking changes

4. **Request review** from maintainers

### Commit Message Format

Use conventional commits:

```
type(scope): description

[optional body]

[optional footer]
```

Types:
- `feat`: New features
- `fix`: Bug fixes
- `docs`: Documentation
- `style`: Code style changes
- `refactor`: Code refactoring
- `test`: Testing
- `chore`: Maintenance

Examples:
```
feat: add real-time threat analysis
fix: resolve memory leak in background worker
docs: update API documentation
```

## Reporting Issues

### Bug Reports

When reporting bugs, please include:

- **Clear title** describing the issue
- **Steps to reproduce** the problem
- **Expected behavior** vs actual behavior
- **Environment details**: OS, browser version, extension version
- **Screenshots or console logs** if applicable
- **Severity level**: Critical, High, Medium, Low

### Feature Requests

For new features, please provide:

- **Clear description** of the proposed feature
- **Use case** and benefits
- **Implementation ideas** if you have them
- **Mockups or examples** if applicable

## Documentation

### Types of Documentation

- **README.md**: Project overview and setup
- **docs/architecture.md**: Technical architecture
- **docs/demo.md**: Testing and demonstration
- **Code comments**: Implementation details
- **API documentation**: Service interfaces

### Documentation Standards

- Use Markdown for all documentation
- Include code examples where helpful
- Keep screenshots up to date
- Use consistent formatting
- Write for both technical and non-technical audiences

## Recognition

Contributors will be recognized in:
- GitHub contributors list
- CHANGELOG.md for significant contributions
- Project documentation
- Community acknowledgments

## Getting Help

- **Issues**: Use GitHub issues for bugs and features
- **Discussions**: Use GitHub discussions for questions
- **Documentation**: Check docs/ folder first
- **Community**: Join our Discord/Slack (when available)

Thank you for contributing to SHIELD! Your efforts help make the internet safer for everyone. 🛡️
