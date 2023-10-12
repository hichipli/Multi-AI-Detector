document.addEventListener("DOMContentLoaded", function() {
    loadSettings();
    updateDetectorsVisibility();
});

document.getElementById('inputText').addEventListener('input', function(e) {
    const wordCount = e.target.value.split(/\s+/).filter(function(word) { return word.length > 0 }).length;
    document.getElementById('wordCount').textContent = wordCount + ' words';
});

function updateDetectorsVisibility() {
    document.getElementById('detector1').parentElement.style.display = localStorage.getItem('showDetector1') === "true" ? "" : "none";
    document.getElementById('detector2').parentElement.style.display = localStorage.getItem('showDetector2') === "true" ? "" : "none";
    document.getElementById('winston').parentElement.style.display = localStorage.getItem('showWinston') === "true" ? "" : "none";
    document.getElementById('originality').parentElement.style.display = localStorage.getItem('showOriginality') === "true" ? "" : "none";
    document.getElementById('gptzero').parentElement.style.display = localStorage.getItem('showGPTZero') === "true" ? "" : "none";
}

function toggleSettings() {
    const settingsModal = document.getElementById('settings-modal');
    settingsModal.style.display = settingsModal.style.display === 'block' ? 'none' : 'block';
    loadSettings();  // Load settings from localStorage when settings panel is opened
}

function saveSettings() {
    console.log("saveSettings called");
    const winstonKey = document.getElementById('winstonKey').value;
    console.log("winstonKey:", winstonKey);
    const winstonToken = document.getElementById('winstonToken').value;
    const originalityKey = document.getElementById('originalityKey').value;
    const gptzeroKey = document.getElementById('gptzeroKey').value;

    localStorage.setItem('showDetector1', document.getElementById('showDetector1').checked);
    localStorage.setItem('showDetector2', document.getElementById('showDetector2').checked);
    localStorage.setItem('showWinston', document.getElementById('showWinston').checked);
    localStorage.setItem('showOriginality', document.getElementById('showOriginality').checked);
    localStorage.setItem('showGPTZero', document.getElementById('showGPTZero').checked);

    // Save to localStorage
    localStorage.setItem('winstonKey', winstonKey);
    localStorage.setItem('winstonToken', winstonToken);
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
    document.getElementById('winstonToken').value = localStorage.getItem('winstonToken') || '';
    document.getElementById('originalityKey').value = localStorage.getItem('originalityKey') || '';
    document.getElementById('gptzeroKey').value = localStorage.getItem('gptzeroKey') || '';
}


function detect() {
    const inputText = document.getElementById('inputText').value;
    const wordsCount = inputText.split(/\s+/).filter(function(word) { return word.length > 0 }).length;
    const resultText = document.getElementById('resultText');

    const detectors = [
        'detector1',
        'detector2',
        'winston',
        'originality',
        'gptzero'
    ];
    const selectedDetectors = detectors.filter(detectorId => document.getElementById(detectorId).checked);
    
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

    if(wordsCount === 0) {
        alert("Please enter some text before detecting.");
        return;
    }

    // Clear previous results
    resultText.innerHTML = "Sending the text to various APIs for analysis...";

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
                const listItem = document.createElement('li');
                listItem.textContent = `AI Content Detector v1 Result: ${data.fake_probability}`;
                resultList.appendChild(listItem);
                checkAllCallsCompleted();
            })
            .catch(error => {
                const listItem = document.createElement('li');
                listItem.textContent = `Error calling AI Content Detector v1: ${error.message}`;
                resultList.appendChild(listItem);
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
                const listItem = document.createElement('li');
                listItem.textContent = `AI Content Detector v2 Result: ${data.ai_percentage / 100}`;
                resultList.appendChild(listItem);
                checkAllCallsCompleted();
                
            })
            .catch(error => {
                const listItem = document.createElement('li');
                listItem.textContent = `Error calling AI Content Detector v2: ${error.message}`;
                resultList.appendChild(listItem);
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
                "version": "2023-09-14"  // Update to your desired version
            };

            fetch(API_URL, {
                method: 'POST',
                headers: headers,
                body: JSON.stringify(payload)
            })
            .then(response => response.json())
            .then(data => {
                const listItem = document.createElement('li');
                // Change the condition to check data.error instead of data.message
                if (data && data.error && data.error.includes("You have exceeded your usage threshold of 7 requests per hour")) {
                    listItem.textContent = "GPTZero Result: Free quota exhausted, please enter an API key in the settings.";
                    alert("GPTZero: Your free quota is exhausted, please enter an API key in the settings.");
                } else if (data && data.documents && data.documents.length > 0) {
                    listItem.textContent = `GPTZero Result: ${data.documents[0].completely_generated_prob}`;
                } else {
                    listItem.textContent = `GPTZero Result: Unexpected response format`;
                }
                resultList.appendChild(listItem);
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
                const listItem = document.createElement('li');
                if (data && data.score) {
                    const processedScore = 1 - (data.score / 100);
                    listItem.textContent = `Winston.AI Result: ${processedScore}`;
                } else {
                    listItem.textContent = `Winston.AI Result: Unexpected response format`;
                }
                resultList.appendChild(listItem);
                checkAllCallsCompleted();
            })
            .catch(error => {
                const listItem = document.createElement('li');
                listItem.textContent = `Error calling Winston.AI: ${error.message}`;
                resultList.appendChild(listItem);
                checkAllCallsCompleted();
            });
        }

        // Call API for OriginalityAI
        if (detectorId === 'originality') {
            const API_KEY = localStorage.getItem('originalityKey');
            const listItem = document.createElement('li');

            if (!API_KEY) {
                listItem.textContent = "Originality.AI Result: API key is missing, please add it in the settings.";
                resultList.appendChild(listItem);
                checkAllCallsCompleted();
            } else if(wordsCount < 50) {
                listItem.textContent = `Originality.AI Result: Text must be longer than 50 words.`;
                resultList.appendChild(listItem); 
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
                    listItem.textContent = `Originality.AI Result: ${data.score.ai}`;
                    resultList.appendChild(listItem);
                    checkAllCallsCompleted();
                })
                .catch(error => {
                    listItem.textContent = `Error calling Originality.AI: ${error.message}`;
                    resultList.appendChild(listItem);
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