/**
 * SHIELD Web Demo Script
 * Interacts with the backend for dynamic URL threat analysis.
 */

document.addEventListener('DOMContentLoaded', () => {
  const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
  
  const BACKEND_URL = isLocalhost 
    ? 'http://localhost:3000/analyze' 
    : 'https://sheild-extension.onrender.com/analyze';

  const analyzeForm = document.getElementById('analyze-form');
  const urlInput = document.getElementById('url-input');
  const analyzeBtn = document.querySelector('.analyze-btn');
  const statusIndicator = document.getElementById('status-indicator');
  const riskScoreDisplay = document.getElementById('risk-score');
  const severityLevelDisplay = document.getElementById('severity-level');
  const issuesList = document.getElementById('issues-list');
  const explanationBox = document.getElementById('explanation-box');

  analyzeForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const targetUrl = urlInput.value.trim();
    if (!targetUrl) return;

    await analyzeThreat(targetUrl);
  });

  async function analyzeThreat(targetUrl) {
    // UI Update - Loading State
    urlInput.disabled = true;
    analyzeBtn.disabled = true;
    analyzeBtn.innerHTML = `⏳ Analyzing...`;
    statusIndicator.className = 'status-indicator loading';
    
    riskScoreDisplay.textContent = '...';
    severityLevelDisplay.textContent = 'ANALYZING';
    severityLevelDisplay.className = 'severity-display';
    issuesList.innerHTML = `<li class="placeholder-text">Scanning structural and network layers...</li>`;
    explanationBox.innerHTML = `<p class="placeholder-text">Connecting to Gemini AI Engine (${isLocalhost ? 'Local' : 'Remote'})...</p>`;

    try {
      // POST Request to backend API
      const response = await fetch(BACKEND_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: targetUrl })
      });

      if (!response.ok) {
        let errMessage = `Backend Error (${response.status})`;
        try {
          const errData = await response.json();
          if(errData.error) errMessage += `: ${errData.error}`;
        } catch(e) {}
        throw new Error(errMessage);
      }

      const data = await response.json();
      
      // Calculate severity string
      let severityStr = 'SAFE';
      let severityClass = 'safe';
      if (data.risk_score > 60) {
        severityStr = 'HIGH';
        severityClass = 'high';
      } else if (data.risk_score > 30) {
        severityStr = 'MEDIUM';
        severityClass = 'medium';
      }

      // Update UI with Success state
      statusIndicator.className = 'status-indicator success';
      riskScoreDisplay.textContent = data.risk_score;
      severityLevelDisplay.textContent = severityStr;
      severityLevelDisplay.className = `severity-display ${severityClass}`;
      
      // Render Issues List
      issuesList.innerHTML = '';
      if (data.issues && data.issues.length > 0) {
        data.issues.forEach(issue => {
          const li = document.createElement('li');
          li.textContent = issue;
          issuesList.appendChild(li);
        });
      } else {
        issuesList.innerHTML = `<li class="placeholder-text">No technical issues detected.</li>`;
      }
      
      // Render Gemini Explanation
      explanationBox.innerHTML = `<p class="response-text">${data.explanation || "No explanation provided."}</p>`;
      
    } catch (error) {
      // Handle Network/Backend Errors gracefully
      statusIndicator.className = 'status-indicator error';
      riskScoreDisplay.textContent = '—';
      severityLevelDisplay.textContent = 'ERROR';
      severityLevelDisplay.className = 'severity-display high';
      
      issuesList.innerHTML = `<li class="placeholder-text">Scan aborted due to connection failure.</li>`;
      
      explanationBox.innerHTML = `
        <div class="error-text">
          <p><strong>Connection Failed:</strong> ${error.message}</p>
          <p style="margin-top: 10px; font-size: 0.9em;">
            <em>Note: The requested AI backend API at <code>${BACKEND_URL}</code> could not be reached. 
            If running locally, verify your Express backend is active on port 3000.</em>
          </p>
        </div>
      `;
    } finally {
      // Restore Button State
      urlInput.disabled = false;
      analyzeBtn.disabled = false;
      analyzeBtn.innerHTML = `🔍 Analyze URL`;
    }
  }
});
