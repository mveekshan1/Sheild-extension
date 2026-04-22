# 🛡️ SHIELD — Real-Time Browser Threat Detection

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![Platform](https://img.shields.io/badge/Platform-Chrome%20Extension-blue)](https://developer.chrome.com/)
[![AI](https://img.shields.io/badge/AI-Google%20Gemini-4285F4)](https://ai.google.dev/)

> Real-time detection of suspicious browser behavior with AI-assisted explanations.

---

## 🚧 Project Status

This project is currently in the **prototype stage** for the  
**Google Solution Challenge 2026 (Build with AI)**.

- Core detection (network + DOM) implemented  
- Real-time monitoring functional  
- Gemini AI integration working  
- Under active development  

---

## 🎯 Problem

Browser extensions operate with high permissions, but users:

- have no visibility into extension behavior  
- cannot detect suspicious activity in real time  

---

## 💡 Solution

SHIELD is a Chrome extension that:

- monitors browser behavior in real time  
- detects suspicious network requests and DOM injections  
- assigns a risk score  
- uses Google Gemini AI to explain threats  

---

## ⚙️ Features

- Network monitoring (`chrome.webRequest`)  
- DOM monitoring (`MutationObserver`)  
- Rule-based risk scoring  
- Gemini AI explanation  
- Real-time alert popup  

---

## 🏗️ Architecture

Browser Activity → Detection → Risk Scoring → Gemini → Alert

---

## 📦 Installation

git clone https://github.com/mveekshan1/Sheild-extension.git

Open chrome://extensions → Enable Developer Mode → Load Unpacked

---

## 🔑 Gemini API Setup

Edit gemini.js and add your API key.

⚠️ Do NOT commit your API key

---

## ⚠️ Limitations

- Cannot access internal logic of other extensions  
- Detection based on observable behavior only  

---

## 🛠️ Tech Stack

- Chrome Extension  
- JavaScript  
- Google Gemini API  

---
## 🤝 Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md) for contribution guidelines.

## 🤝 Contributing

See CONTRIBUTING.md

---

## 📄 License

MIT License

---
## 👨‍💻 Team — AI PROMPTERs

[![Team Leader, System Design & Chrome Extension Development](https://img.shields.io/badge/Team%20Leader-mveekshan1-blue?style=for-the-badge&logo=github)](https://github.com/mveekshan1)

[![AI Developer, Gemini Integration & Threat Analysis](https://img.shields.io/badge/AI%20Developer-sakshi--kumari28-green?style=for-the-badge&logo=github)](https://github.com/sakshi-kumari28)

