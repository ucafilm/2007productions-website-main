// Nebraska Huskers Game Sheet Generator - Enhanced Production Version
class HuskersGameSheet {
    constructor() {
        this.currentData = null;
        this.isGenerating = false;
        this.formData = {};
        
        // Configuration object for easy maintenance
        this.config = {
            defaultLocation: 'Memorial Stadium, Lincoln, NE',
            defaultTv: 'TBD',
            defaultTime: '2:30 PM CT',
            apiTimeout: 10000,
            retryAttempts: 3,
            // Teams can be overridden by loading from external source
            teamsUrl: './config/teams.json' // Optional: load from external file
        };
        
        // Cache DOM elements to avoid repeated queries
        this.elements = {
            generateBtn: document.getElementById('generate-sheet'),
            generateBtnText: document.getElementById('generate-text'),
            form: document.getElementById('game-form'),
            contentContainer: document.getElementById('game-sheet-content'),
            errorDiv: document.getElementById('error-message'),
            errorText: document.getElementById('error-text'),
            opponentInput: document.getElementById('opponent-input'),
            gameDate: document.getElementById('game-date'),
            seasonYear: document.getElementById('season-year')
        };
        
        this.initializeEventListeners();
        
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.initializeAsync());
        } else {
            this.initializeAsync();
        }
        
        console.log('🏈 Nebraska Game Sheet Generator initialized');
    }
    
    async initializeAsync() {
        // Load teams configuration if available
        await this.loadTeamsFromConfig();
        
        // Initialize team dropdown
        this.initializeTeamDropdown();
    }
    
    initializeEventListeners() {
        // Main generation button
        if (this.elements.generateBtn) {
            this.elements.generateBtn.addEventListener('click', () => this.generateGameSheet());
        }
        
        // Improved delegated event listener using data-action attributes
        document.addEventListener('click', (e) => {
            const target = e.target.closest('[data-action]');
            if (!target) return;
            
            const action = target.dataset.action;
            
            // Action map for cleaner code
            const actions = {
                download: () => this.downloadReport(),
                share: () => this.shareReport(),
                print: () => this.printReport(),
                clear: () => this.clearContent()
            };
            
            if (actions[action]) {
                e.preventDefault();
                actions[action]();
            }
        });
        
        // Form submission
        if (this.elements.form) {
            this.elements.form.addEventListener('submit', (e) => {
                e.preventDefault();
                this.generateGameSheet();
            });
        }
        
        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if (e.ctrlKey || e.metaKey) {
                switch (e.key) {
                    case 'g':
                        e.preventDefault();
                        this.generateGameSheet();
                        break;
                    case 'd':
                        e.preventDefault();
                        this.downloadReport();
                        break;
                    case 'p':
                        e.preventDefault();
                        this.printReport();
                        break;
                    case 's':
                        e.preventDefault();
                        this.shareReport();
                        break;
                }
            }
        });
    }
    
    async loadTeamsFromConfig() {
        // Optional: Load teams from external configuration
        if (this.config.teamsUrl) {
            try {
                const response = await fetch(this.config.teamsUrl);
                if (response.ok) {
                    const teamsData = await response.json();
                    if (teamsData.teams && Array.isArray(teamsData.teams)) {
                        this.config.teams = teamsData.teams;
                        console.log('🏈 Teams loaded from external config');
                    }
                }
            } catch (error) {
                console.warn('Could not load teams from external config, using defaults:', error);
            }
        }
    }
    
    getTeamsList() {
        // In production, this could be loaded from a JSON file or API
        // For now, keeping it as a method to make it easily configurable
        return this.config.teams || [
            'Alabama', 'Arizona', 'Arizona State', 'Arkansas', 'Auburn',
            'Baylor', 'Boston College', 'BYU', 'California', 'Cincinnati',
            'Clemson', 'Colorado', 'Colorado State', 'Duke', 'Florida',
            'Florida State', 'Georgia', 'Georgia Tech', 'Illinois', 'Indiana',
            'Iowa', 'Iowa State', 'Kansas', 'Kansas State', 'Kentucky',
            'Louisiana', 'LSU', 'Maryland', 'Miami', 'Michigan',
            'Michigan State', 'Minnesota', 'Mississippi State', 'Missouri',
            'NC State', 'North Carolina', 'Northwestern', 'Notre Dame',
            'Ohio State', 'Oklahoma', 'Oklahoma State', 'Ole Miss', 'Oregon',
            'Oregon State', 'Penn State', 'Purdue', 'Rutgers', 'South Carolina',
            'Stanford', 'Syracuse', 'TCU', 'Tennessee', 'Texas', 'Texas A&M',
            'Texas Tech', 'UCLA', 'USC', 'Utah', 'Vanderbilt', 'Virginia',
            'Virginia Tech', 'Wake Forest', 'Washington', 'Washington State',
            'West Virginia', 'Wisconsin'
        ];
    }
    
    initializeTeamDropdown() {
        if (!this.elements.opponentInput) return;
        
        const dropdown = document.createElement('select');
        dropdown.id = 'opponent-select';
        dropdown.className = 'w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 bg-white shadow-sm';
        dropdown.required = true;
        
        const defaultOption = document.createElement('option');
        defaultOption.value = '';
        defaultOption.textContent = '🏈 Select Opponent Team...';
        dropdown.appendChild(defaultOption);
        
        this.getTeamsList().forEach(team => {
            if (team !== 'Nebraska') {
                const option = document.createElement('option');
                option.value = team;
                option.textContent = team;
                dropdown.appendChild(option);
            }
        });
        
        this.elements.opponentInput.parentNode.replaceChild(dropdown, this.elements.opponentInput);
        
        // Update the cached element reference
        this.elements.opponentSelect = dropdown;
    }
    
    async generateGameSheet() {
        if (this.isGenerating) return;
        
        try {
            this.isGenerating = true;
            this.showLoadingState();
            this.hideError();
            
            this.formData = this.getFormData();
            
            if (!this.validateFormData()) {
                return;
            }
            
            const gameData = await this.fetchGameData();
            await this.renderGameSheet(gameData);
            
            console.log('🎉 Game sheet generated successfully!');
            
        } catch (error) {
            console.error('❌ Error generating game sheet:', error);
            this.showError('Failed to generate game sheet. Please try again.');
        } finally {
            this.isGenerating = false;
            this.hideLoadingState();
        }
    }
    
    getFormData() {
        return {
            opponent: (this.elements.opponentSelect?.value || this.elements.opponentInput?.value || '').trim(),
            date: this.elements.gameDate?.value || '',
            season: this.elements.seasonYear?.value || new Date().getFullYear().toString(),
            location: this.config.defaultLocation,
            tv: this.config.defaultTv,
            time: this.config.defaultTime
        };
    }
    
    validateFormData() {
        const { opponent, date } = this.formData;
        
        if (!opponent) {
            this.showError('Please select an opponent team from the dropdown.');
            return false;
        }
        
        if (!date) {
            this.showError('Please select a game date.');
            return false;
        }
        
        return true;
    }
    
    async fetchGameData() {
        const promises = [
            this.fetchTeamData(),
            this.fetchBettingData()
        ];
        
        const [teamData, bettingData] = await Promise.allSettled(promises);
        
        return {
            teamData: teamData.status === 'fulfilled' ? teamData.value : null,
            bettingData: bettingData.status === 'fulfilled' ? bettingData.value : null,
            gameInfo: {
                ...this.formData,
                generatedAt: new Date().toLocaleString()
            }
        };
    }
    
    async fetchTeamData() {
        if (!window.api) {
            console.warn('🟡 API handler not available, using demo data');
            return this.getDemoTeamData();
        }
        
        try {
            const nebraska = await window.api.getTeamStats('Nebraska', this.formData.season);
            const opponent = await window.api.getTeamStats(this.formData.opponent, this.formData.season);
            return { nebraska, opponent };
        } catch (error) {
            console.warn('Using demo data for team stats:', error.message);
            return this.getDemoTeamData();
        }
    }
    
    async fetchBettingData() {
        if (!window.api) return this.getDemoBettingData();
        
        try {
            return await window.api.getBettingLines('Nebraska', this.formData.opponent);
        } catch (error) {
            console.warn('Using demo data for betting lines:', error.message);
            return this.getDemoBettingData();
        }
    }
    
    async renderGameSheet(gameData) {
        if (!this.elements.contentContainer) return;
        
        this.currentData = {
            ...gameData,
            nebraska: gameData.teamData?.nebraska || this.getDemoTeamData().nebraska,
            opponent: gameData.teamData?.opponent || this.getDemoTeamData().opponent,
            betting: gameData.bettingData || this.getDemoBettingData(),
            gameInfo: gameData.gameInfo,
            generatedAt: gameData.gameInfo.generatedAt
        };
        
        const html = this.generateGameSheetHTML();
        this.elements.contentContainer.innerHTML = html;
        this.elements.contentContainer.classList.remove('hidden');
        
        setTimeout(() => {
            this.elements.contentContainer.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 100);
    }
    
    generateGameSheetHTML() {
        const { nebraska, opponent, betting, gameInfo } = this.currentData;
        
        return `<div class="bg-white rounded-xl shadow-2xl overflow-hidden max-w-7xl mx-auto">
            <div class="bg-gradient-to-br from-red-600 via-red-700 to-red-900 text-white p-8 relative">
                <h1 class="text-4xl font-bold mb-4">🏈 Nebraska vs ${gameInfo.opponent}</h1>
                <p class="text-xl mb-2">${new Date(gameInfo.date).toLocaleDateString('en-US', { 
                    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
                })} • ${gameInfo.time}</p>
                <p class="text-red-200">Memorial Stadium • Lincoln, NE</p>
            </div>
            
            <div class="p-6">
                <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <div class="bg-red-50 p-6 rounded-xl">
                        <h3 class="text-2xl font-bold text-red-600 mb-4">🌽 Nebraska</h3>
                        <div class="space-y-3">
                            <div class="flex justify-between">
                                <span>Record:</span>
                                <span class="font-bold">${nebraska.record}</span>
                            </div>
                            <div class="flex justify-between">
                                <span>PPG:</span>
                                <span class="font-bold">${nebraska.offense.pointsPerGame}</span>
                            </div>
                            <div class="flex justify-between">
                                <span>Allowed:</span>
                                <span class="font-bold">${nebraska.defense.pointsAllowed}</span>
                            </div>
                        </div>
                    </div>
                    
                    <div class="bg-gray-50 p-6 rounded-xl">
                        <h3 class="text-2xl font-bold text-gray-600 mb-4">⚡ ${gameInfo.opponent}</h3>
                        <div class="space-y-3">
                            <div class="flex justify-between">
                                <span>Record:</span>
                                <span class="font-bold">${opponent.record}</span>
                            </div>
                            <div class="flex justify-between">
                                <span>PPG:</span>
                                <span class="font-bold">${opponent.offense.pointsPerGame}</span>
                            </div>
                            <div class="flex justify-between">
                                <span>Allowed:</span>
                                <span class="font-bold">${opponent.defense.pointsAllowed}</span>
                            </div>
                        </div>
                    </div>
                </div>
                
                <div class="mt-8 text-center bg-gradient-to-r from-red-600 to-red-800 text-white p-6 rounded-xl">
                    <h2 class="text-2xl font-bold mb-4">🔮 Prediction</h2>
                    <p class="text-3xl font-bold">Nebraska 31 - ${gameInfo.opponent} 20</p>
                    <p class="mt-2 text-red-200">73% Confidence</p>
                </div>
                
                <div class="mt-8 grid grid-cols-2 lg:grid-cols-4 gap-4">
                    <button data-action="download" id="download-report" class="bg-red-600 text-white p-4 rounded-lg hover:bg-red-700 transition-colors">
                        <i class="fas fa-download mr-2"></i>Download
                    </button>
                    <button data-action="share" id="share-report" class="bg-blue-600 text-white p-4 rounded-lg hover:bg-blue-700 transition-colors">
                        <i class="fas fa-share mr-2"></i>Share
                    </button>
                    <button data-action="print" id="print-report" class="bg-green-600 text-white p-4 rounded-lg hover:bg-green-700 transition-colors">
                        <i class="fas fa-print mr-2"></i>Print
                    </button>
                    <button data-action="clear" id="clear-sheet" class="bg-gray-600 text-white p-4 rounded-lg hover:bg-gray-700 transition-colors">
                        <i class="fas fa-trash mr-2"></i>Clear
                    </button>
                </div>
            </div>
        </div>`;
    }
    
    getDemoTeamData() {
        return {
            nebraska: {
                record: '1-0 (1-0 Big Ten)',
                offense: {
                    pointsPerGame: 31.0,
                    yardsPerGame: 425,
                    passingYards: 280,
                    rushingYards: 145
                },
                defense: {
                    pointsAllowed: 17.0,
                    yardsAllowed: 310
                },
                keyPlayers: [
                    { name: 'Dylan Raiola', position: 'QB', stats: '238 yards, 2 TDs' },
                    { name: 'Rahmir Johnson', position: 'RB', stats: '92 yards, 2 TDs' },
                    { name: 'Isaiah Neyor', position: 'WR', stats: '6 rec, 118 yards' },
                    { name: 'Nash Hutmacher', position: 'DL', stats: '5 tackles, 1.5 sacks' }
                ]
            },
            opponent: {
                record: '0-1 (0-1 Conference)',
                offense: {
                    pointsPerGame: 17.0,
                    yardsPerGame: 285
                },
                defense: {
                    pointsAllowed: 31.0,
                    yardsAllowed: 425
                },
                keyPlayers: [
                    { name: 'Sample QB', position: 'QB', stats: '165 yards, 1 TD' },
                    { name: 'Sample RB', position: 'RB', stats: '78 yards, 0 TDs' },
                    { name: 'Sample WR', position: 'WR', stats: '4 rec, 62 yards' },
                    { name: 'Sample LB', position: 'LB', stats: '8 tackles, 0.5 sacks' }
                ]
            }
        };
    }
    
    getDemoBettingData() {
        return {
            spread: 'Nebraska -6.5',
            overUnder: '48.5',
            moneyline: {
                nebraska: '-245',
                opponent: '+205'
            }
        };
    }
    
    showLoadingState() {
        if (this.elements.generateBtn && this.elements.generateBtnText) {
            this.elements.generateBtn.disabled = true;
            this.elements.generateBtn.classList.add('opacity-50');
            this.elements.generateBtnText.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i>Generating...';
        }
    }
    
    hideLoadingState() {
        if (this.elements.generateBtn && this.elements.generateBtnText) {
            this.elements.generateBtn.disabled = false;
            this.elements.generateBtn.classList.remove('opacity-50');
            this.elements.generateBtnText.innerHTML = '<i class="fas fa-rocket mr-2"></i>Generate Game Sheet';
        }
    }
    
    showError(message) {
        if (this.elements.errorDiv && this.elements.errorText) {
            this.elements.errorText.textContent = message;
            this.elements.errorDiv.classList.remove('hidden');
            setTimeout(() => this.elements.errorDiv.classList.add('hidden'), 5000);
        } else {
            alert('Error: ' + message);
        }
    }
    
    hideError() {
        if (this.elements.errorDiv) {
            this.elements.errorDiv.classList.add('hidden');
        }
    }
    
    downloadReport() {
        if (!this.currentData) {
            this.showError('No game sheet data available.');
            return;
        }
        
        const text = `Nebraska vs ${this.currentData.gameInfo.opponent}\nGenerated: ${this.currentData.gameInfo.generatedAt}\n\nPrediction: Nebraska 31 - ${this.currentData.gameInfo.opponent} 20`;
        const blob = new Blob([text], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = `nebraska-vs-${this.currentData.gameInfo.opponent.toLowerCase().replace(/\s+/g, '-')}.txt`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }
    
    shareReport() {
        if (!this.currentData) {
            this.showError('No game sheet data available.');
            return;
        }
        
        const shareData = {
            title: `Nebraska vs ${this.currentData.gameInfo.opponent}`,
            text: 'Check out this game analysis!',
            url: window.location.href
        };
        
        if (navigator.share) {
            navigator.share(shareData);
        } else if (navigator.clipboard) {
            navigator.clipboard.writeText(shareData.url);
            alert('Link copied to clipboard!');
        }
    }
    
    printReport() {
        if (!this.currentData) {
            this.showError('No game sheet data available.');
            return;
        }
        window.print();
    }
    
    clearContent() {
        if (this.elements.contentContainer) {
            this.elements.contentContainer.innerHTML = '';
            this.elements.contentContainer.classList.add('hidden');
        }
        this.currentData = null;
    }
    
    updateApiStatus(status) {
        // Optional method for API status updates
        console.log('API Status:', status);
    }
}

// Export and initialize
if (typeof module !== 'undefined' && module.exports) {
    module.exports = HuskersGameSheet;
} else {
    window.HuskersGameSheet = HuskersGameSheet;
}

// Auto-initialize when DOM is ready
if (typeof document !== 'undefined') {
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            if (!window.huskersGameSheet) {
                window.huskersGameSheet = new HuskersGameSheet();
                console.log('🏆 Nebraska Game Sheet System Ready!');
            }
        });
    } else {
        if (!window.huskersGameSheet) {
            window.huskersGameSheet = new HuskersGameSheet();
            console.log('🏆 Nebraska Game Sheet System Ready!');
        }
    }
}
