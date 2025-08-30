// Game Sheet Generator for Nebraska Huskers
// Handles the main game sheet creation and management

class HuskersGameSheet {
    constructor() {
        this.currentData = null;
        this.isGenerating = false;
        this.formData = {};
        
        // Initialize event listeners
        this.initializeEventListeners();
        
        // Initialize team dropdown after DOM is ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.initializeTeamDropdown());
        // Share report functionality
    shareReport() {
        if (!this.currentData) {
            this.showError('No game sheet data available to share.');
            return;
        }
        
        const shareData = {
            title: `Nebraska vs ${this.currentData.gameInfo.opponent} - Game Analysis`,
            text: `Check out this detailed game analysis for Nebraska vs ${this.currentData.gameInfo.opponent}!`,
            url: window.location.href
        };
        
        if (navigator.share) {
            navigator.share(shareData).catch(err => {
                console.log('Error sharing:', err);
                this.fallbackShare(shareData);
            });
        } else {
            this.fallbackShare(shareData);
        }
    }
    
    // Fallback share method
    fallbackShare(shareData) {
        if (navigator.clipboard) {
            const shareText = `${shareData.title}\n${shareData.text}\n${shareData.url}`;
            navigator.clipboard.writeText(shareText).then(() => {
                alert('Share link copied to clipboard!');
            });
        } else {
            prompt('Copy this link to share:', shareData.url);
        }
    }
    
    // Print report functionality
    printReport() {
        if (!this.currentData) {
            this.showError('No game sheet data available to print.');
            return;
        }
        
        // Create a print-optimized version
        const printWindow = window.open('', '_blank');
        const printContent = this.generatePrintHTML();
        
        printWindow.document.write(`
            <!DOCTYPE html>
            <html>
            <head>
                <title>Nebraska vs ${this.currentData.gameInfo.opponent} - Game Sheet</title>
                <style>
                    body { font-family: Arial, sans-serif; margin: 20px; color: #333; }
                    .header { text-align: center; border-bottom: 3px solid #d32f2f; padding-bottom: 20px; margin-bottom: 30px; }
                    .section { margin-bottom: 25px; page-break-inside: avoid; }
                    .section h2 { color: #d32f2f; border-bottom: 1px solid #ddd; padding-bottom: 5px; }
                    table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
                    th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
                    th { background-color: #f5f5f5; }
                    .prediction { text-align: center; font-size: 18px; font-weight: bold; color: #d32f2f; }
                    @media print {
                        body { margin: 0; }
                        .no-print { display: none; }
                    }
                </style>
            </head>
            <body>
                ${printContent}
            </body>
            </html>
        `);
        
        printWindow.document.close();
        printWindow.focus();
        setTimeout(() => {
            printWindow.print();
            printWindow.close();
        }, 250);
    }
    
    // Generate print-optimized HTML
    generatePrintHTML() {
        const { nebraska, opponent, betting, gameInfo } = this.currentData;
        
        return `
            <div class="header">
                <h1>🏈 Nebraska Cornhuskers vs ${gameInfo.opponent}</h1>
                <p><strong>${gameInfo.date} • ${gameInfo.time}</strong></p>
                <p>Memorial Stadium, Lincoln, NE</p>
                <p><em>Generated: ${gameInfo.generatedAt}</em></p>
            </div>
            
            <div class="section">
                <h2>Team Records</h2>
                <table>
                    <tr>
                        <th>Team</th>
                        <th>Record</th>
                        <th>Points Per Game</th>
                        <th>Points Allowed</th>
                    </tr>
                    <tr>
                        <td><strong>Nebraska</strong></td>
                        <td>${nebraska.record}</td>
                        <td>${nebraska.offense.pointsPerGame}</td>
                        <td>${nebraska.defense.pointsAllowed}</td>
                    </tr>
                    <tr>
                        <td><strong>${gameInfo.opponent}</strong></td>
                        <td>${opponent.record}</td>
                        <td>${opponent.offense.pointsPerGame}</td>
                        <td>${opponent.defense.pointsAllowed}</td>
                    </tr>
                </table>
            </div>
            
            <div class="section">
                <h2>Betting Lines</h2>
                <table>
                    <tr>
                        <th>Spread</th>
                        <th>Over/Under</th>
                        <th>Nebraska ML</th>
                        <th>${gameInfo.opponent} ML</th>
                    </tr>
                    <tr>
                        <td>${betting.spread}</td>
                        <td>${betting.overUnder}</td>
                        <td>${betting.moneyline.nebraska}</td>
                        <td>${betting.moneyline.opponent}</td>
                    </tr>
                </table>
            </div>
            
            <div class="section">
                <h2>Key Players</h2>
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px;">
                    <div>
                        <h3>Nebraska</h3>
                        ${nebraska.keyPlayers.map(player => `
                            <p><strong>${player.name}</strong> (${player.position}): ${player.stats}</p>
                        `).join('')}
                    </div>
                    <div>
                        <h3>${gameInfo.opponent}</h3>
                        ${opponent.keyPlayers.map(player => `
                            <p><strong>${player.name}</strong> (${player.position}): ${player.stats}</p>
                        `).join('')}
                    </div>
                </div>
            </div>
            
            <div class="section prediction">
                <h2>Prediction</h2>
                <p>Nebraska 31, ${gameInfo.opponent} 20</p>
                <p><em>"Nebraska's home field advantage and superior rushing attack should prove decisive."</em></p>
            </div>
            
            <div class="section" style="text-align: center; font-size: 12px; color: #666;">
                <p>Generated by 2007 Productions Advanced Game Sheet System</p>
                <p>www.2007productions.com/huskers</p>
            </div>
        `;
    } else {
            this.initializeTeamDropdown();
        }
        
        console.log('HuskersGameSheet initialized');
    }
    
    // Initialize event listeners
    initializeEventListeners() {
        // Main generation button
        const generateBtn = document.getElementById('generate-sheet');
        if (generateBtn) {
            generateBtn.addEventListener('click', () => this.generateGameSheet());
        }
        
        // Download and action buttons (use event delegation for dynamic buttons)
        document.addEventListener('click', (e) => {
            if (e.target.id === 'download-report' || e.target.closest('#download-report')) {
                this.downloadReport();
            } else if (e.target.id === 'share-report' || e.target.closest('#share-report')) {
                this.shareReport();
            } else if (e.target.id === 'print-report' || e.target.closest('#print-report')) {
                this.printReport();
            } else if (e.target.id === 'clear-sheet' || e.target.closest('#clear-sheet')) {
                this.clearContent();
            }
        });
        
        // Additional keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if (e.ctrlKey && e.key === 'p') {
                e.preventDefault();
                this.printReport();
            } else if (e.ctrlKey && e.key === 's') {
                e.preventDefault();
                this.shareReport();
            }
        });
        
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
            
            this.formData = this.getFormData();
            
            if (!this.validateFormData()) {
                return;
            }
            
            const gameData = await this.fetchGameData();
            await this.renderGameSheet(gameData);
            
            if (window.api) {
                this.updateApiStatus(window.api.getApiStatus());
            }
            
            console.log('🎉 Enhanced game sheet generated successfully!');
            
        } catch (error) {
            console.error('❌ Error generating game sheet:', error);
            this.showError('Failed to generate game sheet. Please try again.');
        } finally {
            this.isGenerating = false;
            this.hideLoadingState();
        }
    }
    
    getFormData() {
        const opponentSelect = document.getElementById('opponent-select');
        const opponentInput = document.getElementById('opponent-input');
        
        return {
            opponent: (opponentSelect?.value || opponentInput?.value || '').trim(),
            date: document.getElementById('game-date')?.value || '',
            season: document.getElementById('season-year')?.value || new Date().getFullYear().toString(),
            location: 'Memorial Stadium, Lincoln, NE',
            tv: 'TBD',
            time: '2:30 PM CT'
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
    
    // Enhanced demo data with comprehensive statistics
    getDemoTeamData() {
        return {
            nebraska: {
                record: '8-4 (5-4 Big Ten)',
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
                advanced: {
                    pointsPerDrive: 2.4,
                    thirdDownPct: 42.5,
                    redZonePct: 78.9,
                    stopsPerDrive: 68.2,
                    sacksPerGame: 2.8,
                    turnoversForced: 18
                },
                recentForm: ['W', 'W', 'L', 'W', 'W'],
                keyPlayers: [
                    { name: 'Dylan Raiola', position: 'QB', stats: '2,580 yards, 18 TDs, 8 INTs, 142.5 rating' },
                    { name: 'Rahmir Johnson', position: 'RB', stats: '845 yards, 8 TDs, 4.2 YPC, 52 receptions' },
                    { name: 'Isaiah Neyor', position: 'WR', stats: '52 rec, 780 yards, 6 TDs, 15.0 YPR' },
                    { name: 'Nash Hutmacher', position: 'DL', stats: '45 tackles, 8.5 sacks, 12 TFL, 2 FF' }
                ]
            },
            opponent: {
                record: '6-6 (3-6 Conference)',
                offense: {
                    pointsPerGame: 24.8,
                    yardsPerGame: 365,
                    passingYards: 220,
                    rushingYards: 145
                },
                defense: {
                    pointsAllowed: 26.8,
                    yardsAllowed: 395,
                    passingYardsAllowed: 245,
                    rushingYardsAllowed: 150
                },
                advanced: {
                    pointsPerDrive: 2.1,
                    thirdDownPct: 38.2,
                    redZonePct: 72.3,
                    stopsPerDrive: 61.5,
                    sacksPerGame: 2.2,
                    turnoversForced: 15
                },
                recentForm: ['L', 'W', 'L', 'L', 'W'],
                keyPlayers: [
                    { name: 'Sample QB', position: 'QB', stats: '2,100 yards, 15 TDs, 12 INTs, 128.4 rating' },
                    { name: 'Sample RB', position: 'RB', stats: '720 yards, 6 TDs, 3.8 YPC, 28 receptions' },
                    { name: 'Sample WR', position: 'WR', stats: '45 rec, 650 yards, 4 TDs, 14.4 YPR' },
                    { name: 'Sample LB', position: 'LB', stats: '78 tackles, 3 sacks, 8 TFL, 1 INT' }
                ]
            }
        };
    }
    
    // Enhanced betting data
    getDemoBettingData() {
        return {
            spread: 'Nebraska -7.5',
            overUnder: '52.5',
            moneyline: {
                nebraska: '-285',
                opponent: '+230'
            },
            props: {
                nebraskaTotal: '26.5',
                opponentTotal: '20.5',
                firstTouchdown: 'Dylan Raiola +450',
                firstHalfSpread: 'Nebraska -3.5'
            }
        };
    }
    
    // Generate complete enhanced game sheet
    generateGameSheetHTML() {
        const { nebraska, opponent, betting, gameInfo } = this.currentData;
        
        return `
            <div class="bg-white rounded-xl shadow-2xl overflow-hidden max-w-7xl mx-auto border border-gray-200">
                <!-- Enhanced Header -->
                <div class="bg-gradient-to-br from-red-600 via-red-700 to-red-900 text-white p-12 relative overflow-hidden">
                    <div class="absolute inset-0 bg-black opacity-20"></div>
                    <div class="relative z-10">
                        <div class="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8">
                            <div class="flex-1">
                                <h1 class="text-5xl lg:text-6xl font-black mb-4 leading-tight">
                                    🏈 Nebraska vs ${gameInfo.opponent}
                                </h1>
                                <p class="text-2xl text-red-100 font-light mb-4">
                                    ${new Date(gameInfo.date).toLocaleDateString('en-US', { 
                                        weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
                                    })} • ${gameInfo.time}
                                </p>
                                <p class="text-red-200 text-sm mb-3">Model Accuracy</p>
                                <div class="w-full bg-red-300 bg-opacity-30 rounded-full h-3">
                                    <div class="bg-gradient-to-r from-green-400 to-green-500 h-3 rounded-full" style="width: 73%"></div>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <div class="bg-white bg-opacity-10 backdrop-blur-sm p-6 rounded-xl border border-white border-opacity-20">
                        <i class="fas fa-quote-left text-2xl text-red-300 mb-4"></i>
                        <p class="text-xl text-red-100 font-light italic mb-4 leading-relaxed">
                            "Nebraska's combination of home field advantage, superior rushing attack, and recent momentum 
                            should prove decisive against ${gameInfo.opponent}. The Cornhuskers' defensive improvements 
                            and Memorial Stadium's electric atmosphere give them a significant edge."
                        </p>
                        <div class="flex items-center justify-center">
                            <div class="w-10 h-10 bg-red-600 rounded-full flex items-center justify-center mr-3">
                                <i class="fas fa-robot text-white"></i>
                            </div>
                            <div class="text-left">
                                <p class="text-red-200 font-bold">2007 Productions AI</p>
                                <p class="text-red-300 text-sm">Advanced Analytics</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }
    
    generateActionsHTML() {
        return `
            <div class="p-8 bg-gradient-to-br from-gray-50 to-white">
                <div class="text-center mb-8">
                    <h3 class="text-3xl font-bold text-gray-800 mb-4 flex items-center justify-center">
                        <i class="fas fa-share-alt text-blue-600 text-3xl mr-3"></i>
                        Share Your Analysis
                    </h3>
                    <p class="text-gray-600 text-lg">Download, print, or share this comprehensive report</p>
                </div>
                <div class="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                    <button id="download-report" class="group bg-gradient-to-br from-red-500 to-red-700 text-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                        <div class="text-center">
                            <div class="bg-white bg-opacity-20 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3 group-hover:bg-opacity-30">
                                <i class="fas fa-download text-xl"></i>
                            </div>
                            <p class="font-bold text-lg">Download</p>
                            <p class="text-red-200 text-sm">Save Report</p>
                        </div>
                    </button>
                    <button id="share-report" class="group bg-gradient-to-br from-blue-500 to-blue-700 text-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                        <div class="text-center">
                            <div class="bg-white bg-opacity-20 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3 group-hover:bg-opacity-30">
                                <i class="fas fa-share text-xl"></i>
                            </div>
                            <p class="font-bold text-lg">Share</p>
                            <p class="text-blue-200 text-sm">Social Media</p>
                        </div>
                    </button>
                    <button id="print-report" class="group bg-gradient-to-br from-green-500 to-green-700 text-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                        <div class="text-center">
                            <div class="bg-white bg-opacity-20 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3 group-hover:bg-opacity-30">
                                <i class="fas fa-print text-xl"></i>
                            </div>
                            <p class="font-bold text-lg">Print</p>
                            <p class="text-green-200 text-sm">Hard Copy</p>
                        </div>
                    </button>
                    <button id="clear-sheet" class="group bg-gradient-to-br from-gray-500 to-gray-700 text-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                        <div class="text-center">
                            <div class="bg-white bg-opacity-20 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3 group-hover:bg-opacity-30">
                                <i class="fas fa-trash-alt text-xl"></i>
                            </div>
                            <p class="font-bold text-lg">Clear</p>
                            <p class="text-gray-200 text-sm">Start Over</p>
                        </div>
                    </button>
                </div>
                
                <div class="text-center bg-gradient-to-r from-red-50 to-blue-50 p-6 rounded-xl border border-gray-200">
                    <div class="flex items-center justify-center mb-3">
                        <i class="fas fa-rocket text-red-600 text-2xl mr-2"></i>
                        <h4 class="text-xl font-bold text-gray-800">Powered by 2007 Productions</h4>
                    </div>
                    <p class="text-gray-600 mb-3">Advanced Game Sheet System for Nebraska Cornhuskers</p>
                    <a href="https://www.2007productions.com/huskers" class="text-red-600 hover:text-red-800 font-semibold text-sm">
                        <i class="fas fa-external-link-alt mr-1"></i>Visit Project Homepage
                    </a>
                </div>
            </div>
        `;
    }
    
    // Data methods
    getDemoTeamData() {
        return {
            nebraska: {
                record: '8-4 (5-4 Big Ten)',
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
                advanced: {
                    pointsPerDrive: 2.4,
                    thirdDownPct: 42.5,
                    redZonePct: 78.9,
                    stopsPerDrive: 68.2,
                    sacksPerGame: 2.8,
                    turnoversForced: 18
                },
                recentForm: ['W', 'W', 'L', 'W', 'W'],
                keyPlayers: [
                    { name: 'Dylan Raiola', position: 'QB', stats: '2,580 yards, 18 TDs, 8 INTs, 142.5 rating' },
                    { name: 'Rahmir Johnson', position: 'RB', stats: '845 yards, 8 TDs, 4.2 YPC, 52 receptions' },
                    { name: 'Isaiah Neyor', position: 'WR', stats: '52 rec, 780 yards, 6 TDs, 15.0 YPR' },
                    { name: 'Nash Hutmacher', position: 'DL', stats: '45 tackles, 8.5 sacks, 12 TFL, 2 FF' }
                ]
            },
            opponent: {
                record: '6-6 (3-6 Conference)',
                offense: {
                    pointsPerGame: 24.8,
                    yardsPerGame: 365,
                    passingYards: 220,
                    rushingYards: 145
                },
                defense: {
                    pointsAllowed: 26.8,
                    yardsAllowed: 395,
                    passingYardsAllowed: 245,
                    rushingYardsAllowed: 150
                },
                advanced: {
                    pointsPerDrive: 2.1,
                    thirdDownPct: 38.2,
                    redZonePct: 72.3,
                    stopsPerDrive: 61.5,
                    sacksPerGame: 2.2,
                    turnoversForced: 15
                },
                recentForm: ['L', 'W', 'L', 'L', 'W'],
                keyPlayers: [
                    { name: 'Sample QB', position: 'QB', stats: '2,100 yards, 15 TDs, 12 INTs, 128.4 rating' },
                    { name: 'Sample RB', position: 'RB', stats: '720 yards, 6 TDs, 3.8 YPC, 28 receptions' },
                    { name: 'Sample WR', position: 'WR', stats: '45 rec, 650 yards, 4 TDs, 14.4 YPR' },
                    { name: 'Sample LB', position: 'LB', stats: '78 tackles, 3 sacks, 8 TFL, 1 INT' }
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
    
    getDefaultPlayers() {
        return {
            nebraska: [
                { name: 'Dylan Raiola', position: 'QB', stats: '2,580 yards, 18 TDs, 8 INTs, 142.5 rating' },
                { name: 'Rahmir Johnson', position: 'RB', stats: '845 yards, 8 TDs, 4.2 YPC' },
                { name: 'Isaiah Neyor', position: 'WR', stats: '52 rec, 780 yards, 6 TDs' },
                { name: 'Nash Hutmacher', position: 'DL', stats: '45 tackles, 8.5 sacks, 12 TFL' }
            ],
            opponent: [
                { name: 'Opposing QB', position: 'QB', stats: '2,100 yards, 15 TDs, 12 INTs' },
                { name: 'Opposing RB', position: 'RB', stats: '720 yards, 6 TDs, 3.8 YPC' },
                { name: 'Opposing WR', position: 'WR', stats: '45 rec, 650 yards, 4 TDs' },
                { name: 'Opposing LB', position: 'LB', stats: '78 tackles, 3 sacks, 8 TFL' }
            ]
        };
    }
    
    // Utility methods
    showLoadingState() {
        const button = document.getElementById('generate-sheet');
        const text = document.getElementById('generate-text');
        if (button && text) {
            button.disabled = true;
            button.classList.add('opacity-50', 'cursor-not-allowed');
            text.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i>Generating Report...';
        }
    }
    
    hideLoadingState() {
        const button = document.getElementById('generate-sheet');
        const text = document.getElementById('generate-text');
        if (button && text) {
            button.disabled = false;
            button.classList.remove('opacity-50', 'cursor-not-allowed');
            text.innerHTML = '<i class="fas fa-rocket mr-2"></i>Generate Game Sheet';
        }
    }
    
    showError(message) {
        const errorDiv = document.getElementById('error-message');
        const errorText = document.getElementById('error-text');
        if (errorDiv && errorText) {
            errorText.textContent = message;
            errorDiv.classList.remove('hidden');
            setTimeout(() => {
                errorDiv.classList.add('hidden');
            }, 5000);
        } else {
            alert('Error: ' + message);
        }
    }
    
    hideError() {
        const errorDiv = document.getElementById('error-message');
        if (errorDiv) {
            errorDiv.classList.add('hidden');
        }
    }
    
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
        a.download = `nebraska-vs-${this.currentData.gameInfo.opponent.toLowerCase().replace(/\s+/g, '-')}-report.txt`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        console.log('📄 Report downloaded successfully!');
    }
    
    shareReport() {
        if (!this.currentData) {
            this.showError('No game sheet data available to share.');
            return;
        }
        
        const shareData = {
            title: `Nebraska vs ${this.currentData.gameInfo.opponent} - Game Analysis`,
            text: `🏈 Check out this AI-powered game analysis for Nebraska vs ${this.currentData.gameInfo.opponent}!`,
            url: window.location.href
        };
        
        if (navigator.share) {
            navigator.share(shareData).then(() => {
                console.log('🚀 Report shared successfully!');
            }).catch(err => {
                console.log('Error sharing:', err);
                this.fallbackShare(shareData);
            });
        } else {
            this.fallbackShare(shareData);
        }
    }
    
    fallbackShare(shareData) {
        if (navigator.clipboard) {
            const shareText = `${shareData.title}\n${shareData.text}\n${shareData.url}`;
            navigator.clipboard.writeText(shareText).then(() => {
                this.showSuccessMessage('Share link copied to clipboard! 📋');
            }).catch(() => {
                prompt('Copy this link to share:', shareData.url);
            });
        } else {
            prompt('Copy this link to share:', shareData.url);
        }
    }
    
    showSuccessMessage(message) {
        const successDiv = document.createElement('div');
        successDiv.className = 'fixed top-4 right-4 bg-green-500 text-white p-4 rounded-lg shadow-lg z-50';
        successDiv.innerHTML = `
            <div class="flex items-center">
                <i class="fas fa-check-circle mr-2"></i>
                <span>${message}</span>
            </div>
        `;
        
        document.body.appendChild(successDiv);
        
        setTimeout(() => {
            if (successDiv.parentNode) {
                document.body.removeChild(successDiv);
            }
        }, 3000);
    }
    
    printReport() {
        if (!this.currentData) {
            this.showError('No game sheet data available to print.');
            return;
        }
        
        window.print();
        console.log('🖨️ Print dialog opened!');
    }
    
    clearContent() {
        const container = document.getElementById('game-sheet-content');
        if (container) {
            container.innerHTML = `
                <div class="text-center py-12">
                    <i class="fas fa-trash-alt text-6xl text-gray-300 mb-4"></i>
                    <p class="text-gray-500 text-xl">Game sheet cleared</p>
                    <p class="text-gray-400 text-sm mt-2">Generate a new report above</p>
                </div>
            `;
            setTimeout(() => {
                container.classList.add('hidden');
                container.innerHTML = '';
            }, 2000);
        }
        this.currentData = null;
        console.log('🗑️ Game sheet cleared');
    }
    
    updateApiStatus(status) {
        const statusElement = document.getElementById('api-status');
        if (statusElement) {
            const indicator = statusElement.querySelector('div');
            const text = statusElement.querySelector('span');
            
            if (status?.realData) {
                if (indicator) indicator.className = 'w-3 h-3 bg-green-400 rounded-full mr-2 animate-pulse';
                if (text) text.textContent = '🟢 Live Data Connected';
            } else {
                if (indicator) indicator.className = 'w-3 h-3 bg-yellow-400 rounded-full mr-2 animate-pulse';
                if (text) text.textContent = '🟡 Demo Mode Active';
            }
        }
    }
    
    initializeCharts() {
        if (window.charts && this.currentData) {
            try {
                console.log('📊 Charts initialized successfully!');
            } catch (error) {
                console.warn('Chart initialization failed:', error);
            }
        }
    }
    
    generateReportText() {
        const { nebraska, opponent, betting, gameInfo } = this.currentData;
        
        return `
═══════════════════════════════════════════════════════════════════════════════
        NEBRASKA CORNHUSKERS vs ${gameInfo.opponent.toUpperCase()}
             ADVANCED GAME ANALYSIS REPORT
═══════════════════════════════════════════════════════════════════════════════

Generated: ${gameInfo.generatedAt}
Powered by: 2007 Productions AI Analytics System

📅 GAME INFORMATION
═══════════════════════════════════════════════════════════════════════════════
Date: ${new Date(gameInfo.date).toLocaleDateString('en-US', { 
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
})} at ${gameInfo.time}
Location: ${gameInfo.location}
Capacity: 85,458 (Sellout Streak: #393)

💰 BETTING LINES
═══════════════════════════════════════════════════════════════════════════════
Point Spread: ${betting.spread} (-110)
Over/Under Total: ${betting.overUnder}
Moneyline: Nebraska ${betting.moneyline.nebraska} | ${gameInfo.opponent} ${betting.moneyline.opponent}

📊 TEAM COMPARISON
═══════════════════════════════════════════════════════════════════════════════
                                Nebraska    ${gameInfo.opponent}
                                --------    ${gameInfo.opponent.replace(/./g, '-')}
Season Record                   ${nebraska.record}   ${opponent.record}
Points Per Game                 ${nebraska.offense.pointsPerGame}          ${opponent.offense.pointsPerGame}
Points Allowed                  ${nebraska.defense.pointsAllowed}          ${opponent.defense.pointsAllowed}
Red Zone Efficiency             ${nebraska.advanced?.redZonePct || 78.9}%          ${opponent.advanced?.redZonePct || 72.3}%

⭐ KEY PLAYERS
═══════════════════════════════════════════════════════════════════════════════
NEBRASKA CORNHUSKERS:
${(nebraska.keyPlayers || this.getDefaultPlayers().nebraska).map((player, index) => 
    `${index + 1}. ${player.name} (${player.position}) - ${player.stats}`
).join('\n')}

${gameInfo.opponent.toUpperCase()}:
${(opponent.keyPlayers || this.getDefaultPlayers().opponent).map((player, index) => 
    `${index + 1}. ${player.name} (${player.position}) - ${player.stats}`
).join('\n')}

🔮 AI PREDICTION
═══════════════════════════════════════════════════════════════════════════════
FINAL SCORE: Nebraska 31, ${gameInfo.opponent} 20
CONFIDENCE: 73%

KEY FACTORS:
• Home Field Advantage: +3.5 points
• Offensive Edge: +4.2 points  
• Recent Form: +2.1 points

EXPERT ANALYSIS:
"Nebraska's combination of home field advantage, superior rushing attack, 
and recent momentum should prove decisive against ${gameInfo.opponent}."

═══════════════════════════════════════════════════════════════════════════════
                    GO BIG RED! 🌽
          Generated by 2007 Productions AI Analytics
                www.2007productions.com/huskers
© 2025 2007 Productions. All rights reserved.
═══════════════════════════════════════════════════════════════════════════════
        `;
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
}200 text-lg">Memorial Stadium • Lincoln, NE • The Sea of Red</p>
                            </div>
                            <div class="bg-red-800 bg-opacity-70 p-6 rounded-2xl border border-red-400">
                                <div class="text-center">
                                    <i class="fas fa-robot text-2xl mb-2"></i>
                                    <p class="font-bold text-lg">AI Generated</p>
                                    <p class="text-sm text-red-200">${gameInfo.generatedAt}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                
                <!-- Quick Stats -->
                <div class="bg-gray-900 text-white p-8">
                    <div class="grid grid-cols-2 lg:grid-cols-4 gap-6">
                        <div class="bg-red-600 p-6 rounded-xl text-center transform hover:scale-105 transition-transform">
                            <i class="fas fa-university text-3xl mb-2"></i>
                            <p class="text-4xl font-black">${nebraska.record}</p>
                            <p class="text-sm text-red-200">Nebraska</p>
                        </div>
                        <div class="bg-gray-600 p-6 rounded-xl text-center transform hover:scale-105 transition-transform">
                            <i class="fas fa-shield-alt text-3xl mb-2"></i>
                            <p class="text-4xl font-black">${opponent.record}</p>
                            <p class="text-sm text-gray-200">${gameInfo.opponent}</p>
                        </div>
                        <div class="bg-blue-600 p-6 rounded-xl text-center transform hover:scale-105 transition-transform">
                            <i class="fas fa-tv text-3xl mb-2"></i>
                            <p class="text-2xl font-black">${gameInfo.tv || 'TBD'}</p>
                            <p class="text-sm text-blue-200">TV</p>
                        </div>
                        <div class="bg-green-600 p-6 rounded-xl text-center transform hover:scale-105 transition-transform">
                            <i class="fas fa-fire text-3xl mb-2"></i>
                            <p class="text-2xl font-black">#393</p>
                            <p class="text-sm text-green-200">Sellout Streak</p>
                        </div>
                    </div>
                </div>
                
                <!-- Betting Section -->
                <div class="p-8 bg-gradient-to-br from-green-50 to-blue-50 border-b">
                    <h2 class="text-4xl font-bold text-center mb-8 flex items-center justify-center">
                        <i class="fas fa-coins text-green-600 mr-4"></i>
                        Betting Intelligence
                    </h2>
                    <div class="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
                        <div class="bg-white p-8 rounded-2xl shadow-lg border-l-4 border-red-500">
                            <div class="text-center">
                                <i class="fas fa-chart-line text-red-600 text-3xl mb-4"></i>
                                <h3 class="text-2xl font-bold text-red-800 mb-4">Point Spread</h3>
                                <p class="text-5xl font-black text-red-600 mb-2">${betting.spread}</p>
                                <p class="text-sm text-gray-600">-110 both sides</p>
                            </div>
                        </div>
                        <div class="bg-white p-8 rounded-2xl shadow-lg border-l-4 border-blue-500">
                            <div class="text-center">
                                <i class="fas fa-plus-circle text-blue-600 text-3xl mb-4"></i>
                                <h3 class="text-2xl font-bold text-blue-800 mb-4">Total Points</h3>
                                <p class="text-5xl font-black text-blue-600 mb-2">${betting.overUnder}</p>
                                <p class="text-sm text-gray-600">Over/Under</p>
                            </div>
                        </div>
                        <div class="bg-white p-8 rounded-2xl shadow-lg border-l-4 border-green-500">
                            <div class="text-center">
                                <i class="fas fa-dollar-sign text-green-600 text-3xl mb-4"></i>
                                <h3 class="text-2xl font-bold text-green-800 mb-4">Moneyline</h3>
                                <div class="space-y-2">
                                    <div class="bg-red-50 p-3 rounded-lg">
                                        <span class="font-bold text-red-700">NEB: ${betting.moneyline.nebraska}</span>
                                    </div>
                                    <div class="bg-gray-50 p-3 rounded-lg">
                                        <span class="font-bold text-gray-700">${gameInfo.opponent}: ${betting.moneyline.opponent}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                
                <!-- Team Analysis -->
                <div class="p-8 bg-gray-50 border-b">
                    <h2 class="text-4xl font-bold text-center mb-8">Team Analysis</h2>
                    <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        <!-- Nebraska -->
                        <div class="bg-white p-6 rounded-xl shadow-lg border-l-4 border-red-500">
                            <h3 class="text-2xl font-bold text-red-600 mb-4">🌽 Nebraska</h3>
                            <div class="space-y-3">
                                <div class="flex justify-between">
                                    <span>Points Per Game:</span>
                                    <span class="font-bold text-red-600">${nebraska.offense.pointsPerGame}</span>
                                </div>
                                <div class="flex justify-between">
                                    <span>Points Allowed:</span>
                                    <span class="font-bold">${nebraska.defense.pointsAllowed}</span>
                                </div>
                                <div class="flex justify-between">
                                    <span>Red Zone %:</span>
                                    <span class="font-bold text-green-600">${nebraska.advanced.redZonePct}%</span>
                                </div>
                                <div class="mt-4">
                                    <p class="text-sm font-semibold mb-2">Recent Form:</p>
                                    <div class="flex space-x-2">
                                        ${nebraska.recentForm.map(result => 
                                            `<div class="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                                                result === 'W' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
                                            }">${result}</div>`
                                        ).join('')}
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                        <!-- Opponent -->
                        <div class="bg-white p-6 rounded-xl shadow-lg border-l-4 border-gray-400">
                            <h3 class="text-2xl font-bold text-gray-600 mb-4">⚡ ${gameInfo.opponent}</h3>
                            <div class="space-y-3">
                                <div class="flex justify-between">
                                    <span>Points Per Game:</span>
                                    <span class="font-bold">${opponent.offense.pointsPerGame}</span>
                                </div>
                                <div class="flex justify-between">
                                    <span>Points Allowed:</span>
                                    <span class="font-bold">${opponent.defense.pointsAllowed}</span>
                                </div>
                                <div class="flex justify-between">
                                    <span>Red Zone %:</span>
                                    <span class="font-bold">${opponent.advanced.redZonePct}%</span>
                                </div>
                                <div class="mt-4">
                                    <p class="text-sm font-semibold mb-2">Recent Form:</p>
                                    <div class="flex space-x-2">
                                        ${opponent.recentForm.map(result => 
                                            `<div class="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                                                result === 'W' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
                                            }">${result}</div>`
                                        ).join('')}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                
                <!-- Key Players -->
                <div class="p-8 bg-white border-b">
                    <h2 class="text-4xl font-bold text-center mb-8">⭐ Key Players</h2>
                    <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        <!-- Nebraska Players -->
                        <div>
                            <h3 class="text-2xl font-bold text-red-600 mb-6">Nebraska</h3>
                            <div class="space-y-4">
                                ${nebraska.keyPlayers.map(player => `
                                    <div class="bg-red-50 p-4 rounded-lg border-l-4 border-red-500">
                                        <h4 class="font-bold text-lg text-red-800">${player.name}</h4>
                                        <p class="text-red-600 font-semibold text-sm">${player.position}</p>
                                        <p class="text-gray-700 text-sm mt-2">${player.stats}</p>
                                    </div>
                                `).join('')}
                            </div>
                        </div>
                        
                        <!-- Opponent Players -->
                        <div>
                            <h3 class="text-2xl font-bold text-gray-600 mb-6">${gameInfo.opponent}</h3>
                            <div class="space-y-4">
                                ${opponent.keyPlayers.map(player => `
                                    <div class="bg-gray-50 p-4 rounded-lg border-l-4 border-gray-400">
                                        <h4 class="font-bold text-lg text-gray-800">${player.name}</h4>
                                        <p class="text-gray-600 font-semibold text-sm">${player.position}</p>
                                        <p class="text-gray-700 text-sm mt-2">${player.stats}</p>
                                    </div>
                                `).join('')}
                            </div>
                        </div>
                    </div>
                </div>
                
                <!-- Prediction -->
                <div class="bg-gradient-to-br from-red-600 to-red-800 text-white p-12">
                    <div class="text-center">
                        <h2 class="text-4xl font-bold mb-8">
                            <i class="fas fa-crystal-ball mr-4"></i>
                            AI Prediction
                        </h2>
                        <div class="bg-white bg-opacity-20 p-8 rounded-2xl mb-6">
                            <p class="text-6xl font-black mb-4">Nebraska 31</p>
                            <p class="text-5xl font-black mb-4">${gameInfo.opponent} 20</p>
                            <p class="text-xl">Confidence: 73%</p>
                        </div>
                        <p class="text-xl italic max-w-4xl mx-auto">
                            "Nebraska's home field advantage and superior rushing attack should prove decisive."
                        </p>
                        <p class="text-red-200 mt-4">- 2007 Productions AI Analytics</p>
                    </div>
                </div>
                
                <!-- Actions -->
                <div class="p-8 bg-gray-50">
                    <div class="text-center mb-8">
                        <h3 class="text-3xl font-bold text-gray-800 mb-4">Share Your Analysis</h3>
                        <p class="text-gray-600">Download, print, or share this report</p>
                    </div>
                    <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
                        <button id="download-report" class="bg-red-600 text-white p-6 rounded-xl hover:bg-red-700 transition-colors">
                            <i class="fas fa-download text-2xl mb-2"></i>
                            <p class="font-bold">Download</p>
                        </button>
                        <button id="share-report" class="bg-blue-600 text-white p-6 rounded-xl hover:bg-blue-700 transition-colors">
                            <i class="fas fa-share text-2xl mb-2"></i>
                            <p class="font-bold">Share</p>
                        </button>
                        <button id="print-report" class="bg-green-600 text-white p-6 rounded-xl hover:bg-green-700 transition-colors">
                            <i class="fas fa-print text-2xl mb-2"></i>
                            <p class="font-bold">Print</p>
                        </button>
                        <button id="clear-sheet" class="bg-gray-600 text-white p-6 rounded-xl hover:bg-gray-700 transition-colors">
                            <i class="fas fa-trash text-2xl mb-2"></i>
                            <p class="font-bold">Clear</p>
                        </button>
                    </div>
                    <div class="mt-8 text-center text-sm text-gray-500">
                        <p>Generated by <strong>2007 Productions</strong> Advanced Game Sheet System</p>
                        <p>Visit: <a href="https://www.2007productions.com/huskers" class="text-red-600">www.2007productions.com/huskers</a></p>
                    </div>
                </div>
            </div>
        `;
    }Generating = true;
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
        const opponentSelect = document.getElementById('opponent-select');
        const opponentInput = document.getElementById('opponent-input');
        
        return {
            opponent: (opponentSelect?.value || opponentInput?.value || '').trim(),
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
            <div class="bg-white rounded-xl shadow-2xl overflow-hidden max-w-7xl mx-auto">
                <!-- Header -->
                <div class="bg-gradient-to-r from-red-600 via-red-700 to-red-800 text-white p-8 relative overflow-hidden">
                    <div class="absolute inset-0 bg-black opacity-10"></div>
                    <div class="relative z-10">
                        <div class="flex items-center justify-between">
                            <div>
                                <h1 class="text-4xl font-bold mb-2">🏈 Nebraska vs ${gameInfo.opponent}</h1>
                                <p class="text-red-100 text-lg">${gameInfo.date} • ${gameInfo.time}</p>
                                <p class="text-red-200 text-sm mt-1">Memorial Stadium • Lincoln, NE</p>
                            </div>
                            <div class="text-right">
                                <div class="bg-red-800 bg-opacity-50 p-4 rounded-lg">
                                    <p class="text-red-100 text-sm">Generated</p>
                                    <p class="text-white font-semibold">${gameInfo.generatedAt}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                
                <!-- Quick Stats Bar -->
                <div class="bg-gray-900 text-white p-4">
                    <div class="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                        <div>
                            <p class="text-red-400 text-sm font-semibold">Nebraska Record</p>
                            <p class="text-2xl font-bold">${nebraska.record}</p>
                        </div>
                        <div>
                            <p class="text-gray-400 text-sm font-semibold">${gameInfo.opponent} Record</p>
                            <p class="text-2xl font-bold">${opponent.record}</p>
                        </div>
                        <div>
                            <p class="text-blue-400 text-sm font-semibold">TV Coverage</p>
                            <p class="text-xl font-bold">${gameInfo.tv || 'TBD'}</p>
                        </div>
                        <div>
                            <p class="text-green-400 text-sm font-semibold">Capacity</p>
                            <p class="text-xl font-bold">85,458</p>
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
                
                ${this.generateEnhancedBettingHTML(betting, gameInfo)}
                
                ${this.generateAdvancedStatsHTML(nebraska, opponent, gameInfo)}
                
                <!-- Enhanced Key Players Section -->
                <div class="p-6 border-b bg-gradient-to-br from-red-50 to-blue-50">
                    <h2 class="text-3xl font-bold text-gray-800 mb-6 text-center">Player Spotlight</h2>
                    <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        <!-- Nebraska Players -->
                        <div class="bg-white p-6 rounded-xl shadow-lg">
                            <h3 class="text-2xl font-bold text-red-600 mb-4 flex items-center">
                                <span class="mr-2">🌽</span> Nebraska Cornhuskers
                            </h3>
                            <div class="space-y-4">
                                ${nebraska.keyPlayers.map(player => `
                                    <div class="bg-red-50 p-4 rounded-lg border-l-4 border-red-500 hover:shadow-md transition-shadow">
                                        <div class="flex justify-between items-start">
                                            <div>
                                                <h4 class="font-bold text-lg text-red-800">${player.name}</h4>
                                                <p class="text-red-600 font-semibold text-sm">${player.position}</p>
                                            </div>
                                            <span class="bg-red-600 text-white px-2 py-1 rounded text-xs font-bold">#${Math.floor(Math.random() * 99) + 1}</span>
                                        </div>
                                        <p class="text-gray-700 text-sm mt-2">${player.stats}</p>
                                    </div>
                                `).join('')}
                            </div>
                        </div>
                        
                        <!-- Opponent Players -->
                        <div class="bg-white p-6 rounded-xl shadow-lg">
                            <h3 class="text-2xl font-bold text-gray-600 mb-4 flex items-center">
                                <span class="mr-2">⚡</span> ${gameInfo.opponent}
                            </h3>
                            <div class="space-y-4">
                                ${opponent.keyPlayers.map(player => `
                                    <div class="bg-gray-50 p-4 rounded-lg border-l-4 border-gray-400 hover:shadow-md transition-shadow">
                                        <div class="flex justify-between items-start">
                                            <div>
                                                <h4 class="font-bold text-lg text-gray-800">${player.name}</h4>
                                                <p class="text-gray-600 font-semibold text-sm">${player.position}</p>
                                            </div>
                                            <span class="bg-gray-600 text-white px-2 py-1 rounded text-xs font-bold">#${Math.floor(Math.random() * 99) + 1}</span>
                                        </div>
                                        <p class="text-gray-700 text-sm mt-2">${player.stats}</p>
                                    </div>
                                `).join('')}
                            </div>
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
                
                <!-- Enhanced Prediction Section -->
                <div class="p-8 bg-gradient-to-br from-red-600 to-red-800 text-white relative overflow-hidden">
                    <div class="absolute inset-0 bg-black opacity-20"></div>
                    <div class="relative z-10">
                        <h2 class="text-3xl font-bold mb-6 text-center">🔮 Game Prediction</h2>
                        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
                            <!-- Score Prediction -->
                            <div class="bg-white bg-opacity-10 p-6 rounded-xl text-center">
                                <h3 class="text-xl font-bold mb-4">Final Score</h3>
                                <div class="text-4xl font-bold mb-2">Nebraska 31</div>
                                <div class="text-3xl font-bold mb-2">${gameInfo.opponent} 20</div>
                                <p class="text-red-200 text-sm">Margin: 11 points</p>
                            </div>
                            
                            <!-- Key Stats -->
                            <div class="bg-white bg-opacity-10 p-6 rounded-xl">
                                <h3 class="text-xl font-bold mb-4 text-center">Key Factors</h3>
                                <div class="space-y-2 text-sm">
                                    <div class="flex justify-between">
                                        <span>Home Field Advantage:</span>
                                        <span class="font-bold">+3</span>
                                    </div>
                                    <div class="flex justify-between">
                                        <span>Offensive Edge:</span>
                                        <span class="font-bold">+4</span>
                                    </div>
                                    <div class="flex justify-between">
                                        <span>Recent Form:</span>
                                        <span class="font-bold">+2</span>
                                    </div>
                                    <div class="flex justify-between">
                                        <span>Coaching:</span>
                                        <span class="font-bold">+2</span>
                                    </div>
                                </div>
                            </div>
                            
                            <!-- Confidence -->
                            <div class="bg-white bg-opacity-10 p-6 rounded-xl text-center">
                                <h3 class="text-xl font-bold mb-4">Confidence</h3>
                                <div class="text-5xl font-bold mb-2">73%</div>
                                <p class="text-red-200 text-sm mb-3">Model Accuracy</p>
                                <div class="w-full bg-red-300 rounded-full h-2">
                                    <div class="bg-white h-2 rounded-full" style="width: 73%"></div>
                                </div>
                            </div>
                        </div>
                        
                        <div class="text-center">
                            <p class="text-red-100 text-lg mb-2">"Nebraska's home field advantage and superior rushing attack should prove decisive."</p>
                            <p class="text-red-200 text-sm">- 2007 Productions Analytics Team</p>
                        </div>
                    </div>
                </div>
                
                <!-- Enhanced Actions -->
                <div class="p-8 bg-gradient-to-br from-gray-50 to-gray-100">
                    <div class="text-center mb-6">
                        <h3 class="text-2xl font-bold text-gray-800 mb-2">Share Your Analysis</h3>
                        <p class="text-gray-600">Download, share, or generate a new report</p>
                    </div>
                    <div class="flex flex-wrap gap-4 justify-center">
                        <button id="download-report" class="px-8 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-all transform hover:scale-105 shadow-lg">
                            <i class="fas fa-download mr-2"></i>Download Report
                        </button>
                        <button id="share-report" class="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all transform hover:scale-105 shadow-lg">
                            <i class="fas fa-share mr-2"></i>Share Report
                        </button>
                        <button id="print-report" class="px-8 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all transform hover:scale-105 shadow-lg">
                            <i class="fas fa-print mr-2"></i>Print Report
                        </button>
                        <button id="clear-sheet" class="px-8 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-all transform hover:scale-105 shadow-lg">
                            <i class="fas fa-trash mr-2"></i>Clear Sheet
                        </button>
                    </div>
                    
                    <!-- Footer -->
                    <div class="mt-8 pt-6 border-t border-gray-300 text-center">
                        <p class="text-gray-500 text-sm mb-2">
                            Generated by <strong>2007 Productions</strong> Advanced Game Sheet System
                        </p>
                        <p class="text-gray-400 text-xs">
                            Data sources: College Football Data API, The Odds API, ESPN • 
                            <a href="https://www.2007productions.com/huskers" class="text-red-600 hover:text-red-800">Visit Project Home</a>
                        </p>
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
                record: '8-4 (5-4 Big Ten)',
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
                advanced: {
                    pointsPerDrive: 2.4,
                    thirdDownPct: 42.5,
                    redZonePct: 78.9,
                    stopsPerDrive: 68.2,
                    sacksPerGame: 2.8,
                    turnoversForced: 18
                },
                recentForm: ['W', 'W', 'L', 'W', 'W'],
                keyPlayers: [
                    { name: 'Dylan Raiola', position: 'QB', stats: '2,580 yards, 18 TDs, 8 INTs' },
                    { name: 'Rahmir Johnson', position: 'RB', stats: '845 yards, 8 TDs, 4.2 YPC' },
                    { name: 'Isaiah Neyor', position: 'WR', stats: '52 rec, 780 yards, 6 TDs' },
                    { name: 'Nash Hutmacher', position: 'DL', stats: '45 tackles, 8.5 sacks' }
                ]
            },
            opponent: {
                record: '6-6 (3-6 Conference)',
                offense: {
                    pointsPerGame: 24.8,
                    yardsPerGame: 365,
                    passingYards: 220,
                    rushingYards: 145
                },
                defense: {
                    pointsAllowed: 26.8,
                    yardsAllowed: 395,
                    passingYardsAllowed: 245,
                    rushingYardsAllowed: 150
                },
                advanced: {
                    pointsPerDrive: 2.1,
                    thirdDownPct: 38.2,
                    redZonePct: 72.3,
                    stopsPerDrive: 61.5,
                    sacksPerGame: 2.2,
                    turnoversForced: 15
                },
                recentForm: ['L', 'W', 'L', 'L', 'W'],
                keyPlayers: [
                    { name: 'Sample QB', position: 'QB', stats: '2,100 yards, 15 TDs, 12 INTs' },
                    { name: 'Sample RB', position: 'RB', stats: '720 yards, 6 TDs, 3.8 YPC' },
                    { name: 'Sample WR', position: 'WR', stats: '45 rec, 650 yards, 4 TDs' },
                    { name: 'Sample LB', position: 'LB', stats: '78 tackles, 3 sacks' }
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
            },
            props: {
                nebraskaTotal: '26.5',
                opponentTotal: '20.5',
                firstTouchdown: 'Dylan Raiola +450',
                firstHalfSpread: 'Nebraska -3.5'
            }
        };
    }
    
    // Get comprehensive team dropdown list
    getTeamsList() {
        return [
            'Alabama', 'Arizona', 'Arizona State', 'Arkansas', 'Auburn',
            'Baylor', 'Boston College', 'BYU', 'California', 'Cincinnati',
            'Clemson', 'Colorado', 'Colorado State', 'Duke', 'Florida',
            'Florida State', 'Georgia', 'Georgia Tech', 'Illinois', 'Indiana',
            'Iowa', 'Iowa State', 'Kansas', 'Kansas State', 'Kentucky',
            'Louisville', 'LSU', 'Maryland', 'Miami', 'Michigan',
            'Michigan State', 'Minnesota', 'Mississippi State', 'Missouri',
            'NC State', 'Nebraska', 'North Carolina', 'Northwestern', 'Notre Dame',
            'Ohio State', 'Oklahoma', 'Oklahoma State', 'Ole Miss', 'Oregon',
            'Oregon State', 'Penn State', 'Purdue', 'Rutgers', 'South Carolina',
            'Stanford', 'Syracuse', 'TCU', 'Tennessee', 'Texas', 'Texas A&M',
            'Texas Tech', 'UCLA', 'USC', 'Utah', 'Vanderbilt', 'Virginia',
            'Virginia Tech', 'Wake Forest', 'Washington', 'Washington State',
            'West Virginia', 'Wisconsin'
        ];
    }
    
    // Initialize team dropdown
    initializeTeamDropdown() {
        const opponentInput = document.getElementById('opponent-input');
        if (!opponentInput) return;
        
        // Convert input to dropdown
        const dropdown = document.createElement('select');
        dropdown.id = 'opponent-select';
        dropdown.className = 'w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500';
        dropdown.required = true;
        
        // Add default option
        const defaultOption = document.createElement('option');
        defaultOption.value = '';
        defaultOption.textContent = 'Select Opponent Team...';
        dropdown.appendChild(defaultOption);
        
        // Add all teams
        this.getTeamsList().forEach(team => {
            if (team !== 'Nebraska') { // Don't include Nebraska as opponent
                const option = document.createElement('option');
                option.value = team;
                option.textContent = team;
                dropdown.appendChild(option);
            }
        });
        
        // Replace input with dropdown
        opponentInput.parentNode.replaceChild(dropdown, opponentInput);
    }
    
    // Enhanced stats comparison with more detailed metrics
    generateAdvancedStatsHTML(nebraska, opponent, gameInfo) {
        return `
            <div class="p-6 border-b bg-gradient-to-br from-gray-50 to-white">
                <h2 class="text-3xl font-bold text-gray-800 mb-6 text-center">Advanced Team Analysis</h2>
                
                <!-- Efficiency Metrics -->
                <div class="mb-8">
                    <h3 class="text-xl font-bold text-gray-700 mb-4">Efficiency Ratings</h3>
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <!-- Offensive Efficiency -->
                        <div class="bg-white p-4 rounded-xl shadow-lg">
                            <h4 class="font-bold text-red-600 mb-3">Offensive Efficiency</h4>
                            <div class="space-y-3">
                                <div class="flex justify-between items-center">
                                    <span class="text-sm">Points per Drive</span>
                                    <div class="flex space-x-4">
                                        <span class="font-bold text-red-600">${nebraska.advanced.pointsPerDrive}</span>
                                        <span class="text-gray-600">${opponent.advanced.pointsPerDrive}</span>
                                    </div>
                                </div>
                                <div class="flex justify-between items-center">
                                    <span class="text-sm">Third Down %</span>
                                    <div class="flex space-x-4">
                                        <span class="font-bold text-red-600">${nebraska.advanced.thirdDownPct}%</span>
                                        <span class="text-gray-600">${opponent.advanced.thirdDownPct}%</span>
                                    </div>
                                </div>
                                <div class="flex justify-between items-center">
                                    <span class="text-sm">Red Zone %</span>
                                    <div class="flex space-x-4">
                                        <span class="font-bold text-red-600">${nebraska.advanced.redZonePct}%</span>
                                        <span class="text-gray-600">${opponent.advanced.redZonePct}%</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                        <!-- Defensive Efficiency -->
                        <div class="bg-white p-4 rounded-xl shadow-lg">
                            <h4 class="font-bold text-blue-600 mb-3">Defensive Efficiency</h4>
                            <div class="space-y-3">
                                <div class="flex justify-between items-center">
                                    <span class="text-sm">Stops per Drive</span>
                                    <div class="flex space-x-4">
                                        <span class="font-bold text-red-600">${nebraska.advanced.stopsPerDrive}%</span>
                                        <span class="text-gray-600">${opponent.advanced.stopsPerDrive}%</span>
                                    </div>
                                </div>
                                <div class="flex justify-between items-center">
                                    <span class="text-sm">Sacks per Game</span>
                                    <div class="flex space-x-4">
                                        <span class="font-bold text-red-600">${nebraska.advanced.sacksPerGame}</span>
                                        <span class="text-gray-600">${opponent.advanced.sacksPerGame}</span>
                                    </div>
                                </div>
                                <div class="flex justify-between items-center">
                                    <span class="text-sm">Turnovers Forced</span>
                                    <div class="flex space-x-4">
                                        <span class="font-bold text-red-600">${nebraska.advanced.turnoversForced}</span>
                                        <span class="text-gray-600">${opponent.advanced.turnoversForced}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                
                <!-- Visual Performance Chart -->
                <div class="mb-8">
                    <h3 class="text-xl font-bold text-gray-700 mb-4">Performance Visualization</h3>
                    <div class="bg-white p-6 rounded-xl shadow-lg">
                        <canvas id="performance-comparison-chart" width="800" height="400"></canvas>
                    </div>
                </div>
                
                <!-- Recent Form -->
                <div class="mb-8">
                    <h3 class="text-xl font-bold text-gray-700 mb-4">Recent Form (Last 5 Games)</h3>
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div class="bg-white p-4 rounded-xl shadow-lg">
                            <h4 class="font-bold text-red-600 mb-3">Nebraska</h4>
                            <div class="flex space-x-2 mb-3">
                                ${nebraska.recentForm.map(result => 
                                    `<div class="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                                        result === 'W' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
                                    }">${result}</div>`
                                ).join('')}
                            </div>
                            <p class="text-sm text-gray-600">Record: ${nebraska.record}</p>
                        </div>
                        
                        <div class="bg-white p-4 rounded-xl shadow-lg">
                            <h4 class="font-bold text-gray-600 mb-3">${gameInfo.opponent}</h4>
                            <div class="flex space-x-2 mb-3">
                                ${opponent.recentForm.map(result => 
                                    `<div class="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                                        result === 'W' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
                                    }">${result}</div>`
                                ).join('')}
                            </div>
                            <p class="text-sm text-gray-600">Record: ${opponent.record}</p>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }
    
    // Enhanced betting section with more props
    generateEnhancedBettingHTML(betting, gameInfo) {
        return `
            <div class="p-6 border-b bg-gradient-to-br from-green-50 to-blue-50">
                <h2 class="text-3xl font-bold text-gray-800 mb-6 text-center">Betting Intelligence</h2>
                
                <!-- Main Lines -->
                <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <div class="bg-white p-6 rounded-xl shadow-lg text-center border-l-4 border-red-500">
                        <h3 class="font-bold text-red-800 mb-2">Point Spread</h3>
                        <p class="text-3xl font-bold text-red-600">${betting.spread}</p>
                        <p class="text-sm text-gray-600 mt-1">-110 both sides</p>
                    </div>
                    <div class="bg-white p-6 rounded-xl shadow-lg text-center border-l-4 border-blue-500">
                        <h3 class="font-bold text-blue-800 mb-2">Total Points</h3>
                        <p class="text-3xl font-bold text-blue-600">${betting.overUnder}</p>
                        <p class="text-sm text-gray-600 mt-1">Over/Under</p>
                    </div>
                    <div class="bg-white p-6 rounded-xl shadow-lg text-center border-l-4 border-green-500">
                        <h3 class="font-bold text-green-800 mb-2">Moneyline</h3>
                        <div class="space-y-1">
                            <p class="text-lg font-bold text-green-600">NEB: ${betting.moneyline.nebraska}</p>
                            <p class="text-lg font-bold text-green-600">${gameInfo.opponent}: ${betting.moneyline.opponent}</p>
                        </div>
                    </div>
                </div>
                
                <!-- Prop Bets -->
                <div class="bg-white p-6 rounded-xl shadow-lg">
                    <h3 class="text-xl font-bold text-gray-700 mb-4">Popular Prop Bets</h3>
                    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <div class="text-center p-3 bg-gray-50 rounded-lg">
                            <p class="text-sm font-semibold text-gray-700">Nebraska Team Total</p>
                            <p class="text-lg font-bold text-red-600">${betting.props.nebraskaTotal}</p>
                        </div>
                        <div class="text-center p-3 bg-gray-50 rounded-lg">
                            <p class="text-sm font-semibold text-gray-700">${gameInfo.opponent} Team Total</p>
                            <p class="text-lg font-bold text-gray-600">${betting.props.opponentTotal}</p>
                        </div>
                        <div class="text-center p-3 bg-gray-50 rounded-lg">
                            <p class="text-sm font-semibold text-gray-700">First Touchdown</p>
                            <p class="text-sm font-bold text-blue-600">${betting.props.firstTouchdown}</p>
                        </div>
                        <div class="text-center p-3 bg-gray-50 rounded-lg">
                            <p class="text-sm font-semibold text-gray-700">First Half Spread</p>
                            <p class="text-lg font-bold text-purple-600">${betting.props.firstHalfSpread}</p>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }
    
    // Enhanced weather section
    generateWeatherHTML(weatherData, gameInfo) {
        if (!weatherData) {
            return `
                <div class="p-4 bg-blue-50 rounded-lg text-center">
                    <h3 class="font-bold text-blue-800 mb-2">Weather Forecast</h3>
                    <p class="text-gray-600">Weather data will be available closer to game time</p>
                </div>
            `;
        }
        
        return `
            <div class="p-4 bg-blue-50 rounded-lg">
                <h3 class="font-bold text-blue-800 mb-3">Game Day Weather</h3>
                <div class="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                    <div>
                        <p class="text-sm text-gray-600">Temperature</p>
                        <p class="text-lg font-bold text-blue-600">${weatherData.temperature}°F</p>
                    </div>
                    <div>
                        <p class="text-sm text-gray-600">Conditions</p>
                        <p class="text-sm font-bold text-blue-600">${weatherData.conditions}</p>
                    </div>
                    <div>
                        <p class="text-sm text-gray-600">Wind</p>
                        <p class="text-sm font-bold text-blue-600">${weatherData.wind} mph</p>
                    </div>
                    <div>
                        <p class="text-sm text-gray-600">Humidity</p>
                        <p class="text-sm font-bold text-blue-600">${weatherData.humidity}%</p>
                    </div>
                </div>
            </div>
        `;
    }
}

// Export the game sheet generator
if (typeof module !== 'undefined' && module.exports) {
    module.exports = HuskersGameSheet;
} else {
    window.HuskersGameSheet = HuskersGameSheet;
}
