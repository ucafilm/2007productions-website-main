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
}

// Export the game sheet generator
if (typeof module !== 'undefined' && module.exports) {
    module.exports = HuskersGameSheet;
} else {
    window.HuskersGameSheet = HuskersGameSheet;
}
