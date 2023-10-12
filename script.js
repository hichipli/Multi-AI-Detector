document.getElementById('inputText').addEventListener('input', function(e) {
    const wordCount = e.target.value.split(/\s+/).filter(function(word) { return word.length > 0 }).length;
    document.getElementById('wordCount').textContent = wordCount + ' words';
});

function toggleSettings() {
    const settingsModal = document.getElementById('settings-modal');
    settingsModal.style.display = settingsModal.style.display === 'block' ? 'none' : 'block';
    loadSettings();  // Load settings from localStorage when settings panel is opened
}

function saveSettings() {
    const winstonKey = document.getElementById('winstonKey').value;
    const winstonToken = document.getElementById('winstonToken').value;
    const originalityKey = document.getElementById('originalityKey').value;
    const gptzeroKey = document.getElementById('gptzeroKey').value;

    // Save to localStorage
    localStorage.setItem('winstonKey', winstonKey);
    localStorage.setItem('winstonToken', winstonToken);
    localStorage.setItem('originalityKey', originalityKey);
    localStorage.setItem('gptzeroKey', gptzeroKey);

    alert("Settings saved!");
}

function loadSettings() {
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
            })
            .catch(error => {
                const listItem = document.createElement('li');
                listItem.textContent = `Error calling AI Content Detector v1: ${error.message}`;
                resultList.appendChild(listItem);
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
            })
            .catch(error => {
                const listItem = document.createElement('li');
                listItem.textContent = `Error calling AI Content Detector v2: ${error.message}`;
                resultList.appendChild(listItem);
            });
        }

        // Call API for GPTZero
        if (detectorId === 'gptzero') {
            const API_URL = "https://api.gptzero.me/v2/predict/text";
            const API_KEY = localStorage.getItem('gptzeroKey');  // Load API key from localStorage
            const headers = {
                "x-api-key": API_KEY,
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
                listItem.textContent = `GPTZero Result: ${data.documents[0].completely_generated_prob}`;
                resultList.appendChild(listItem);
            })
            .catch(error => {
                const listItem = document.createElement('li');
                listItem.textContent = `Error calling GPTZero: ${error.message}`;
                resultList.appendChild(listItem);
            });
        }

        // Call API for Winston
        if (detectorId === 'winston') {
            const listItem = document.createElement('li');
            listItem.textContent = `Winston.AI Result: Temporarily not supported.`;
            resultList.appendChild(listItem);
        }

        // Call API for OriginalityAI
        if (detectorId === 'originality') {
            const listItem = document.createElement('li');
            if(wordsCount < 50) {
                listItem.textContent = `Originality.AI Result: Text must be longer than 50 words.`;
                resultList.appendChild(listItem); 
            } else {
                const BASE_URL = "https://api.originality.ai/api/v1/scan/ai";
                const API_KEY = localStorage.getItem('originalityKey');
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
                })
                .catch(error => {
                    listItem.textContent = `Error calling Originality.AI: ${error.message}`;
                    resultList.appendChild(listItem);
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
