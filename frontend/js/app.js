// API Configuration
const API_URL = 'http://localhost:3000';

// Utility Functions
function showStatus(elementId, message, type) {
  const el = document.getElementById(elementId);
  el.textContent = message;
  el.className = `status-box show ${type}`;
}

function showOutput(elementId, content) {
  const el = document.getElementById(elementId);
  if (typeof content === 'string') {
    el.textContent = content;
  } else {
    el.textContent = JSON.stringify(content, null, 2);
  }
}

function clearOutput(elementId) {
  const el = document.getElementById(elementId);
  el.textContent = '';
}

// Test Functions
async function testHealth() {
  showStatus('healthStatus', '⏳ Checking server...', 'info');
  showOutput('healthOutput', '');

  try {
    const response = await fetch(`${API_URL}/health`);
    const data = await response.json();
    
    showStatus('healthStatus', '✅ Server is running!', 'success');
    showOutput('healthOutput', JSON.stringify(data, null, 2));
  } catch (error) {
    showStatus('healthStatus', `❌ Error: ${error.message}`, 'error');
    showOutput('healthOutput', `Failed to connect to ${API_URL}`);
  }
}

async function testApiCheck() {
  showStatus('configStatus', '⏳ Checking API configuration...', 'info');
  showOutput('configOutput', '');

  try {
    const response = await fetch(`${API_URL}/api/check`);
    const data = await response.json();
    
    if (response.ok) {
      showStatus('configStatus', '✅ Google AI API is configured!', 'success');
      showOutput('configOutput', JSON.stringify(data, null, 2));
    } else {
      showStatus('configStatus', '❌ API not configured', 'error');
      showOutput('configOutput', JSON.stringify(data, null, 2));
    }
  } catch (error) {
    showStatus('configStatus', `❌ Error: ${error.message}`, 'error');
    showOutput('configOutput', `Failed to check API configuration`);
  }
}

async function testAI() {
  const prompt = document.getElementById('testPrompt').value.trim();
  
  if (!prompt) {
    showStatus('aiStatus', '❌ Please enter a prompt', 'error');
    return;
  }

  showStatus('aiStatus', '⏳ Sending to AI (GET)...', 'info');
  showOutput('aiOutput', '');

  try {
    const encoded = encodeURIComponent(prompt);
    const response = await fetch(`${API_URL}/api/test-ai?prompt=${encoded}`);
    const data = await response.json();
    
    if (response.ok && data.status === 'success') {
      showStatus('aiStatus', '✅ AI Response Received!', 'success');
      showOutput('aiOutput', data.response);
    } else {
      showStatus('aiStatus', `❌ Error: ${data.error || 'Unknown error'}`, 'error');
      showOutput('aiOutput', JSON.stringify(data, null, 2));
    }
  } catch (error) {
    showStatus('aiStatus', `❌ Error: ${error.message}`, 'error');
    showOutput('aiOutput', 'Failed to connect to AI');
  }
}

async function testAIPost() {
  const prompt = document.getElementById('testPrompt').value.trim();
  
  if (!prompt) {
    showStatus('aiStatus', '❌ Please enter a prompt', 'error');
    return;
  }

  showStatus('aiStatus', '⏳ Sending to AI (POST)...', 'info');
  showOutput('aiOutput', '');

  try {
    const response = await fetch(`${API_URL}/api/test-ai`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt })
    });
    const data = await response.json();
    
    if (response.ok && data.status === 'success') {
      showStatus('aiStatus', '✅ AI Response Received!', 'success');
      showOutput('aiOutput', data.response);
    } else {
      showStatus('aiStatus', `❌ Error: ${data.error || 'Unknown error'}`, 'error');
      showOutput('aiOutput', JSON.stringify(data, null, 2));
    }
  } catch (error) {
    showStatus('aiStatus', `❌ Error: ${error.message}`, 'error');
    showOutput('aiOutput', 'Failed to connect to AI');
  }
}

async function customTest() {
  const prompt = document.getElementById('customPrompt').value.trim();
  
  if (!prompt) {
    showStatus('customStatus', '❌ Please enter a prompt', 'error');
    return;
  }

  showStatus('customStatus', '⏳ Generating response...', 'info');
  showOutput('customOutput', '');

  try {
    const response = await fetch(`${API_URL}/api/test-ai`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt })
    });
    const data = await response.json();
    
    if (response.ok && data.status === 'success') {
      showStatus('customStatus', '✅ Response Generated!', 'success');
      showOutput('customOutput', data.response);
    } else {
      showStatus('customStatus', `❌ Error: ${data.error || 'Unknown error'}`, 'error');
      showOutput('customOutput', JSON.stringify(data, null, 2));
    }
  } catch (error) {
    showStatus('customStatus', `❌ Error: ${error.message}`, 'error');
    showOutput('customOutput', 'Failed to generate response');
  }
}

// Event Listeners
document.addEventListener('DOMContentLoaded', () => {
  // Auto test health on page load
  testHealth();

  // Add Enter key support for textareas
  const textareas = document.querySelectorAll('textarea');
  textareas.forEach(textarea => {
    textarea.addEventListener('keydown', (e) => {
      if (e.key === 'Tab') {
        e.preventDefault();
        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        textarea.value = textarea.value.substring(0, start) + '\t' + textarea.value.substring(end);
        textarea.selectionStart = textarea.selectionEnd = start + 1;
      }
    });
  });
});

// Log app initialization
console.log('🚀 AI Gemini Test Interface loaded');
console.log(`📍 API URL: ${API_URL}`);
