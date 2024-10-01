console.log('Script started');

const detectors = [
    { id: 'contentdetector', name: 'ContentDetector.ai', apiKey: false },
    { id: 'winston', name: 'Winston', apiKey: true },
    { id: 'originality', name: 'Originality', apiKey: true },
    { id: 'gptzero', name: 'GPTZero', apiKey: true }
];

function getElement(id) {
    const element = document.getElementById(id);
    if (!element) {
        console.error(`Element with id "${id}" not found`);
    }
    return element;
}

const inputText = getElement('inputText');
const wordCount = getElement('wordCount');
const detectBtn = getElement('detectBtn');
const settingsBtn = getElement('settingsBtn');
const settingsModal = getElement('settingsModal');
const saveSettingsBtn = getElement('saveSettingsBtn');
const detectorSettings = getElement('detectorSettings');
const resultContainer = getElement('resultContainer');
const resultsSection = getElement('results-section');
const loadingIndicator = getElement('loadingIndicator');

document.addEventListener('DOMContentLoaded', initializeApp);

function initializeApp() {
    console.log('Initializing app');
    if (inputText) inputText.addEventListener('input', updateWordCount);
    if (detectBtn) detectBtn.addEventListener('click', detectAI);
    if (settingsBtn) settingsBtn.addEventListener('click', toggleSettings);
    if (saveSettingsBtn) saveSettingsBtn.addEventListener('click', saveSettings);
    
    loadSettings();
    renderDetectorSettings();
    console.log('App initialized');
}

function updateWordCount() {
    if (!inputText || !wordCount) return;
    const words = inputText.value.trim().split(/\s+/).filter(word => word.length > 0);
    wordCount.textContent = `${words.length} words`;
}

function renderDetectorSettings() {
    if (!detectorSettings) return;
    detectorSettings.innerHTML = '';
    detectors.forEach(detector => {
        const setting = document.createElement('div');
        setting.className = 'detector-setting';
        setting.innerHTML = `
            <label>
                <input type="checkbox" id="show${detector.id}" 
                       ${localStorage.getItem(`show${detector.id}`) !== 'false' ? 'checked' : ''}>
                ${detector.name}
            </label>
            ${detector.apiKey ? `
                <input type="text" id="${detector.id}Key" placeholder="API Key"
                       value="${localStorage.getItem(`${detector.id}Key`) || ''}">
            ` : ''}
        `;
        detectorSettings.appendChild(setting);
    });
}

function toggleSettings() {
    if (!settingsModal) return;
    settingsModal.style.display = settingsModal.style.display === 'block' ? 'none' : 'block';
}

function saveSettings() {
    detectors.forEach(detector => {
        const showDetector = getElement(`show${detector.id}`);
        if (showDetector) localStorage.setItem(`show${detector.id}`, showDetector.checked);
        if (detector.apiKey) {
            const apiKey = getElement(`${detector.id}Key`);
            if (apiKey) localStorage.setItem(`${detector.id}Key`, apiKey.value);
        }
    });
    toggleSettings();
}

async function detectAI() {
    console.log('Detect AI called');
    if (!inputText || !loadingIndicator || !resultContainer || !resultsSection) return;

    const text = inputText.value.trim();
    if (text.length === 0) {
        alert('Please enter some text to analyze.');
        return;
    }

    loadingIndicator.classList.remove('hidden');
    resultContainer.innerHTML = '';

    const selectedDetectors = detectors.filter(detector => 
        localStorage.getItem(`show${detector.id}`) !== 'false'
    );

    try {
        const results = await Promise.all(selectedDetectors.map(detector => 
            callDetectorAPI(detector.id, text)
        ));

        displayResults(selectedDetectors, results);
    } catch (error) {
        console.error('Error during analysis:', error);
        alert('An error occurred during analysis. Please try again.');
    } finally {
        loadingIndicator.classList.add('hidden');
    }
}

async function callDetectorAPI(detectorId, text) {
    console.log(`Calling API for detector: ${detectorId}`);
    
    if (detectorId === 'contentdetector') {
        try {
            const response = await fetch('http://localhost:3001/detect', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ content: text })
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            console.log(`API result for ${detectorId}:`, data);
            return (data.ai_percentage / 100).toFixed(2);
        } catch (error) {
            console.error(`Error calling ${detectorId} API:`, error);
            throw error;
        }
    } else {
        // 对于其他检测器，我们暂时保留模拟数据
        return new Promise((resolve) => {
            setTimeout(() => {
                const result = Math.random().toFixed(2);
                console.log(`API result for ${detectorId}: ${result}`);
                resolve(result);
            }, 1000);
        });
    }
}

function displayResults(detectors, results) {
    if (!resultContainer) return;
    detectors.forEach((detector, index) => {
        const resultElement = document.createElement('div');
        resultElement.className = 'result-item';
        resultElement.innerHTML = `
            <span class="detector-name">${detector.name}</span>
            <span class="score">${results[index]}</span>
        `;
        resultContainer.appendChild(resultElement);
    });
}

// Close modal when clicking outside
window.onclick = function(event) {
    if (event.target === settingsModal) {
        settingsModal.style.display = 'none';
    }
}

function loadSettings() {
    console.log('Loading settings');
    // 如果需要，在这里添加加载设置的逻辑
}

console.log('Script ended');