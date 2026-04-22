# 🛡️ SHIELD - Real-Time Browser Threat Detection

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Chrome Web Store](https://img.shields.io/badge/Chrome-Extension-blue.svg)](https://chrome.google.com/webstore)
[![Google Gemini](https://img.shields.io/badge/Google-Gemini-4285F4.svg)](https://ai.google.dev/)

> **Real-time browser security monitoring powered by Google Gemini AI**

SHIELD is an intelligent Chrome extension that detects suspicious browser behavior in real-time, analyzes threats using advanced AI, and provides actionable security insights to protect users from malicious extensions and network attacks.

## 📋 Table of Contents

- [🚀 Features](#-features)
- [🎯 Problem Statement](#-problem-statement)
- [💡 Solution Overview](#-solution-overview)
- [🏗️ Architecture](#️-architecture)
- [📦 Installation](#-installation)
- [🔧 Setup](#-setup)
- [🧪 Demo](#-demo)
- [📖 Documentation](#-documentation)
- [🛠️ Tech Stack](#️-tech-stack)
- [🔮 Future Improvements](#-future-improvements)
- [🤝 Contributing](#-contributing)
- [📄 License](#-license)

## 🚀 Features

### 🔍 **Real-Time Threat Detection**
- **Network Monitoring**: Detects suspicious network requests (unknown domains, IP addresses, high-frequency requests)
- **DOM Injection Detection**: Identifies malicious script and iframe injections
- **Risk Scoring Engine**: Calculates threat severity using configurable scoring rules

### 🤖 **AI-Powered Analysis**
- **Google Gemini Integration**: Uses advanced AI to analyze and explain detected threats
- **Intelligent Explanations**: Provides context about security implications and potential risks
- **Smart Caching**: Optimizes API usage with intelligent response caching

### 🛡️ **Security Controls**
- **Extension Management**: Allows users to disable suspicious extensions
- **Real-Time Alerts**: Instant notifications when threats are detected
- **Privacy-Focused**: Local analysis with minimal data transmission

### 🎨 **User Experience**
- **Intuitive Interface**: Clean, modern popup interface with real-time updates
- **Risk Visualization**: Color-coded risk levels (Low/Medium/High)
- **Detailed Threat Information**: Comprehensive threat details and analysis

## 🎯 Problem Statement

Modern web browsers are vulnerable to various security threats:

- **Malicious Extensions**: Rogue extensions can inject scripts, steal data, or redirect traffic
- **Network Attacks**: Suspicious network requests can exfiltrate data or connect to command servers
- **DOM Manipulation**: Malicious scripts can inject harmful content into web pages
- **Lack of Visibility**: Users have no real-time insight into browser security threats

Current solutions are either too technical for average users or lack the intelligence to distinguish between legitimate and malicious behavior.

## 💡 Solution Overview

SHIELD addresses these challenges through:

1. **Intelligent Monitoring**: Continuous analysis of browser behavior patterns
2. **AI-Powered Analysis**: Google Gemini provides expert-level threat assessment
3. **User-Friendly Interface**: Accessible security controls for all users
4. **Proactive Protection**: Real-time detection and response capabilities

## 🏗️ Architecture

```
SHIELD Extension Architecture
├── 🎯 Background Service Worker
│   ├── Network Request Monitoring (chrome.webRequest)
│   ├── Risk Scoring Engine
│   └── Threat Data Management
│
├── 🔍 Content Scripts
│   ├── DOM Mutation Observer
│   └── Network Request Interception
│
├── 🤖 AI Service Layer
│   ├── Google Gemini API Integration
│   ├── Response Caching System
│   └── Error Handling & Fallbacks
│
└── 🎨 User Interface
    ├── Real-Time Threat Display
    ├── Risk Score Visualization
    └── Extension Management Controls
```

### System Flow

1. **Detection**: Background service and content scripts monitor browser activity
2. **Analysis**: Detected events are analyzed using configurable risk rules
3. **Scoring**: Threats are assigned risk scores based on severity and patterns
4. **AI Analysis**: High-risk threats are analyzed by Google Gemini for detailed explanations
5. **User Notification**: Real-time alerts and controls are presented to the user

## 📦 Installation

### Prerequisites

- **Google Chrome** (v88+ recommended)
- **Google Gemini API Key** (free tier available)

### Chrome Web Store (Recommended)

1. Visit the [Chrome Web Store](https://chrome.google.com/webstore)
2. Search for "SHIELD Threat Detection"
3. Click **"Add to Chrome"**
4. Follow the installation prompts

### Manual Installation (Development)

1. **Clone the repository**:
   ```bash
   git clone https://github.com/yourusername/shield-extension.git
   cd shield-extension
   ```

2. **Open Chrome Extensions**:
   - Navigate to `chrome://extensions/`
   - Enable **"Developer mode"** (top right toggle)

3. **Load the extension**:
   - Click **"Load unpacked"**
   - Select the project root directory
   - The extension will appear in your extensions list

## 🔧 Setup

### 1. Configure Gemini API

1. Visit [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Create a new API key
3. Copy your API key

### 2. Extension Configuration

**Option A: Environment Variables (Development)**
```bash
# Create .env file in project root
echo "GEMINI_API_KEY=your_api_key_here" > .env
```

**Option B: Extension Settings (Production)**
1. Click the SHIELD extension icon
2. Access extension settings
3. Enter your Gemini API key

### 3. Verify Installation

1. Look for the 🛡️ SHIELD icon in your Chrome toolbar
2. Click the icon to open the threat detection dashboard
3. The interface should display "No threats detected. You're safe! ✅"

## 🧪 Demo

### Quick Threat Simulation

SHIELD includes built-in testing capabilities. Open any website and run these commands in the browser console:

#### Network Threat Detection
```javascript
// Simulate suspicious IP address access
fetch('http://192.168.1.100/malicious-endpoint')
```

#### DOM Injection Detection
```javascript
// Simulate malicious script injection
document.body.appendChild(document.createElement('script'))
```

#### Unknown Domain Detection
```javascript
// Simulate access to suspicious domain
fetch('https://suspicious-malware-site-12345.com/api/data')
```

### Demo Scenario

1. **Trigger Threats**: Use the console commands above to simulate attacks
2. **Monitor Detection**: Watch SHIELD detect and analyze the threats in real-time
3. **AI Analysis**: Click "Analyze with Gemini" to see AI-powered threat explanations
4. **Take Action**: Use "Disable Extension" to remove suspicious extensions

### Screenshots

#### Clean State
![Clean Dashboard](docs/screenshots/clean-state.png)

#### Threat Detected
![Threat Alert](docs/screenshots/threat-detected.png)

#### AI Analysis
![Gemini Analysis](docs/screenshots/gemini-analysis.png)

## 📖 Documentation

### 📚 [Architecture Overview](docs/architecture.md)
- Detailed system design and component interactions
- Data flow diagrams and security considerations

### 🎬 [Demo Guide](docs/demo.md)
- Step-by-step demonstration instructions
- Testing scenarios and expected outcomes

### 🔧 API Reference
- Extension message passing protocols
- Configuration options and customization

## 🛠️ Tech Stack

### Core Technologies
- **Chrome Extensions API** (Manifest V3)
- **JavaScript ES6+**
- **Google Gemini AI**

### Key Libraries & APIs
- **chrome.webRequest** - Network monitoring
- **MutationObserver** - DOM change detection
- **chrome.management** - Extension control
- **Fetch API** - AI service communication

### Development Tools
- **Chrome DevTools** - Debugging and testing
- **ESLint** - Code quality
- **Git** - Version control

## 🔮 Future Improvements

### Phase 2 Features
- [ ] **Machine Learning Models**: Advanced threat classification
- [ ] **Behavioral Analysis**: Long-term pattern recognition
- [ ] **Cloud Integration**: Centralized threat intelligence
- [ ] **Multi-Browser Support**: Firefox and Edge extensions

### Phase 3 Features
- [ ] **Enterprise Integration**: SIEM system compatibility
- [ ] **Automated Response**: Intelligent threat mitigation
- [ ] **Privacy Dashboard**: Detailed data usage transparency
- [ ] **Community Features**: Threat sharing and collaboration

### Technical Enhancements
- [ ] **Performance Optimization**: Reduced memory footprint
- [ ] **Advanced Caching**: Predictive threat analysis
- [ ] **Offline Mode**: Local AI model integration
- [ ] **Accessibility**: Screen reader and keyboard navigation

## 🤝 Contributing

We welcome contributions from the security and open-source communities!

### Development Setup

1. **Fork the repository**
2. **Clone your fork**:
   ```bash
   git clone https://github.com/yourusername/shield-extension.git
   ```
3. **Install dependencies**:
   ```bash
   npm install
   ```
4. **Start development**:
   ```bash
   npm run dev
   ```

### Contribution Guidelines

- **Code Style**: Follow ESLint configuration
- **Testing**: Add tests for new features
- **Documentation**: Update docs for API changes
- **Security**: Report security issues privately

### Commit Message Format

```
type(scope): description

[optional body]

[optional footer]
```

Types: `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

### Third-Party Licenses

- **Google Gemini AI**: Subject to [Google AI Terms of Service](https://ai.google.dev/terms)
- **Chrome Extensions**: Subject to [Chrome Web Store Terms](https://chrome.google.com/webstore/terms)

## 🙏 Acknowledgments

- **Google Solutions Challenge** for the inspiration and opportunity
- **Google Gemini Team** for the powerful AI capabilities
- **Chrome Extensions Community** for the robust platform
- **Open Source Security Community** for ongoing collaboration

## 📞 Support

- **Issues**: [GitHub Issues](https://github.com/yourusername/shield-extension/issues)
- **Discussions**: [GitHub Discussions](https://github.com/yourusername/shield-extension/discussions)
- **Security**: Report vulnerabilities to security@shield-extension.com

---

**Built with ❤️ for the Google Solutions Challenge 2024**

*Protecting users, one extension at a time.*