document.addEventListener("DOMContentLoaded", function() {
    loadSettings();
    updateDetectorsVisibility();
    document.getElementById('settings-modal').style.display = 'none';
});

document.getElementById('inputText').addEventListener('input', function(e) {
    const wordCount = e.target.value.split(/\s+/).filter(function(word) { return word.length > 0 }).length;
    document.getElementById('wordCount').textContent = wordCount + ' words';
});

function updateDetectorsVisibility() {
    const detectors = [
        { id: 'detector1', storageKey: 'showDetector1' },
        { id: 'detector2', storageKey: 'showDetector2' },
        { id: 'winston', storageKey: 'showWinston' },
        { id: 'originality', storageKey: 'showOriginality' },
        { id: 'gptzero', storageKey: 'showGPTZero' }
    ];

    detectors.forEach(detector => {
        const element = document.getElementById(detector.id);
        if (element && element.parentElement) {
            const isVisible = localStorage.getItem(detector.storageKey) === "true";
            element.parentElement.style.display = isVisible ? "" : "none";
            if (!isVisible) {
                element.checked = false;
            }
        }
    });
}

function toggleSettings() {
    const settingsModal = document.getElementById('settings-modal');
    if (settingsModal.style.display === 'flex') {
        settingsModal.style.display = 'none';
    } else {
        settingsModal.style.display = 'flex';
        loadSettings();
    }
}

function saveSettings() {
    console.log("saveSettings called");
    const winstonKey = document.getElementById('winstonKey').value;
    console.log("winstonKey:", winstonKey);
    const originalityKey = document.getElementById('originalityKey').value;
    const gptzeroKey = document.getElementById('gptzeroKey').value;

    localStorage.setItem('showDetector1', document.getElementById('showDetector1').checked);
    localStorage.setItem('showDetector2', document.getElementById('showDetector2').checked);
    localStorage.setItem('showWinston', document.getElementById('showWinston').checked);
    localStorage.setItem('showOriginality', document.getElementById('showOriginality').checked);
    localStorage.setItem('showGPTZero', document.getElementById('showGPTZero').checked);

    // Save to localStorage
    localStorage.setItem('winstonKey', winstonKey);
    localStorage.setItem('originalityKey', originalityKey);
    localStorage.setItem('gptzeroKey', gptzeroKey);

    alert("Settings saved!");
    updateDetectorsVisibility();
}

function loadSettings() {
    if (localStorage.getItem('showDetector1') === null) localStorage.setItem('showDetector1', 'true');
    if (localStorage.getItem('showDetector2') === null) localStorage.setItem('showDetector2', 'true');
    if (localStorage.getItem('showWinston') === null) localStorage.setItem('showWinston', 'true');
    if (localStorage.getItem('showOriginality') === null) localStorage.setItem('showOriginality', 'true');
    if (localStorage.getItem('showGPTZero') === null) localStorage.setItem('showGPTZero', 'true');

    document.getElementById('showDetector1').checked = localStorage.getItem('showDetector1') === "true";
    document.getElementById('showDetector2').checked = localStorage.getItem('showDetector2') === "true";
    document.getElementById('showWinston').checked = localStorage.getItem('showWinston') === "true";
    document.getElementById('showOriginality').checked = localStorage.getItem('showOriginality') === "true";
    document.getElementById('showGPTZero').checked = localStorage.getItem('showGPTZero') === "true";

    // Load from localStorage and set the input fields
    document.getElementById('winstonKey').value = localStorage.getItem('winstonKey') || '';
    document.getElementById('originalityKey').value = localStorage.getItem('originalityKey') || '';
    document.getElementById('gptzeroKey').value = localStorage.getItem('gptzeroKey') || '';
}

function updateResultItem(text, type = 'success', value = null) {
    const li = document.createElement('li');
    li.className = `result-card result-${type}`;
    
    if (type === 'error' || type === 'warning') {
        li.innerHTML = `
            <div class="message-box ${type}-message">
                <i class="fas fa-${type === 'error' ? 'exclamation-circle' : 'exclamation-triangle'}"></i>
                <span>${text}</span>
            </div>
        `;
    } else if (type === 'success' && value !== null) {
        const percentage = parseFloat(value) * 100;
        
        li.innerHTML = `
            <div class="result-main">
                <h3 class="result-title">${text}</h3>
                <div class="result-score">
                    <span class="result-value">${percentage.toFixed(1)}%</span>
                    <span class="result-label">AI Probability</span>
                </div>
            </div>
            <div class="result-explanation">
                ${getSimpleExplanation(percentage)}
            </div>
        `;
    }
    
    return li;
}

function getSimpleExplanation(percentage) {
    if (percentage < 30) {
        return "Shows strong characteristics of human writing with natural language patterns and variations.";
    } else if (percentage < 70) {
        return "Contains mixed characteristics that could indicate either human editing of AI text or AI enhancement of human writing.";
    } else {
        return "Displays strong AI-generated patterns with consistent formatting and structure.";
    }
}

function detect() {
    const inputText = document.getElementById('inputText').value;
    const wordsCount = inputText.split(/\s+/).filter(function(word) { return word.length > 0 }).length;
    
    if(wordsCount === 0) {
        alert("Please enter some text before detecting.");
        return;
    }

    const resultText = document.getElementById('resultText');
    const detectors = [
        { id: 'detector1', storageKey: 'showDetector1' },
        { id: 'detector2', storageKey: 'showDetector2' },
        { id: 'winston', storageKey: 'showWinston' },
        { id: 'originality', storageKey: 'showOriginality' },
        { id: 'gptzero', storageKey: 'showGPTZero' }
    ];
    
    const selectedDetectors = detectors
        .filter(detector => localStorage.getItem(detector.storageKey) === "true")
        .filter(detector => document.getElementById(detector.id).checked)
        .map(detector => detector.id);

    let totalCalls = selectedDetectors.length; 
    let remainingCalls = totalCalls;
    
    // Check if Winston is selected and adjust the counter accordingly
    if (selectedDetectors.includes('winston')) {
        remainingCalls--;
    }

    document.getElementById('loadingText').style.display = 'block'; // Show loading text

    function checkAllCallsCompleted() {
        remainingCalls--;
        if (remainingCalls <= 0) {
            document.getElementById('loadingText').style.display = 'none'; // Hide loading text
        }
    }

    // Clear previous results
    resultText.innerHTML = '';
    const resultList = document.createElement('ul');
    resultText.appendChild(resultList);

    selectedDetectors.forEach(detectorId => {
        // Call API for AI Detector v1
        if (detectorId === 'detector1') {
            const API_URL = "https://cdapi.goom.ai/api/v1/content/detect";
            const headers = {
                'Content-Type': 'application/json', 
                'referer': 'https://contentdetector.ai/'
            };
            const data = {"content": inputText};

            fetch(API_URL, {
                method: 'POST',
                headers: headers,
                body: JSON.stringify(data)
            })
            .then(response => response.json())
            .then(data => {
                resultList.appendChild(updateResultItem(
                    'AI Content Detector v1', 
                    'success', 
                    data.fake_probability
                ));
                checkAllCallsCompleted();
            })
            .catch(error => {
                resultList.appendChild(updateResultItem(
                    "Unable to connect to AI Content Detector v1. Please try again later.", 
                    'error'
                ));
                checkAllCallsCompleted();
            });
        }

        // Call API for AI Detector v2
        if (detectorId === 'detector2') {
            const API_URL = "https://cdapi.goom.ai/api/v2/detect/ai_content";
            const headers = {
                'Content-Type': 'application/json', 
                'referer': 'https://contentdetector.ai/'
            };
            const data = {"content": inputText};

            fetch(API_URL, {
                method: 'POST',
                headers: headers,
                body: JSON.stringify(data)
            })
            .then(response => response.json())
            .then(data => {
                resultList.appendChild(updateResultItem(
                    'AI Content Detector v2', 
                    'success', 
                    data.ai_percentage / 100
                ));
                checkAllCallsCompleted();
            })
            .catch(error => {
                resultList.appendChild(updateResultItem(
                    "Unable to connect to AI Content Detector v2. Please try again later.", 
                    'error'
                ));
                checkAllCallsCompleted();
            });
        }

        // Call API for GPTZero
        if (detectorId === 'gptzero') {
            const API_URL = "https://api.gptzero.me/v2/predict/text";
            const API_KEY = localStorage.getItem('gptzeroKey');  // Load API key from localStorage
            const headers = {
                "Content-Type": "application/json",
                "Accept": "application/json"
            };
            const payload = {
                "document": inputText,
                "version": "2024-11-11-base"  // Update to your desired version
            };

            fetch(API_URL, {
                method: 'POST',
                headers: headers,
                body: JSON.stringify(payload)
            })
            .then(response => response.json())
            .then(data => {
                if (data && data.documents && data.documents.length > 0) {
                    const score = data.documents[0].completely_generated_prob;
                    resultList.appendChild(updateResultItem(
                        'GPTZero Analysis', 
                        'success', 
                        score
                    ));
                } else if (data && data.error) {
                    resultList.appendChild(updateResultItem(
                        "GPTZero Result: Free quota exhausted, please enter an API key in the settings.", 
                        'warning'
                    ));
                } else {
                    resultList.appendChild(updateResultItem(
                        "GPTZero Result: Unexpected response format", 
                        'error'
                    ));
                }
                checkAllCallsCompleted();
            })
            .catch(error => {
                const listItem = document.createElement('li');
                listItem.textContent = `Error calling GPTZero: ${error.message}`;
                resultList.appendChild(listItem);
                checkAllCallsCompleted();
            });
        }


        // Call API for Winston
        if (detectorId === 'winston') {
            const API_URL = "https://api.gowinston.ai/functions/v1/predict";
            const API_KEY = document.getElementById('winstonKey').value;  // Load API key from input
            const headers = {
                "Content-Type": "application/json",
                "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRkZ3NzdXRyaHpya2xsc3RnbGRiIiwicm9sZSI6ImFub24iLCJpYXQiOjE2ODY2ODc5MjMsImV4cCI6MjAwMjI2MzkyM30.bwSe1TrFMhcosgqFSlGIhMIv9fxohzLG0eyBEs7wUo8"
            };
            const data = {
                "api_key": API_KEY,
                "text": inputText,
                "sentences": true,
                "language": "en"
            };

            fetch(API_URL, {
                method: 'POST',
                headers: headers,
                body: JSON.stringify(data)
            })
            .then(response => response.json())
            .then(data => {
                if (data && data.score) {
                    const processedScore = 1 - (data.score / 100);
                    resultList.appendChild(updateResultItem(
                        'Winston.AI Analysis', 
                        'success', 
                        processedScore
                    ));
                } else {
                    resultList.appendChild(updateResultItem(
                        "Unexpected response from Winston.AI. Please try again.", 
                        'error'
                    ));
                }
                checkAllCallsCompleted();
            })
            .catch(error => {
                resultList.appendChild(updateResultItem(
                    "Unable to connect to Winston.AI. Please check your API key and try again.", 
                    'error'
                ));
                checkAllCallsCompleted();
            });
        }

        // Call API for OriginalityAI
        if (detectorId === 'originality') {
            const API_KEY = localStorage.getItem('originalityKey');
            const listItem = document.createElement('li');

            if (!API_KEY) {
                resultList.appendChild(updateResultItem(
                    "Please add your Originality.AI API key in the settings to use this detector.", 
                    'warning'
                ));
                checkAllCallsCompleted();
            } else if(wordsCount < 50) {
                resultList.appendChild(updateResultItem(
                    "Originality.AI requires text to be at least 50 words long.", 
                    'warning'
                ));
                checkAllCallsCompleted();
            } else {
                const BASE_URL = "https://api.originality.ai/api/v1/scan/ai";
                const headers = {
                    "Accept": "application/json",
                    "X-OAI-API-KEY": API_KEY,
                    "Content-Type": "application/json"
                };
                const data = {
                    "content": inputText,
                    "title": "optional title",
                    "aiModelVersion": "1",
                    "storeScan": "false"
                };

                fetch(BASE_URL, {
                    method: 'POST',
                    headers: headers,
                    body: JSON.stringify(data)
                })
                .then(response => response.json())
                .then(data => {
                    resultList.appendChild(updateResultItem(
                        'Originality.AI Analysis', 
                        'success', 
                        data.score.ai
                    ));
                    checkAllCallsCompleted();
                })
                .catch(error => {
                    resultList.appendChild(updateResultItem(
                        "Unable to connect to Originality.AI. Please check your API key and try again.", 
                        'error'
                    ));
                    checkAllCallsCompleted();
                });
            }
        }


        // ... Add other detectors' logic as needed
    });
}

// Close the modal if window is clicked outside of it
window.onclick = function(event) {
    const settingsModal = document.getElementById('settings-modal');
    if (event.target === settingsModal) {
        settingsModal.style.display = "none";
    }
}

function clearApiKey(keyId) {
    localStorage.removeItem(keyId);
    document.getElementById(keyId).value = "";
}