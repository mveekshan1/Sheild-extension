# 🤝 Contributing to SHIELD

Thank you for your interest in contributing.

---

## 📌 Scope

This is a hackathon prototype. Keep contributions simple and practical.

---

## 🛠️ Setup

git clone https://github.com/mveekshan1/Sheild-extension.git

Load extension via chrome://extensions → Load Unpacked

---

## ✍️ Guidelines

1. **Fork the repository** on GitHub
2. **Clone your fork** locally:
   ```bash
   git clone https://github.com/mveekshan1/Sheild-extension.git
   cd shield-extension
   ```

---

## 🔄 Workflow

git checkout -b feature/your-feature  
git commit -m "feat: your change"  
git push  

---

## 🐛 Issues

Include steps, expected vs actual, browser version.

---

## ⚠️ Security

Do NOT commit API keys.

---

## 💡 Focus

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

### Web UI Demo Testing

The standalone web demo is located in `docs/` (`index.html`, `styles.css`, `script.js`).
To test the demo locally:
1. Ensure the backend is running locally (`node backend/server.js` on port 3000).
2. Open `docs/index.html` directly in your browser.
3. Click the simulation buttons to verify the AI explanations return correctly.

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
