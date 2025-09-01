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
                window.api = api; // ⭐ EXPOSE API GLOBALLY
                console.log('🚀 API handler initialized and exposed globally');
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
            safeUpdateApiStatus();
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
    try {
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
        
        // Form inputs - with null checks
        const opponentInput = document.getElementById('opponent-input');
        const dateInput = document.getElementById('game-date');
        const yearSelect = document.getElementById('season-year');
        
        if (opponentInput) {
            opponentInput.addEventListener('keypress', function(e) {
                if (e.key === 'Enter') {
                    handleGenerateSheet();
                }
            });
            
            // Auto-save form data
            opponentInput.addEventListener('input', debounce(saveFormData, 500));
        }
        
        if (dateInput) {
            dateInput.addEventListener('change', saveFormData);
        }
        
        if (yearSelect) {
            yearSelect.addEventListener('change', saveFormData);
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
                if (window.huskersGameSheet && window.huskersGameSheet.currentData) {
                    window.huskersGameSheet.downloadReport();
                }
            }
        });
        
        // Print functionality
        window.addEventListener('beforeprint', function() {
            document.body.classList.add('printing');
        });
        
        window.addEventListener('afterprint', function() {
            document.body.classList.remove('printing');
        });
        
        // Handle browser back/forward
        window.addEventListener('popstate', function(e) {
            if (e.state && e.state.gameData && window.huskersGameSheet) {
                window.huskersGameSheet.currentData = e.state.gameData;
                window.huskersGameSheet.renderGameSheet();
            }
        });
        
        // Load saved form data
        loadFormData();
        
    } catch (error) {
        console.warn('Error setting up event listeners:', error);
    }
}

// Safe API status update
function safeUpdateApiStatus() {
    try {
        if (window.huskersGameSheet && typeof window.huskersGameSheet.updateApiStatus === 'function') {
            const status = api ? api.getApiStatus() : { realData: false };
            window.huskersGameSheet.updateApiStatus(status);
        } else {
            console.log('API Status: Demo mode (no live data)');
        }
    } catch (error) {
        console.warn('Could not update API status:', error);
    }
}

// Safe form data loading
function loadFormData() {
    try {
        const savedData = localStorage.getItem('huskers_form_data');
        if (savedData) {
            const formData = JSON.parse(savedData);
            
            const opponentInput = document.getElementById('opponent-input');
            const opponentSelect = document.getElementById('opponent-select');
            const dateInput = document.getElementById('game-date');
            const yearSelect = document.getElementById('season-year');
            
            if (formData.opponent) {
                if (opponentInput) opponentInput.value = formData.opponent;
                if (opponentSelect) opponentSelect.value = formData.opponent;
            }
            
            if (formData.date && dateInput) {
                dateInput.value = formData.date;
            }
            
            if (formData.season && yearSelect) {
                yearSelect.value = formData.season;
            }
        }
    } catch (error) {
        console.warn('Failed to load saved form data:', error);
    }
}

// Safe form data saving
function saveFormData() {
    try {
        const opponentInput = document.getElementById('opponent-input');
        const opponentSelect = document.getElementById('opponent-select');
        const dateInput = document.getElementById('game-date');
        const yearSelect = document.getElementById('season-year');
        
        const formData = {
            opponent: (opponentSelect?.value || opponentInput?.value || '').trim(),
            date: dateInput?.value || '',
            season: yearSelect?.value || new Date().getFullYear().toString()
        };
        
        localStorage.setItem('huskers_form_data', JSON.stringify(formData));
    } catch (error) {
        console.warn('Failed to save form data:', error);
    }
}

// Debounce function for performance
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

// Safe API key loading
function loadSavedApiKeys() {
    try {
        if (api && typeof api.loadSavedKeys === 'function') {
            api.loadSavedKeys();
        }
    } catch (error) {
        console.warn('Could not load saved API keys:', error);
    }
}

// Handle URL parameters
function handleUrlParameters() {
    try {
        const urlParams = new URLSearchParams(window.location.search);
        const opponent = urlParams.get('opponent');
        const date = urlParams.get('date');
        
        if (opponent) {
            const opponentInput = document.getElementById('opponent-input');
            const opponentSelect = document.getElementById('opponent-select');
            if (opponentInput) opponentInput.value = opponent;
            if (opponentSelect) opponentSelect.value = opponent;
        }
        
        if (date) {
            const dateInput = document.getElementById('game-date');
            if (dateInput) dateInput.value = date;
        }
        
        // Auto-generate if both parameters are present
        if (opponent && date) {
            setTimeout(() => {
                if (window.huskersGameSheet) {
                    window.huskersGameSheet.generateGameSheet();
                }
            }, 1000);
        }
    } catch (error) {
        console.warn('Error handling URL parameters:', error);
    }
}

// Handle game sheet generation
function handleGenerateSheet() {
    try {
        if (window.huskersGameSheet && typeof window.huskersGameSheet.generateGameSheet === 'function') {
            window.huskersGameSheet.generateGameSheet();
        } else {
            console.warn('Game sheet generator not available');
            showNotification('Game sheet generator is not ready. Please refresh the page.', 'error');
        }
    } catch (error) {
        console.error('Error generating game sheet:', error);
        showNotification('Failed to generate game sheet. Please try again.', 'error');
    }
}

// Handle API key saving
function handleSaveApiKeys() {
    try {
        const cfbdKey = document.getElementById('cfbd-api-key')?.value?.trim();
        const oddsKey = document.getElementById('odds-api-key')?.value?.trim();
        
        const keys = {};
        if (cfbdKey) keys.cfbd = cfbdKey;
        if (oddsKey) keys.odds = oddsKey;
        
        if (Object.keys(keys).length === 0) {
            showNotification('Please enter at least one API key', 'warning');
            return;
        }
        
        if (api && typeof api.setApiKeys === 'function') {
            api.setApiKeys(keys);
            showNotification('API keys saved successfully!', 'success');
            safeUpdateApiStatus();
        } else {
            console.warn('API handler not available');
        }
    } catch (error) {
        console.error('Error saving API keys:', error);
        showNotification('Failed to save API keys', 'error');
    }
}

// Handle API key testing
function handleTestApiKeys() {
    try {
        if (api && typeof api.testApiConnection === 'function') {
            api.testApiConnection();
        } else {
            console.warn('API handler not available for testing');
        }
    } catch (error) {
        console.error('Error testing API keys:', error);
        showNotification('Failed to test API keys', 'error');
    }
}

// Show notification helper
function showNotification(message, type = 'info') {
    try {
        // Create notification element if it doesn't exist
        let notification = document.getElementById('notification');
        if (!notification) {
            notification = document.createElement('div');
            notification.id = 'notification';
            notification.className = 'fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg max-w-sm';
            document.body.appendChild(notification);
        }
        
        // Set message and styling based on type
        const colors = {
            success: 'bg-green-500 text-white',
            error: 'bg-red-500 text-white',
            warning: 'bg-yellow-500 text-black',
            info: 'bg-blue-500 text-white'
        };
        
        notification.className = `fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg max-w-sm ${colors[type] || colors.info}`;
        notification.textContent = message;
        notification.style.display = 'block';
        
        // Auto-hide after 3 seconds
        setTimeout(() => {
            if (notification) {
                notification.style.display = 'none';
            }
        }, 3000);
    } catch (error) {
        console.warn('Could not show notification:', message);
        // Fallback to alert
        alert(message);
    }
}

// Hide loading screen
function hideLoadingScreen() {
    try {
        const loadingScreen = document.getElementById('loading-screen');
        if (loadingScreen) {
            loadingScreen.style.display = 'none';
        }
    } catch (error) {
        console.warn('Could not hide loading screen:', error);
    }
}

// Utility functions
const CONFIG = {
    version: '2.0.1',
    apiTimeout: 10000,
    cacheDuration: 300000, // 5 minutes
    maxRetries: 3
};

// Expose utilities globally
window.huskersUtils = {
    // Export settings
    exportSettings() {
        const settings = {
            formData: localStorage.getItem('huskers_form_data'),
            apiKeys: localStorage.getItem('huskers_api_keys'),
            version: CONFIG.version,
            exportDate: new Date().toISOString()
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
            apiStatus: api ? api.getApiStatus() : { realData: false },
            cacheStats: api ? api.getCacheStats() : null,
            chartStats: charts ? charts.getChartStats() : null
        };
    },
    
    // Generate quick report
    async generateQuickReport(opponent, date) {
        try {
            const opponentInput = document.getElementById('opponent-input');
            const opponentSelect = document.getElementById('opponent-select');
            const dateInput = document.getElementById('game-date');
            
            if (opponentInput) opponentInput.value = opponent;
            if (opponentSelect) opponentSelect.value = opponent;
            if (dateInput) dateInput.value = date;
            
            await handleGenerateSheet();
        } catch (error) {
            console.error('Failed to generate quick report:', error);
        }
    }
};

// Analytics and error tracking
window.addEventListener('error', function(e) {
    console.error('Global error:', e.error);
    showNotification('An unexpected error occurred. Please refresh the page.', 'error');
});

window.addEventListener('unhandledrejection', function(e) {
    console.error('Unhandled promise rejection:', e.reason);
});

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
    api: window.api || api,
    charts,
    gameSheet: window.huskersGameSheet || null,
    config: CONFIG,
    version: '2.0.1'
};

console.log('🏈 Nebraska Huskers Game Sheet Generator loaded successfully');
console.log('📊 Available utilities: window.huskersUtils');
console.log('🔧 Debug objects: window.DEBUG');