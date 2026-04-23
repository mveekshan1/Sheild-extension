/**
 * SHIELD Web Demo Script
 * Sends an entered URL to the backend API and renders the real risk report.
 */

document.addEventListener('DOMContentLoaded', () => {
  const BACKEND_URL = window.location.hostname === 'localhost'
    ? 'http://localhost:3000/analyze'
    : 'https://sheild-extension.onrender.com/analyze';

  const analyzeForm = document.getElementById('analyze-form');
  const urlInput = document.getElementById('urlInput');
  const analyzeBtn = document.getElementById('analyzeBtn');
  const resultContainer = document.getElementById('resultContainer');
  const riskScore = document.getElementById('riskScore');
  const issuesList = document.getElementById('issuesList');
  const explanation = document.getElementById('explanation');
  const loading = document.getElementById('loading');
  const messageBox = document.getElementById('messageBox');

  analyzeForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    clearMessage();

    const userInput = urlInput.value.trim();
    const validatedUrl = validateUrl(userInput);
    if (!validatedUrl) return;

    await sendAnalysisRequest(validatedUrl);
  });

  function validateUrl(input) {
    if (!input) {
      showMessage('Please enter a website URL before analyzing.', 'error');
      return null;
    }

    try {
      const parsedUrl = new URL(input);
      return parsedUrl.href;
    } catch (error) {
      showMessage('Please enter a valid URL with http:// or https://.', 'error');
      return null;
    }
  }

  function showMessage(message, type = 'info') {
    messageBox.textContent = message;
    messageBox.className = `message-box ${type}`;
  }

  function clearMessage() {
    messageBox.textContent = '';
    messageBox.className = 'message-box';
  }

  function setLoading(isLoading) {
    loading.classList.toggle('hidden', !isLoading);
    analyzeBtn.disabled = isLoading;
    urlInput.disabled = isLoading;
  }

  function renderIssues(issues = []) {
    issuesList.textContent = '';

    if (!Array.isArray(issues) || issues.length === 0) {
      const listItem = document.createElement('li');
      listItem.textContent = 'No issues detected for this URL.';
      listItem.className = 'placeholder-text';
      issuesList.appendChild(listItem);
      return;
    }

    issues.forEach((issue) => {
      const listItem = document.createElement('li');
      listItem.textContent = issue;
      issuesList.appendChild(listItem);
    });
  }

  function renderResults(data) {
    const score = Number(data.risk_score);
    const isValidScore = Number.isFinite(score);

    resultContainer.classList.remove('hidden');
    riskScore.textContent = isValidScore ? score.toString() : '—';
    riskScore.className = `risk-score ${score > 60 ? 'high' : score > 30 ? 'medium' : 'safe'}`;

    renderIssues(data.issues);
    explanation.textContent = data.explanation || 'No explanation returned from the backend.';
  }

  async function sendAnalysisRequest(url) {
    setLoading(true);
    resultContainer.classList.add('hidden');
    showMessage('Sending URL to backend for analysis…', 'info');

    try {
      const response = await fetch(BACKEND_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.error || `Server returned ${response.status}`);
      }

      const responseData = await response.json();
      renderResults(responseData);
      showMessage('Analysis complete.', 'success');
    } catch (error) {
      showMessage(`Unable to analyze URL: ${error.message}`, 'error');
    } finally {
      setLoading(false);
    }
  }
});
