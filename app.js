// ===========================
// Configuration
// ===========================

const CONFIG = {
    API_URL: 'https://api.example.com/prediction', // ← UPDATE WITH YOUR API
    BASE_NUMBER: 10001,
    INITIAL_BALANCE: 5000,
    INITIAL_BET: 100,
    CYCLE_DURATION: 60, // seconds
    BASE_TIME: '05:30', // Base time (5:30 AM)
    PREDICTION_STRATEGY: 'smart', // 'random', 'opposite', 'pattern', 'smart'
};

// ===========================
// State Management
// ===========================

const state = {
    isRunning: false,
    currentPeriod: 0,
    currentPrediction: null,
    currentResult: null,
    balance: CONFIG.INITIAL_BALANCE,
    initialBalance: CONFIG.INITIAL_BALANCE,
    level: 1,
    currentBet: CONFIG.INITIAL_BET,
    totalTrades: 0,
    wins: 0,
    losses: 0,
    apiConnected: false,
    history: [],
    timerInterval: null,
    fetchInterval: null,
    predictionHistory: [],
    resultHistory: [],
};

// ===========================
// Utility Functions
// ===========================

function getDateString(date) {
    return date.toISOString().split('T')[0].replace(/-/g, '');
}

function getMinutesSince530(date) {
    const hours = date.getHours();
    const minutes = date.getMinutes();
    const seconds = date.getSeconds();

    const currentInMinutes = hours * 60 + minutes + seconds / 60;
    const baseInMinutes = 5 * 60 + 30; // 5:30 AM = 330 minutes

    let minutesSince = currentInMinutes - baseInMinutes;

    if (minutesSince < 0) {
        // If it's before 5:30 AM, calculate from previous day
        minutesSince = (24 * 60) + minutesSince;
    }

    return Math.floor(minutesSince);
}

function generatePeriod() {
    const now = new Date();
    const dateNum = parseInt(getDateString(now));
    const minutesSince = getMinutesSince530(now);
    const period = CONFIG.BASE_NUMBER + dateNum + minutesSince;
    return period;
}

function getTimeRemaining() {
    const now = new Date();
    const seconds = 60 - now.getSeconds();
    return seconds === 60 ? 0 : seconds;
}

function getNextCycleTime() {
    const now = new Date();
    const nextCycle = new Date(now.getTime() + (60 - now.getSeconds()) * 1000);
    return nextCycle.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
}

// ===========================
// Prediction Engine
// ===========================

function getPredictionConfidence(strategy) {
    const confidences = {
        random: 50,
        opposite: 65,
        pattern: 75,
        smart: 78,
    };
    return confidences[strategy] || 50;
}

function makePrediction() {
    const strategy = CONFIG.PREDICTION_STRATEGY;
    let prediction;

    switch (strategy) {
        case 'random':
            prediction = Math.random() > 0.5 ? 'BIG' : 'SMALL';
            break;

        case 'opposite':
            // Predict opposite of last result
            if (state.resultHistory.length > 0) {
                const lastResult = state.resultHistory[state.resultHistory.length - 1];
                prediction = lastResult === 'BIG' ? 'SMALL' : 'BIG';
            } else {
                prediction = Math.random() > 0.5 ? 'BIG' : 'SMALL';
            }
            break;

        case 'pattern':
            // Pattern-based: look at last 3 results
            if (state.resultHistory.length >= 3) {
                const last3 = state.resultHistory.slice(-3);
                const bigCount = last3.filter(r => r === 'BIG').length;
                prediction = bigCount >= 2 ? 'BIG' : 'SMALL';
            } else {
                prediction = Math.random() > 0.5 ? 'BIG' : 'SMALL';
            }
            break;

        case 'smart':
            // Smart: combine multiple factors
            if (state.resultHistory.length > 0) {
                const last = state.resultHistory[state.resultHistory.length - 1];
                const recentBigs = state.resultHistory.slice(-5).filter(r => r === 'BIG').length;
                
                if (recentBigs >= 3) {
                    prediction = 'SMALL'; // Odds correction
                } else if (recentBigs <= 1) {
                    prediction = 'BIG'; // Odds correction
                } else {
                    prediction = last === 'BIG' ? 'SMALL' : 'BIG';
                }
            } else {
                prediction = Math.random() > 0.5 ? 'BIG' : 'SMALL';
            }
            break;

        default:
            prediction = Math.random() > 0.5 ? 'BIG' : 'SMALL';
    }

    state.currentPrediction = prediction;
    state.predictionHistory.push(prediction);
    return prediction;
}

// ===========================
// API Integration
// ===========================

async function fetchResultFromAPI() {
    try {
        // Check if API_URL is configured
        if (CONFIG.API_URL === 'https://api.example.com/prediction') {
            console.warn('API URL not configured. Using simulated result.');
            return simulateAPIResult();
        }

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

        const response = await fetch(CONFIG.API_URL, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
            signal: controller.signal,
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
            throw new Error(`API Error: ${response.status}`);
        }

        const data = await response.json();

        // Validate response
        if (!data.result || !['BIG', 'SMALL'].includes(data.result)) {
            throw new Error('Invalid response format');
        }

        state.apiConnected = true;
        updateAPIStatus(true);

        return data.result;
    } catch (error) {
        console.error('API Error:', error);
        state.apiConnected = false;
        updateAPIStatus(false);

        // Use simulated result as fallback
        return simulateAPIResult();
    }
}

function simulateAPIResult() {
    // Fallback: simulate API result
    const result = Math.random() > 0.5 ? 'BIG' : 'SMALL';
    return result;
}

// ===========================
// Result Processing
// ===========================

function processResult(result) {
    state.currentResult = result;
    state.resultHistory.push(result);

    const isPredictionCorrect = state.currentPrediction === state.currentResult;

    if (isPredictionCorrect) {
        handleWin();
    } else {
        handleLoss();
    }

    // Add to history
    state.history.unshift({
        period: state.currentPeriod,
        prediction: state.currentPrediction,
        result: state.currentResult,
        status: isPredictionCorrect ? 'WIN' : 'LOSS',
        profitLoss: isPredictionCorrect ? state.currentBet : -state.currentBet,
    });

    // Keep only last 50 trades
    if (state.history.length > 50) {
        state.history.pop();
    }

    state.totalTrades++;
    updateUI();
}

function handleWin() {
    state.balance += state.currentBet;
    state.wins++;
    state.level = 1; // Reset level
    state.currentBet = CONFIG.INITIAL_BET; // Reset bet
}

function handleLoss() {
    state.balance -= state.currentBet;
    state.losses++;
    state.level++; // Increase level (Martingale)
    state.currentBet = CONFIG.INITIAL_BET * Math.pow(2, state.level - 1); // Double bet (Martingale)
}

// ===========================
// UI Updates
// ===========================

function updateTimerDisplay() {
    const timeRemaining = getTimeRemaining();
    document.getElementById('timer').textContent = timeRemaining;
    document.getElementById('nextCycleTime').textContent = getNextCycleTime();

    // Update progress bar
    const progress = ((60 - timeRemaining) / 60) * 100;
    document.getElementById('progressFill').style.width = progress + '%';
}

function updatePeriodDisplay() {
    state.currentPeriod = generatePeriod();
    document.getElementById('periodDisplay').textContent = state.currentPeriod;
}

function updatePredictionDisplay() {
    const prediction = makePrediction();
    const confidence = getPredictionConfidence(CONFIG.PREDICTION_STRATEGY);

    const predictionElement = document.querySelector('.prediction-display .prediction-value');
    const confidenceElement = document.getElementById('predictionConfidence');

    predictionElement.textContent = prediction;
    confidenceElement.textContent = confidence + '%';
    confidenceElement.style.color = `hsl(${confidence + 100}, 100%, 50%)`;
}

function updateResultDisplay() {
    const resultElement = document.querySelector('.result-display .result-value');
    if (state.currentResult) {
        resultElement.textContent = state.currentResult;
    } else {
        resultElement.textContent = '--';
    }
}

function updateStatusDisplay() {
    const statusDisplay = document.getElementById('statusDisplay');
    const statusMessage = document.getElementById('statusMessage');

    if (state.totalTrades === 0) {
        statusDisplay.textContent = '--';
        statusDisplay.className = '';
        statusMessage.textContent = 'Waiting to start...';
    } else {
        const lastTrade = state.history[0];
        const isWin = lastTrade.status === 'WIN';

        statusDisplay.textContent = isWin ? 'WIN 🎉' : 'LOSS ❌';
        statusDisplay.className = isWin ? 'win' : 'loss';
        statusMessage.textContent = `Period ${lastTrade.period}: ${lastTrade.result} (Predicted: ${lastTrade.prediction})`;
    }
}

function updateBalanceDisplay() {
    const balanceDisplay = document.querySelector('.balance-amount');
    const balanceChange = document.getElementById('balanceChange');

    balanceDisplay.textContent = '$' + state.balance.toLocaleString();

    if (state.totalTrades > 0) {
        const profitLoss = state.balance - state.initialBalance;
        const isPositive = profitLoss >= 0;

        balanceChange.textContent = (isPositive ? '+' : '') + '$' + profitLoss.toLocaleString();
        balanceChange.className = isPositive ? 'positive' : 'negative';
    }
}

function updateLevelDisplay() {
    document.getElementById('currentLevel').textContent = state.level;
    document.getElementById('currentBet').textContent = state.currentBet.toLocaleString();
}

function updateStatsDisplay() {
    document.getElementById('totalTrades').textContent = state.totalTrades;
    document.getElementById('wins').textContent = state.wins;
    document.getElementById('losses').textContent = state.losses;

    const winRate = state.totalTrades > 0
        ? Math.round((state.wins / state.totalTrades) * 100)
        : 0;
    document.getElementById('winRate').textContent = winRate + '%';
}

function updateHistoryDisplay() {
    const tbody = document.getElementById('historyBody');

    if (state.history.length === 0) {
        tbody.innerHTML = `<tr><td colspan="5" style="text-align: center; color: #888;">No trades yet</td></tr>`;
        return;
    }

    tbody.innerHTML = state.history.slice(0, 20).map(trade => `
        <tr>
            <td>${trade.period}</td>
            <td><strong>${trade.prediction}</strong></td>
            <td><strong>${trade.result}</strong></td>
            <td>
                <span class="status-badge ${trade.status === 'WIN' ? 'win' : 'loss'}">
                    ${trade.status}
                </span>
            </td>
            <td style="color: ${trade.profitLoss > 0 ? '#00ff88' : '#ff0055'}; font-weight: bold;">
                ${trade.profitLoss > 0 ? '+' : ''}$${trade.profitLoss}
            </td>
        </tr>
    `).join('');
}

function updateAPIStatus(isConnected) {
    const indicator = document.getElementById('apiStatus');
    const text = document.getElementById('statusText');

    if (isConnected) {
        indicator.classList.add('online');
        text.textContent = 'Connected';
    } else {
        indicator.classList.remove('online');
        text.textContent = 'Offline (Simulated)';
    }
}

function updateUI() {
    updateTimerDisplay();
    updatePeriodDisplay();
    updatePredictionDisplay();
    updateResultDisplay();
    updateStatusDisplay();
    updateBalanceDisplay();
    updateLevelDisplay();
    updateStatsDisplay();
    updateHistoryDisplay();
}

// ===========================
// Main Loop
// ===========================

async function runCycle() {
    console.log('Running prediction cycle...');

    // Generate period
    updatePeriodDisplay();

    // Make prediction
    updatePredictionDisplay();

    // Fetch result from API
    const result = await fetchResultFromAPI();
    processResult(result);

    console.log(`Period: ${state.currentPeriod} | Prediction: ${state.currentPrediction} | Result: ${result}`);
}

function startDashboard() {
    if (state.isRunning) return;

    state.isRunning = true;
    document.getElementById('startBtn').disabled = true;
    document.getElementById('stopBtn').disabled = false;

    console.log('Dashboard started');

    // Run cycle immediately
    runCycle();

    // Run cycle every 60 seconds
    state.fetchInterval = setInterval(runCycle, CONFIG.CYCLE_DURATION * 1000);

    // Update timer every second
    state.timerInterval = setInterval(updateTimerDisplay, 1000);

    // Initial timer update
    updateTimerDisplay();
}

function stopDashboard() {
    if (!state.isRunning) return;

    state.isRunning = false;
    document.getElementById('startBtn').disabled = false;
    document.getElementById('stopBtn').disabled = true;

    clearInterval(state.fetchInterval);
    clearInterval(state.timerInterval);

    console.log('Dashboard stopped');
}

function resetDashboard() {
    stopDashboard();

    state.currentPeriod = 0;
    state.currentPrediction = null;
    state.currentResult = null;
    state.balance = CONFIG.INITIAL_BALANCE;
    state.initialBalance = CONFIG.INITIAL_BALANCE;
    state.level = 1;
    state.currentBet = CONFIG.INITIAL_BET;
    state.totalTrades = 0;
    state.wins = 0;
    state.losses = 0;
    state.history = [];
    state.predictionHistory = [];
    state.resultHistory = [];

    updateUI();
    console.log('Dashboard reset');
}

// ===========================
// Event Listeners
// ===========================

function init() {
    document.getElementById('startBtn').addEventListener('click', startDashboard);
    document.getElementById('stopBtn').addEventListener('click', stopDashboard);
    document.getElementById('resetBtn').addEventListener('click', resetDashboard);

    updateUI();
    console.log('Dashboard initialized');
}

// ===========================
// Auto-Start
// ===========================

window.addEventListener('DOMContentLoaded', init);

// Uncomment to auto-start on page load:
// window.addEventListener('DOMContentLoaded', () => {
//     init();
//     setTimeout(() => startDashboard(), 1000);
// });
