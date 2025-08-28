// Game Sheet Generator for Nebraska Huskers
// Handles the main game sheet creation and management

class HuskersGameSheet {
    constructor() {
        this.currentData = null;
        this.isGenerating = false;
        this.formData = {};
        
        // Initialize event listeners
        this.initializeEventListeners();
        
        console.log('HuskersGameSheet initialized');
    }
    
    // Initialize event listeners
    initializeEventListeners() {
        // Main generation button
        const generateBtn = document.getElementById('generate-sheet');
        if (generateBtn) {
            generateBtn.addEventListener('click', () => this.generateGameSheet());
        }
        
        // Download buttons
        const downloadBtn = document.getElementById('download-report');
        if (downloadBtn) {
            downloadBtn.addEventListener('click', () => this.downloadReport());
        }
        
        // Clear button
        const clearBtn = document.getElementById('clear-sheet');
        if (clearBtn) {
            clearBtn.addEventListener('click', () => this.clearContent());
        }
        
        // Form inputs
        const form = document.getElementById('game-form');
        if (form) {
            form.addEventListener('submit', (e) => {
                e.preventDefault();
                this.generateGameSheet();
            });
        }
        
        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if (e.ctrlKey && e.key === 'g') {
                e.preventDefault();
                this.generateGameSheet();
            } else if (e.ctrlKey && e.key === 'd') {
                e.preventDefault();
                this.downloadReport();
            }
        });
    }
    
    // Main game sheet generation
    async generateGameSheet() {
        if (this.isGenerating) return;
        
        try {
            this.isGenerating = true;
            this.showLoadingState();
            this.hideError();
            
            // Get form data
            this.formData = this.getFormData();
            
            if (!this.validateFormData()) {
                return;
            }
            
            // Fetch data from APIs
            const gameData = await this.fetchGameData();
            
            // Generate the sheet
            await this.renderGameSheet(gameData);
            
            // Update API status
            this.updateApiStatus(window.api.getApiStatus());
            
            console.log('Game sheet generated successfully');
            
        } catch (error) {
            console.error('Error generating game sheet:', error);
            this.showError('Failed to generate game sheet. Please try again.');
        } finally {
            this.isGenerating = false;
            this.hideLoadingState();
        }
    }
    
    // Get form data
    getFormData() {
        return {
            opponent: document.getElementById('opponent-input')?.value?.trim() || '',
            date: document.getElementById('game-date')?.value || '',
            season: document.getElementById('season-year')?.value || new Date().getFullYear().toString(),
            location: 'Memorial Stadium, Lincoln, NE',
            tv: 'TBD',
            time: '2:30 PM CT'
        };
    }
    
    // Validate form data
    validateFormData() {
        const { opponent, date } = this.formData;
        
        if (!opponent) {
            this.showError('Please enter an opponent team name.');
            return false;
        }
        
        if (!date) {
            this.showError('Please select a game date.');
            return false;
        }
        
        return true;
    }
    
    // Fetch all game data
    async fetchGameData() {
        const promises = [
            this.fetchTeamData(),
            this.fetchBettingData(),
            this.fetchWeatherData()
        ];
        
        const [teamData, bettingData, weatherData] = await Promise.allSettled(promises);
        
        return {
            teamData: teamData.status === 'fulfilled' ? teamData.value : null,
            bettingData: bettingData.status === 'fulfilled' ? bettingData.value : null,
            weatherData: weatherData.status === 'fulfilled' ? weatherData.value : null,
            gameInfo: {
                ...this.formData,
                generatedAt: new Date().toLocaleString()
            }
        };
    }
    
    // Fetch team statistics and data
    async fetchTeamData() {
        if (!window.api) {
            throw new Error('API handler not available');
        }
        
        try {
            // Fetch Nebraska and opponent data
            const nebraska = await window.api.getTeamStats('Nebraska', this.formData.season);
            const opponent = await window.api.getTeamStats(this.formData.opponent, this.formData.season);
            
            return { nebraska, opponent };
        } catch (error) {
            console.warn('Using demo data for team stats:', error.message);
            return this.getDemoTeamData();
        }
    }
    
    // Fetch betting lines and odds
    async fetchBettingData() {
        if (!window.api) return this.getDemoBettingData();
        
        try {
            return await window.api.getBettingLines('Nebraska', this.formData.opponent);
        } catch (error) {
            console.warn('Using demo data for betting lines:', error.message);
            return this.getDemoBettingData();
        }
    }
    
    // Fetch weather data (optional)
    async fetchWeatherData() {
        if (!this.formData.location) return null;
        
        try {
            return await window.api.getWeatherData(this.formData.location, this.formData.date);
        } catch (error) {
            console.warn('Weather data not available:', error.message);
            return null;
        }
    }
    
    // Render the complete game sheet
    async renderGameSheet(gameData) {
        const container = document.getElementById('game-sheet-content');
        if (!container) return;
        
        // Store current data
        this.currentData = {
            ...gameData,
            nebraska: gameData.teamData?.nebraska || this.getDemoTeamData().nebraska,
            opponent: gameData.teamData?.opponent || this.getDemoTeamData().opponent,
            betting: gameData.bettingData || this.getDemoBettingData(),
            gameInfo: gameData.gameInfo,
            generatedAt: gameData.gameInfo.generatedAt
        };
        
        // Generate HTML content
        const html = this.generateGameSheetHTML();
        container.innerHTML = html;
        container.classList.remove('hidden');
        
        // Initialize charts after DOM is ready
        setTimeout(() => {
            this.initializeCharts();
        }, 100);
        
        // Scroll to results
        container.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
    
    // Generate the main HTML content
    generateGameSheetHTML() {
        const { nebraska, opponent, betting, gameInfo } = this.currentData;
        
        return `
            <div class="bg-white rounded-xl shadow-2xl overflow-hidden">
                <!-- Header -->
                <div class="bg-gradient-to-r from-red-600 to-red-800 text-white p-6">
                    <div class="flex items-center justify-between">
                        <div>
                            <h1 class="text-3xl font-bold">Nebraska vs ${gameInfo.opponent}</h1>
                            <p class="text-red-100 mt-1">${gameInfo.date} • ${gameInfo.time}</p>
                        </div>
                        <div class="text-right">
                            <p class="text-red-100">Generated: ${gameInfo.generatedAt}</p>
                            <p class="text-red-100">${gameInfo.location}</p>
                        </div>
                    </div>
                </div>
                
                <!-- Game Info -->
                <div class="p-6 bg-gray-50 border-b">
                    <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div class="text-center">
                            <h3 class="font-bold text-gray-700">Date & Time</h3>
                            <p>${gameInfo.date} at ${gameInfo.time}</p>
                        </div>
                        <div class="text-center">
                            <h3 class="font-bold text-gray-700">Location</h3>
                            <p>${gameInfo.location || 'TBD'}</p>
                        </div>
                        <div class="text-center">
                            <h3 class="font-bold text-gray-700">Television</h3>
                            <p>${gameInfo.tv || 'TBD'}</p>
                        </div>
                    </div>
                </div>
                
                <!-- Betting Lines -->
                <div class="p-6 border-b">
                    <h2 class="text-2xl font-bold text-gray-800 mb-4">Betting Lines</h2>
                    <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div class="bg-red-50 p-4 rounded-lg text-center">
                            <h3 class="font-bold text-red-800">Spread</h3>
                            <p class="text-2xl font-bold text-red-600">${betting.spread}</p>
                        </div>
                        <div class="bg-blue-50 p-4 rounded-lg text-center">
                            <h3 class="font-bold text-blue-800">Over/Under</h3>
                            <p class="text-2xl font-bold text-blue-600">${betting.overUnder}</p>
                        </div>
                        <div class="bg-green-50 p-4 rounded-lg text-center">
                            <h3 class="font-bold text-green-800">Moneyline</h3>
                            <p class="text-sm text-green-600">NEB: ${betting.moneyline.nebraska}</p>
                            <p class="text-sm text-green-600">${gameInfo.opponent}: ${betting.moneyline.opponent}</p>
                        </div>
                    </div>
                </div>
                
                <!-- Team Comparison -->
                <div class="p-6 border-b">
                    <h2 class="text-2xl font-bold text-gray-800 mb-4">Team Comparison</h2>
                    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <!-- Stats Table -->
                        <div class="overflow-x-auto">
                            <table class="w-full text-sm">
                                <thead>
                                    <tr class="border-b-2">
                                        <th class="text-left py-2">Statistic</th>
                                        <th class="text-center py-2 text-red-600">Nebraska</th>
                                        <th class="text-center py-2">${gameInfo.opponent}</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr class="border-b">
                                        <td class="py-2">Points Per Game</td>
                                        <td class="text-center font-bold text-red-600">${nebraska.offense.pointsPerGame}</td>
                                        <td class="text-center">${opponent.offense.pointsPerGame}</td>
                                    </tr>
                                    <tr class="border-b">
                                        <td class="py-2">Total Yards/Game</td>
                                        <td class="text-center font-bold text-red-600">${nebraska.offense.yardsPerGame}</td>
                                        <td class="text-center">${opponent.offense.yardsPerGame}</td>
                                    </tr>
                                    <tr class="border-b">
                                        <td class="py-2">Points Allowed</td>
                                        <td class="text-center font-bold text-red-600">${nebraska.defense.pointsAllowed}</td>
                                        <td class="text-center">${opponent.defense.pointsAllowed}</td>
                                    </tr>
                                    <tr class="border-b">
                                        <td class="py-2">Yards Allowed/Game</td>
                                        <td class="text-center font-bold text-red-600">${nebraska.defense.yardsAllowed}</td>
                                        <td class="text-center">${opponent.defense.yardsAllowed}</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                        
                        <!-- Radar Chart -->
                        <div class="flex justify-center">
                            <div class="w-full max-w-md">
                                <canvas id="team-comparison-radar" width="400" height="400"></canvas>
                            </div>
                        </div>
                    </div>
                </div>
                
                <!-- Key Players -->
                <div class="p-6 border-b">
                    <h2 class="text-2xl font-bold text-gray-800 mb-4">Key Players</h2>
                    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <!-- Nebraska Players -->
                        <div>
                            <h3 class="text-xl font-bold text-red-600 mb-3">Nebraska</h3>
                            <div class="space-y-3">
                                ${nebraska.keyPlayers.map(player => `
                                    <div class="bg-red-50 p-3 rounded-lg">
                                        <div class="font-bold">${player.name}</div>
                                        <div class="text-sm text-gray-600">${player.position}</div>
                                        <div class="text-sm">${player.stats}</div>
                                    </div>
                                `).join('')}
                            </div>
                        </div>
                        
                        <!-- Opponent Players -->
                        <div>
                            <h3 class="text-xl font-bold text-gray-600 mb-3">${gameInfo.opponent}</h3>
                            <div class="space-y-3">
                                ${opponent.keyPlayers.map(player => `
                                    <div class="bg-gray-50 p-3 rounded-lg">
                                        <div class="font-bold">${player.name}</div>
                                        <div class="text-sm text-gray-600">${player.position}</div>
                                        <div class="text-sm">${player.stats}</div>
                                    </div>
                                `).join('')}
                            </div>
                        </div>
                    </div>
                </div>
                
                <!-- Prediction -->
                <div class="p-6 bg-red-50">
                    <h2 class="text-2xl font-bold text-red-800 mb-4">Prediction</h2>
                    <div class="text-center">
                        <p class="text-3xl font-bold text-red-600 mb-2">Nebraska 31, ${gameInfo.opponent} 20</p>
                        <p class="text-gray-600">Based on statistical analysis and current form</p>
                    </div>
                </div>
                
                <!-- Actions -->
                <div class="p-6 bg-gray-50">
                    <div class="flex flex-wrap gap-4 justify-center">
                        <button id="download-report" class="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors">
                            <i class="fas fa-download mr-2"></i>Download Report
                        </button>
                        <button id="clear-sheet" class="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors">
                            <i class="fas fa-trash mr-2"></i>Clear Sheet
                        </button>
                    </div>
                </div>
            </div>
        `;
    }
    
    // Initialize charts after content is rendered
    initializeCharts() {
        if (!window.charts) return;
        
        const { nebraska, opponent, gameInfo } = this.currentData;
        
        // Radar chart data
        const nebraskaRadarData = [
            nebraska.offense.pointsPerGame / 50 * 100,
            nebraska.offense.yardsPerGame / 500 * 100,
            (100 - nebraska.defense.pointsAllowed / 50 * 100),
            (100 - nebraska.defense.yardsAllowed / 500 * 100)
        ];
        
        const opponentRadarData = [
            opponent.offense.pointsPerGame / 50 * 100,
            opponent.offense.yardsPerGame / 500 * 100,
            (100 - opponent.defense.pointsAllowed / 50 * 100),
            (100 - opponent.defense.yardsAllowed / 500 * 100)
        ];
        
        // Create radar chart
        window.charts.createRadarChart(
            'team-comparison-radar',
            nebraskaRadarData,
            opponentRadarData,
            gameInfo.opponent
        );
    }
    
    // Download report as text file
    downloadReport() {
        if (!this.currentData) {
            this.showError('No game sheet data available to download.');
            return;
        }
        
        const reportText = this.generateReportText();
        const blob = new Blob([reportText], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = `nebraska-vs-${this.currentData.gameInfo.opponent.toLowerCase().replace(/\s+/g, '-')}-${this.currentData.gameInfo.date}.txt`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }
    
    // Generate text report
    generateReportText() {
        const { nebraska, opponent, betting, gameInfo, generatedAt } = this.currentData;
        
        return `
NEBRASKA CORNHUSKERS vs ${gameInfo.opponent.toUpperCase()}
GAME ANALYSIS REPORT
Generated: ${generatedAt}

GAME INFORMATION
================
Date: ${gameInfo.date} at ${gameInfo.time}
Location: ${gameInfo.location}
TV: ${gameInfo.tv}

BETTING LINES
=============
Spread: ${betting.spread}
Over/Under: ${betting.overUnder}
Moneyline: Nebraska ${betting.moneyline.nebraska}, ${gameInfo.opponent} ${betting.moneyline.opponent}

TEAM COMPARISON
===============
                    Nebraska    ${gameInfo.opponent}
Points Per Game       ${nebraska.offense.pointsPerGame}        ${opponent.offense.pointsPerGame}
Total Yards          ${nebraska.offense.yardsPerGame}       ${opponent.offense.yardsPerGame}
Points Allowed       ${nebraska.defense.pointsAllowed}        ${opponent.defense.pointsAllowed}

KEY PLAYERS
===========
Nebraska:
${nebraska.keyPlayers.map(p => `${p.name} (${p.position}): ${p.stats}`).join('\n')}

${gameInfo.opponent}:
${opponent.keyPlayers.map(p => `${p.name} (${p.position}): ${p.stats}`).join('\n')}

PREDICTION
==========
Nebraska 31, ${gameInfo.opponent} 20

Generated at: www.2007productions.com/huskers
        `;
    }
    
    // Show/hide loading states
    showLoadingState() {
        const button = document.getElementById('generate-sheet');
        const text = document.getElementById('generate-text');
        if (button && text) {
            button.disabled = true;
            text.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i>Generating...';
        }
    }
    
    hideLoadingState() {
        const button = document.getElementById('generate-sheet');
        const text = document.getElementById('generate-text');
        if (button && text) {
            button.disabled = false;
            text.innerHTML = '<i class="fas fa-rocket mr-2"></i>Generate Game Sheet';
        }
    }
    
    // Error handling
    showError(message) {
        const errorDiv = document.getElementById('error-message');
        const errorText = document.getElementById('error-text');
        if (errorDiv && errorText) {
            errorText.textContent = message;
            errorDiv.classList.remove('hidden');
        }
    }
    
    hideError() {
        const errorDiv = document.getElementById('error-message');
        if (errorDiv) {
            errorDiv.classList.add('hidden');
        }
    }
    
    // Update API status display
    updateApiStatus(status) {
        const statusElement = document.getElementById('api-status');
        const statusDetail = document.getElementById('api-status-detail');
        
        if (statusElement) {
            const indicator = statusElement.querySelector('div');
            const text = statusElement.querySelector('span');
            
            if (status.realData) {
                indicator.className = 'w-3 h-3 bg-green-400 rounded-full mr-2';
                text.textContent = 'Live Data';
            } else {
                indicator.className = 'w-3 h-3 bg-yellow-400 rounded-full mr-2';
                text.textContent = 'Demo Mode';
            }
        }
        
        if (statusDetail) {
            if (status.realData) {
                statusDetail.innerHTML = '<span class="text-green-600">Live data connected</span>';
            } else {
                statusDetail.innerHTML = '<span class="text-yellow-600">Demo mode - Add keys for live data</span>';
            }
        }
    }
    
    // Clear content
    clearContent() {
        const container = document.getElementById('game-sheet-content');
        if (container) {
            container.innerHTML = '';
            container.classList.add('hidden');
        }
        this.currentData = null;
    }
    
    // Demo data methods
    getDemoTeamData() {
        return {
            nebraska: {
                offense: {
                    pointsPerGame: 28.5,
                    yardsPerGame: 385,
                    passingYards: 245,
                    rushingYards: 140
                },
                defense: {
                    pointsAllowed: 21.2,
                    yardsAllowed: 352,
                    passingYardsAllowed: 215,
                    rushingYardsAllowed: 137
                },
                keyPlayers: [
                    { name: 'Dylan Raiola', position: 'QB', stats: '2,580 yards, 18 TDs' },
                    { name: 'Rahmir Johnson', position: 'RB', stats: '845 yards, 8 TDs' },
                    { name: 'Isaiah Neyor', position: 'WR', stats: '52 rec, 780 yards' }
                ]
            },
            opponent: {
                offense: {
                    pointsPerGame: 24.8,
                    yardsPerGame: 365,
                    passingYards: 220,
                    rushingYards: 145
                },
                defense: {
                    pointsAllowed: 19.5,
                    yardsAllowed: 325,
                    passingYardsAllowed: 195,
                    rushingYardsAllowed: 130
                },
                keyPlayers: [
                    { name: 'Sample Player', position: 'QB', stats: '2,100 yards, 15 TDs' },
                    { name: 'Sample Player', position: 'RB', stats: '720 yards, 6 TDs' },
                    { name: 'Sample Player', position: 'WR', stats: '45 rec, 650 yards' }
                ]
            }
        };
    }
    
    getDemoBettingData() {
        return {
            spread: 'Nebraska -7.5',
            overUnder: '52.5',
            moneyline: {
                nebraska: '-285',
                opponent: '+230'
            }
        };
    }
}

// Export the game sheet generator
if (typeof module !== 'undefined' && module.exports) {
    module.exports = HuskersGameSheet;
} else {
    window.HuskersGameSheet = HuskersGameSheet;
}
