// Main JavaScript file for Nebraska Huskers Game Sheet Generator
// Initializes the application and handles user interactions

// Global variables
let api;
let charts;
let gameSheet;

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    console.log('Initializing Nebraska Huskers Game Sheet Generator...');
    
    // Wait a moment for all scripts to load
    setTimeout(() => {
        try {
            // Initialize core components if classes are available
            if (typeof HuskersAPI !== 'undefined') {
                api = new HuskersAPI();
            } else {
                console.warn('HuskersAPI class not found');
            }
            
            if (typeof HuskersCharts !== 'undefined') {
                charts = new HuskersCharts();
            } else {
                console.warn('HuskersCharts class not found');
            }
            
            if (typeof HuskersGameSheet !== 'undefined') {
                gameSheet = new HuskersGameSheet();
            } else {
                console.warn('HuskersGameSheet class not found - this will be initialized by the class itself');
            }
            
            // Continue with other initialization
            hideLoadingScreen();
            setupEventListeners();
            loadSavedApiKeys();
            updateApiStatus();
            handleUrlParameters();
            
        } catch (error) {
            console.error('Error during initialization:', error);
            // Continue with initialization even if some parts fail
            hideLoadingScreen();
        }
    }, 100);
    
    console.log('Application initialized successfully');
});

// Setup all event listeners
function setupEventListeners() {
    // API key management
    const saveKeysButton = document.getElementById('save-api-keys');
    if (saveKeysButton) {
        saveKeysButton.addEventListener('click', handleSaveApiKeys);
    }
    
    const testKeysButton = document.getElementById('test-api-keys');
    if (testKeysButton) {
        testKeysButton.addEventListener('click', handleTestApiKeys);
    }
    
    // Game generation
    const generateButton = document.getElementById('generate-sheet');
    if (generateButton) {
        generateButton.addEventListener('click', handleGenerateSheet);
    }
    
    // Form inputs
    const opponentInput = document.getElementById('opponent-input');
    const dateInput = document.getElementById('game-date');
    const yearSelect = document.getElementById('season-year');
    
    if (opponentInput) {
        opponentInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                handleGenerateSheet();
            }
        });
    }
    
    // Keyboard shortcuts
    document.addEventListener('keydown', function(e) {
        // Ctrl/Cmd + G to generate
        if ((e.ctrlKey || e.metaKey) && e.key === 'g') {
            e.preventDefault();
            handleGenerateSheet();
        }
        
        // Ctrl/Cmd + D to download
        if ((e.ctrlKey || e.metaKey) && e.key === 'd') {
            e.preventDefault();
            if (gameSheet.currentData) {
                gameSheet.downloadReport();
            }
        }
    });
    
    // Print functionality
    window.addEventListener('beforeprint', function() {
        // Optimize layout for printing
        document.body.classList.add('printing');
    });
    
    window.addEventListener('afterprint', function() {
        document.body.classList.remove('printing');
    });
    
    // Handle browser back/forward
    window.addEventListener('popstate', function(e) {
        if (e.state && e.state.gameData) {
            gameSheet.currentData = e.state.gameData;
            gameSheet.renderGameSheet();
        }
    });
    
    // Auto-save form data
    if (opponentInput) {
        opponentInput.addEventListener('input', debounce(saveFormData, 500));
    }
    if (dateInput) {
        dateInput.addEventListener('change', saveFormData);
    }
    if (yearSelect) {
        yearSelect.addEventListener('change', saveFormData);
    }
    
    // Load saved form data
    loadFormData();
}

// Handle saving API keys
function handleSaveApiKeys() {
    const cfbdKey = document.getElementById('cfbd-api-key').value.trim();
    const oddsKey = document.getElementById('odds-api-key').value.trim();
    
    const keys = {};
    if (cfbdKey) keys.cfbd = cfbdKey;
    if (oddsKey) keys.odds = oddsKey;
    
    if (Object.keys(keys).length === 0) {
        showNotification('Please enter at least one API key', 'warning');
        return;
    }
    
    // Save keys
    api.setApiKeys(keys);
    
    // Update UI status
    updateApiStatus();
    
    // Show success message
    showNotification('API keys saved successfully!', 'success');
    
    // Clear the input fields for security
    setTimeout(() => {
        document.getElementById('cfbd-api-key').value = '';
        document.getElementById('odds-api-key').value = '';
    }, 2000);
}

// Handle testing API keys
async function handleTestApiKeys() {
    const testButton = document.getElementById('test-api-keys');
    const originalText = testButton.innerHTML;
    
    // Show loading state
    testButton.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i>Testing...';
    testButton.disabled = true;
    
    try {
        const status = api.getApiStatus();
        
        let cfbdResult = '❌ No key';
        let oddsResult = '❌ No key';
        let espnResult = '✅ Always available';
        
        // Test CFBD API
        if (status.cfbd) {
            try {
                const testData = await api.getTeamStats('Nebraska', 2024);
                if (testData && testData.team) {
                    cfbdResult = '✅ Working';
                } else {
                    cfbdResult = '⚠️ Invalid response';
                }
            } catch (error) {
                cfbdResult = `❌ Error: ${error.message.substring(0, 20)}...`;
            }
        }
        
        // Test Odds API
        if (status.odds) {
            try {
                const bettingData = await api.getBettingLines('americanfootball_ncaaf');
                if (bettingData) {
                    oddsResult = '✅ Working';
                } else {
                    oddsResult = '⚠️ Invalid response';
                }
            } catch (error) {
                oddsResult = `❌ Error: ${error.message.substring(0, 20)}...`;
            }
        }
        
        // Show results
        const resultMessage = `API Test Results:\n\n` +
            `College Football Data: ${cfbdResult}\n` +
            `The Odds API: ${oddsResult}\n` +
            `ESPN API: ${espnResult}\n\n` +
            `Overall Status: ${status.realData ? '✅ Live Data Ready' : '⚠️ Demo Mode'}`;
        
        alert(resultMessage);
        
        if (status.realData && cfbdResult.includes('✅') && oddsResult.includes('✅')) {
            showNotification('All APIs are working! You\'re ready for live data.', 'success');
        } else if (status.cfbd || status.odds) {
            showNotification('Some APIs are working. You\'ll get partial live data.', 'warning');
        } else {
            showNotification('No API keys configured. Using demo mode.', 'warning');
        }
        
    } catch (error) {
        console.error('API test failed:', error);
        showNotification('Failed to test APIs. Check console for details.', 'error');
    } finally {
        // Reset button
        testButton.innerHTML = originalText;
        testButton.disabled = false;
    }
}

// Handle generating game sheet
async function handleGenerateSheet() {
    const opponent = document.getElementById('opponent-input').value.trim();
    const gameDate = document.getElementById('game-date').value;
    const seasonYear = parseInt(document.getElementById('season-year').value);
    
    // Validation
    if (!opponent) {
        showNotification('Please enter an opponent team name', 'error');
        document.getElementById('opponent-input').focus();
        return;
    }
    
    if (!gameDate) {
        showNotification('Please select a game date', 'error');
        document.getElementById('game-date').focus();
        return;
    }
    
    // Hide any existing errors
    gameSheet.hideError();
    
    try {
        // Generate the game sheet
        await gameSheet.generateGameSheet(opponent, gameDate, seasonYear);
        
        // Save state for browser navigation
        if (gameSheet.currentData) {
            history.pushState(
                { gameData: gameSheet.currentData },
                `Nebraska vs ${opponent}`,
                `?opponent=${encodeURIComponent(opponent)}&date=${gameDate}&year=${seasonYear}`
            );
        }
        
        // Show success notification
        showNotification(`Game sheet generated for Nebraska vs ${opponent}!`, 'success');
        
    } catch (error) {
        console.error('Failed to generate game sheet:', error);
        showNotification('Failed to generate game sheet. Please try again.', 'error');
    }
}

// Load saved API keys
function loadSavedApiKeys() {
    const cfbdKey = localStorage.getItem('cfbd_api_key');
    const oddsKey = localStorage.getItem('odds_api_key');
    
    // Don't populate the fields for security, but indicate if keys are saved
    if (cfbdKey) {
        const cfbdInput = document.getElementById('cfbd-api-key');
        if (cfbdInput) {
            cfbdInput.placeholder = 'API key saved ✓';
        }
    }
    
    if (oddsKey) {
        const oddsInput = document.getElementById('odds-api-key');
        if (oddsInput) {
            oddsInput.placeholder = 'API key saved ✓';
        }
    }
}

// Update API status in UI
function updateApiStatus() {
    const status = api.getApiStatus();
    gameSheet.updateApiStatus(status);
}

// Save form data
function saveFormData() {
    const formData = {
        opponent: document.getElementById('opponent-input').value,
        date: document.getElementById('game-date').value,
        year: document.getElementById('season-year').value
    };
    
    localStorage.setItem('huskers_form_data', JSON.stringify(formData));
}

// Load form data
function loadFormData() {
    const savedData = localStorage.getItem('huskers_form_data');
    if (savedData) {
        try {
            const formData = JSON.parse(savedData);
            
            if (formData.opponent) {
                document.getElementById('opponent-input').value = formData.opponent;
            }
            if (formData.date) {
                document.getElementById('game-date').value = formData.date;
            }
            if (formData.year) {
                document.getElementById('season-year').value = formData.year;
            }
        } catch (error) {
            console.warn('Failed to load saved form data:', error);
        }
    }
}

// Show notification
function showNotification(message, type = 'info') {
    // Remove existing notifications
    const existing = document.querySelectorAll('.notification');
    existing.forEach(n => n.remove());
    
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification fixed top-4 right-4 z-50 max-w-sm p-4 rounded-lg shadow-lg transform translate-x-full transition-transform duration-300`;
    
    // Set styling based on type
    switch (type) {
        case 'success':
            notification.classList.add('bg-green-500', 'text-white');
            notification.innerHTML = `<i class="fas fa-check-circle mr-2"></i>${message}`;
            break;
        case 'error':
            notification.classList.add('bg-red-500', 'text-white');
            notification.innerHTML = `<i class="fas fa-exclamation-circle mr-2"></i>${message}`;
            break;
        case 'warning':
            notification.classList.add('bg-yellow-500', 'text-white');
            notification.innerHTML = `<i class="fas fa-exclamation-triangle mr-2"></i>${message}`;
            break;
        default:
            notification.classList.add('bg-blue-500', 'text-white');
            notification.innerHTML = `<i class="fas fa-info-circle mr-2"></i>${message}`;
    }
    
    // Add close button
    const closeButton = document.createElement('button');
    closeButton.className = 'float-right ml-4 text-white hover:text-gray-200';
    closeButton.innerHTML = '<i class="fas fa-times"></i>';
    closeButton.onclick = () => hideNotification(notification);
    notification.appendChild(closeButton);
    
    // Add to DOM
    document.body.appendChild(notification);
    
    // Animate in
    setTimeout(() => {
        notification.classList.remove('translate-x-full');
    }, 100);
    
    // Auto-hide after 5 seconds
    setTimeout(() => {
        hideNotification(notification);
    }, 5000);
}

// Hide notification
function hideNotification(notification) {
    notification.classList.add('translate-x-full');
    setTimeout(() => {
        if (notification.parentNode) {
            notification.parentNode.removeChild(notification);
        }
    }, 300);
}

// Hide loading screen
function hideLoadingScreen() {
    const loadingScreen = document.getElementById('loading-screen');
    if (loadingScreen) {
        setTimeout(() => {
            loadingScreen.style.opacity = '0';
            setTimeout(() => {
                loadingScreen.style.display = 'none';
            }, 500);
        }, 1000);
    }
}

// Debounce utility function
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// URL parameter handling
function handleUrlParameters() {
    const urlParams = new URLSearchParams(window.location.search);
    const opponent = urlParams.get('opponent');
    const date = urlParams.get('date');
    const year = urlParams.get('year');
    
    if (opponent) {
        document.getElementById('opponent-input').value = decodeURIComponent(opponent);
    }
    if (date) {
        document.getElementById('game-date').value = date;
    }
    if (year) {
        document.getElementById('season-year').value = year;
    }
    
    // Auto-generate if all parameters are present
    if (opponent && date) {
        setTimeout(() => {
            handleGenerateSheet();
        }, 1500);
    }
}

// Utility functions for external access
window.huskersUtils = {
    // Clear all data
    clearAllData() {
        localStorage.removeItem('huskers_form_data');
        localStorage.removeItem('cfbd_api_key');
        localStorage.removeItem('odds_api_key');
        gameSheet.clearContent();
        showNotification('All data cleared', 'info');
    },
    
    // Export settings
    exportSettings() {
        const settings = {
            formData: localStorage.getItem('huskers_form_data'),
            hasApiKeys: !!(localStorage.getItem('cfbd_api_key') || localStorage.getItem('odds_api_key'))
        };
        
        const blob = new Blob([JSON.stringify(settings, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'huskers-settings.json';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    },
    
    // Import settings
    importSettings(file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            try {
                const settings = JSON.parse(e.target.result);
                if (settings.formData) {
                    localStorage.setItem('huskers_form_data', settings.formData);
                    loadFormData();
                }
                showNotification('Settings imported successfully', 'success');
            } catch (error) {
                showNotification('Failed to import settings', 'error');
            }
        };
        reader.readAsText(file);
    },
    
    // Get API statistics
    getApiStats() {
        return {
            apiStatus: api.getApiStatus(),
            cacheStats: api.getCacheStats(),
            chartStats: charts.getChartStats()
        };
    },
    
    // Generate quick report
    async generateQuickReport(opponent, date) {
        try {
            document.getElementById('opponent-input').value = opponent;
            document.getElementById('game-date').value = date;
            await handleGenerateSheet();
        } catch (error) {
            console.error('Failed to generate quick report:', error);
        }
    }
};

// Analytics and error tracking (if needed)
window.addEventListener('error', function(e) {
    console.error('Global error:', e.error);
    showNotification('An unexpected error occurred. Please refresh the page.', 'error');
});

window.addEventListener('unhandledrejection', function(e) {
    console.error('Unhandled promise rejection:', e.reason);
});

// Service Worker registration (for offline support if needed)
if ('serviceWorker' in navigator && window.location.protocol === 'https:') {
    window.addEventListener('load', function() {
        navigator.serviceWorker.register('/huskers/sw.js')
            .then(function(registration) {
                console.log('ServiceWorker registration successful');
            })
            .catch(function(err) {
                console.log('ServiceWorker registration failed');
            });
    });
}

// Performance monitoring
function measurePerformance() {
    if ('performance' in window) {
        const navigation = performance.getEntriesByType('navigation')[0];
        if (navigation) {
            console.log(`Page load time: ${navigation.loadEventEnd - navigation.loadEventStart}ms`);
        }
    }
}

// Call performance measurement after page load
window.addEventListener('load', measurePerformance);

// Expose main objects globally for debugging
window.DEBUG = {
    api,
    charts,
    gameSheet,
    config: CONFIG
};

console.log('Nebraska Huskers Game Sheet Generator loaded successfully');
console.log('Available utilities: window.huskersUtils');
console.log('Debug objects: window.DEBUG');
