/**
 * SHIELD Web Demo Script
 * Simulates interactions with the backend for threat analysis.
 */

document.addEventListener('DOMContentLoaded', () => {
  // Dynamically configure the backend URL based on environment
  const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
  
  // Use localhost for local dev and a deployed URL placeholder for production
  // Note: For a live public demo, ensure the backend is deployed (e.g. Render/Vercel)
  // and replace the production URL accordingly.
  const BACKEND_URL = isLocalhost 
    ? 'http://localhost:3000/analyze' 
    : 'https://sheild-extension.onrender.com/analyze';

  // Demo Scenarios Payload Simulation
  const SCENARIOS = {
    network: {
      summary: "Network request to suspicious-malware.xyz with risks: High frequency requests (15 in 10s), Unknown domain access",
      score: 85,
      severity: "HIGH"
    },
    dom: {
      summary: "DOM injection detected on example.com - SCRIPT_INJECTION",
      score: 40,
      severity: "MEDIUM"
    },
    cookie: {
      summary: "Cookie session_id@phishing-site.ru with risks: Cookie missing Secure flag, Potential third-party cookie",
      score: 55,
      severity: "MEDIUM"
    }
  };

  const buttons = document.querySelectorAll('.action-btn');
  const statusIndicator = document.getElementById('status-indicator');
  const riskScoreDisplay = document.getElementById('risk-score');
  const severityLevelDisplay = document.getElementById('severity-level');
  const explanationBox = document.getElementById('explanation-box');

  // Add click listeners to all scenario buttons
  buttons.forEach(btn => {
    btn.addEventListener('click', async (e) => {
      const scenarioKey = e.currentTarget.dataset.scenario;
      await simulateThreatAnalysis(scenarioKey, e.currentTarget);
    });
  });

  /**
   * Disables/enables buttons to prevent concurrent requests
   */
  function setButtonsDisabled(disabled) {
    buttons.forEach(btn => btn.disabled = disabled);
  }

  /**
   * Execute the simulation request
   */
  async function simulateThreatAnalysis(scenarioKey, activeBtn) {
    const scenarioData = SCENARIOS[scenarioKey];
    
    // UI Update - Loading State
    setButtonsDisabled(true);
    activeBtn.innerHTML = `⏳ Analyzing...`;
    statusIndicator.className = 'status-indicator loading';
    
    riskScoreDisplay.textContent = '...';
    severityLevelDisplay.textContent = 'ANALYZING';
    severityLevelDisplay.className = 'severity-display';
    explanationBox.innerHTML = `<p class="placeholder-text">Connecting to Gemini AI Engine (${isLocalhost ? 'Local' : 'Remote'})...</p>`;

    try {
      // POST Request to backend API
      const response = await fetch(BACKEND_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ summary: scenarioData.summary })
      });

      if (!response.ok) {
        throw new Error(`Backend Error (${response.status}) - Ensure Server is Running.`);
      }

      const data = await response.json();
      
      // Update UI with Success state
      statusIndicator.className = 'status-indicator success';
      riskScoreDisplay.textContent = scenarioData.score;
      
      severityLevelDisplay.textContent = scenarioData.severity;
      severityLevelDisplay.className = `severity-display ${scenarioData.severity.toLowerCase()}`;
      
      explanationBox.innerHTML = `<p class="response-text">${data.explanation || "No explanation provided."}</p>`;
      
    } catch (error) {
      // Handle Network/Backend Errors gracefully for demo reliability
      statusIndicator.className = 'status-indicator error';
      riskScoreDisplay.textContent = '—';
      severityLevelDisplay.textContent = 'ERROR';
      severityLevelDisplay.className = 'severity-display high';
      
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
      setButtonsDisabled(false);
      
      // Reset button text
      if (scenarioKey === 'network') activeBtn.innerHTML = `🌐 Simulate Network Threat`;
      if (scenarioKey === 'dom') activeBtn.innerHTML = `📝 Simulate DOM Injection`;
      if (scenarioKey === 'cookie') activeBtn.innerHTML = `🍪 Simulate Cookie Risk`;
    }
  }
});
