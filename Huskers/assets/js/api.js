// API Handler for Nebraska Huskers Game Sheet Generator
// Handles all external API calls and data processing

class HuskersAPI {
    constructor() {
        this.apiKeys = {
            cfbd: localStorage.getItem('cfbd_api_key') || '',
            odds: localStorage.getItem('odds_api_key') || '',
            espn: '' // ESPN doesn't require API key for basic endpoints
        };
        
        this.cache = new Map();
        this.requestQueue = [];
        this.isProcessingQueue = false;
        
        // Bind methods
        this.makeRequest = this.makeRequest.bind(this);
        this.processQueue = this.processQueue.bind(this);
    }
    
    // Set API keys
    setApiKeys(keys) {
        this.apiKeys = { ...this.apiKeys, ...keys };
        
        // Store in localStorage
        if (keys.cfbd) localStorage.setItem('cfbd_api_key', keys.cfbd);
        if (keys.odds) localStorage.setItem('odds_api_key', keys.odds);
        
        console.log('API keys updated');
    }
    
    // Get API keys status
    getApiStatus() {
        return {
            cfbd: !!this.apiKeys.cfbd,
            odds: !!this.apiKeys.odds,
            espn: true, // Always available
            realData: !!(this.apiKeys.cfbd && this.apiKeys.odds)
        };
    }
    
    // Generic request handler with error handling and caching
    async makeRequest(url, options = {}) {
        const cacheKey = url + JSON.stringify(options);
        
        // Check cache first
        if (CONFIG.shouldUseCache() && this.cache.has(cacheKey)) {
            const cached = this.cache.get(cacheKey);
            if (Date.now() - cached.timestamp < CONFIG.CACHE.defaultTTL) {
                console.log('Returning cached data for:', url);
                return cached.data;
            }
        }
        
        const requestOptions = {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                ...options.headers
            },
            ...options
        };
        
        try {
            console.log('Making API request to:', url);
            const response = await fetch(url, requestOptions);
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            
            const data = await response.json();
            
            // Cache the response
            if (CONFIG.shouldUseCache()) {
                this.cache.set(cacheKey, {
                    data,
                    timestamp: Date.now()
                });
            }
            
            return data;
        } catch (error) {
            console.error('API request failed:', error);
            throw error;
        }
    }
    
    // College Football Data API calls
    async getTeamStats(teamName, year = 2024) {
        if (!this.apiKeys.cfbd) {
            console.warn('CFBD API key not set, using mock data');
            return this.getMockTeamStats(teamName);
        }
        
        try {
            const headers = { 'Authorization': `Bearer ${this.apiKeys.cfbd}` };
            
            // Get basic stats
            const basicStatsUrl = `${CONFIG.APIs.COLLEGE_FOOTBALL_DATA.baseUrl}/stats/season?year=${year}&team=${teamName}`;
            
            // Get advanced stats
            const advancedStatsUrl = `${CONFIG.APIs.COLLEGE_FOOTBALL_DATA.baseUrl}/stats/season/advanced?year=${year}&team=${teamName}`;
            
            // Get FPI ratings
            const fpiUrl = `${CONFIG.APIs.COLLEGE_FOOTBALL_DATA.baseUrl}/ratings/fpi?year=${year}&team=${teamName}`;
            
            const [basicStats, advancedStats, fpiData] = await Promise.all([
                this.makeRequest(basicStatsUrl, { headers }).catch(() => null),
                this.makeRequest(advancedStatsUrl, { headers }).catch(() => null),
                this.makeRequest(fpiUrl, { headers }).catch(() => null)
            ]);
            
            return this.processTeamStats(teamName, basicStats, advancedStats, fpiData);
            
        } catch (error) {
            console.error('Failed to fetch team stats:', error);
            return this.getMockTeamStats(teamName);
        }
    }
    
    // Get player statistics
    async getPlayerStats(teamName, year = 2024) {
        if (!this.apiKeys.cfbd) {
            return this.getMockPlayerStats(teamName);
        }
        
        try {
            const headers = { 'Authorization': `Bearer ${this.apiKeys.cfbd}` };
            const url = `${CONFIG.APIs.COLLEGE_FOOTBALL_DATA.baseUrl}/stats/player/season?year=${year}&team=${teamName}`;
            
            const playerStats = await this.makeRequest(url, { headers });
            return this.processPlayerStats(playerStats);
            
        } catch (error) {
            console.error('Failed to fetch player stats:', error);
            return this.getMockPlayerStats(teamName);
        }
    }
    
    // Get betting lines
    async getBettingLines(sport = 'americanfootball_ncaaf') {
        if (!this.apiKeys.odds) {
            console.warn('Odds API key not set, using mock data');
            return this.getMockBettingLines();
        }
        
        try {
            const url = `${CONFIG.APIs.THE_ODDS_API.baseUrl}/sports/${sport}/odds?apiKey=${this.apiKeys.odds}&regions=us&markets=h2h,spreads,totals&oddsFormat=american`;
            
            const bettingData = await this.makeRequest(url);
            
            // Find Nebraska game
            const nebraskaGame = bettingData.find(game => 
                game.home_team?.toLowerCase().includes('nebraska') || 
                game.away_team?.toLowerCase().includes('nebraska')
            );
            
            return this.processBettingLines(nebraskaGame);
            
        } catch (error) {
            console.error('Failed to fetch betting lines:', error);
            return this.getMockBettingLines();
        }
    }
    
    // Get injury reports
    async getInjuryReport(teamName) {
        // Note: Injury data is limited in free APIs
        // This would typically require premium sports data services
        try {
            if (!this.apiKeys.cfbd) {
                return this.getMockInjuryReport(teamName);
            }
            
            const headers = { 'Authorization': `Bearer ${this.apiKeys.cfbd}` };
            
            // Try to get returning players data as a proxy for injuries
            const url = `${CONFIG.APIs.COLLEGE_FOOTBALL_DATA.baseUrl}/player/returning?year=2025&team=${teamName}`;
            const returningData = await this.makeRequest(url, { headers });
            
            return this.processInjuryData(returningData);
            
        } catch (error) {
            console.error('Failed to fetch injury data:', error);
            return this.getMockInjuryReport(teamName);
        }
    }
    
    // Get historical matchup data
    async getHistoricalMatchups(team1, team2) {
        if (!this.apiKeys.cfbd) {
            return this.getMockHistoricalData(team1, team2);
        }
        
        try {
            const headers = { 'Authorization': `Bearer ${this.apiKeys.cfbd}` };
            const url = `${CONFIG.APIs.COLLEGE_FOOTBALL_DATA.baseUrl}/games?team=${team1}&opponent=${team2}`;
            
            const gamesData = await this.makeRequest(url, { headers });
            return this.processHistoricalData(gamesData, team1, team2);
            
        } catch (error) {
            console.error('Failed to fetch historical data:', error);
            return this.getMockHistoricalData(team1, team2);
        }
    }
    
    // Get ESPN data (no auth required)
    async getESPNData(teamName) {
        try {
            const url = `${CONFIG.APIs.ESPN.baseUrl}/teams`;
            const teamsData = await this.makeRequest(url);
            
            // Find Nebraska team data
            const nebraskaTeam = teamsData.sports[0].leagues[0].teams.find(team => 
                team.team.displayName.toLowerCase().includes(teamName.toLowerCase())
            );
            
            return nebraskaTeam;
            
        } catch (error) {
            console.error('Failed to fetch ESPN data:', error);
            return null;
        }
    }
    
    // Process team statistics from multiple sources
    processTeamStats(teamName, basicStats, advancedStats, fpiData) {
        const isNebraska = teamName.toLowerCase().includes('nebraska');
        
        // Combine data from different sources
        const processedStats = {
            team: teamName,
            season: 2024,
            conference: isNebraska ? 'Big Ten' : 'Big 12',
            record: isNebraska ? '7-6' : '5-7',
            
            offense: this.extractOffensiveStats(basicStats, advancedStats),
            defense: this.extractDefensiveStats(basicStats, advancedStats),
            specialTeams: this.extractSpecialTeamsStats(basicStats),
            advanced: this.extractAdvancedStats(advancedStats, fpiData),
            
            // Will be populated by separate calls
            keyPlayers: [],
            trends: {
                recentForm: isNebraska ? ['W', 'W', 'L', 'W', 'L'] : ['L', 'L', 'W', 'L', 'L'],
                scoringTrend: isNebraska ? [17, 24, 31, 28, 35] : [14, 21, 28, 17, 20],
                allowedTrend: isNebraska ? [21, 17, 24, 20, 14] : [31, 28, 35, 24, 27]
            }
        };
        
        return processedStats;
    }
    
    // Extract offensive statistics
    extractOffensiveStats(basicStats, advancedStats) {
        if (!basicStats || !basicStats.length) {
            return this.getMockOffensiveStats();
        }
        
        const offenseStats = basicStats.find(stat => stat.category === 'offense') || {};
        
        return {
            pointsPerGame: offenseStats.pointsPerGame || 0,
            yardsPerGame: offenseStats.totalYards || 0,
            rushingYards: offenseStats.rushingYards || 0,
            passingYards: offenseStats.passingYards || 0,
            thirdDownConv: offenseStats.thirdDownConversions || 0,
            redZoneEff: offenseStats.redZoneConversions || 0,
            turnovers: offenseStats.turnovers || 0,
            sacks: offenseStats.sacksAllowed || 0,
            timeOfPossession: offenseStats.timeOfPossession || '30:00'
        };
    }
    
    // Extract defensive statistics
    extractDefensiveStats(basicStats, advancedStats) {
        if (!basicStats || !basicStats.length) {
            return this.getMockDefensiveStats();
        }
        
        const defenseStats = basicStats.find(stat => stat.category === 'defense') || {};
        
        return {
            pointsAllowed: defenseStats.pointsAllowed || 0,
            yardsAllowed: defenseStats.totalYardsAllowed || 0,
            rushingAllowed: defenseStats.rushingYardsAllowed || 0,
            passingAllowed: defenseStats.passingYardsAllowed || 0,
            thirdDownDef: defenseStats.thirdDownStops || 0,
            redZoneDef: defenseStats.redZoneStops || 0,
            forcedTurnovers: defenseStats.turnoversForced || 0,
            sacksFor: defenseStats.sacks || 0,
            tfl: defenseStats.tacklesForLoss || 0
        };
    }
    
    // Extract special teams statistics
    extractSpecialTeamsStats(basicStats) {
        const specialTeamsStats = basicStats?.find(stat => stat.category === 'specialTeams') || {};
        
        return {
            fieldGoalPct: specialTeamsStats.fieldGoalPercentage || 75,
            puntAverage: specialTeamsStats.puntAverage || 40,
            kickReturnAvg: specialTeamsStats.kickReturnAverage || 20,
            puntReturnAvg: specialTeamsStats.puntReturnAverage || 8,
            netPunting: specialTeamsStats.netPunting || 35
        };
    }
    
    // Extract advanced analytics
    extractAdvancedStats(advancedStats, fpiData) {
        const advanced = advancedStats?.[0] || {};
        const fpi = fpiData?.[0] || {};
        
        return {
            offenseEPA: advanced.offenseEPA || 0,
            defenseEPA: advanced.defenseEPA || 0,
            successRate: advanced.successRate || 40,
            explosivePlayRate: advanced.explosivePlayRate || 15,
            fpi: fpi.fpi || 0,
            strengthOfSchedule: fpi.strengthOfSchedule || 0,
            passingEPA: advanced.passingEPA || 0,
            rushingEPA: advanced.rushingEPA || 0
        };
    }
    
    // Process betting lines data
    processBettingLines(gameData) {
        if (!gameData || !gameData.bookmakers) {
            return this.getMockBettingLines();
        }
        
        const bookmaker = gameData.bookmakers[0];
        const markets = bookmaker.markets;
        
        const spread = markets.find(m => m.key === 'spreads');
        const moneyline = markets.find(m => m.key === 'h2h');
        const total = markets.find(m => m.key === 'totals');
        
        return {
            spread: this.formatSpread(spread),
            moneyline: this.formatMoneyline(moneyline),
            overUnder: total?.outcomes?.[0]?.point || 50,
            propBets: this.generatePropBets(),
            movement: this.generateLineMovement()
        };
    }
    
    // Format spread data
    formatSpread(spreadData) {
        if (!spreadData || !spreadData.outcomes) {
            return 'Nebraska -6.5';
        }
        
        const nebraska = spreadData.outcomes.find(o => 
            o.name.toLowerCase().includes('nebraska')
        );
        
        if (nebraska && nebraska.point < 0) {
            return `Nebraska ${nebraska.point}`;
        } else {
            return `Nebraska +${Math.abs(nebraska?.point || 6.5)}`;
        }
    }
    
    // Format moneyline data
    formatMoneyline(moneylineData) {
        if (!moneylineData || !moneylineData.outcomes) {
            return { nebraska: -275, opponent: +225 };
        }
        
        const nebraska = moneylineData.outcomes.find(o => 
            o.name.toLowerCase().includes('nebraska')
        );
        const opponent = moneylineData.outcomes.find(o => 
            !o.name.toLowerCase().includes('nebraska')
        );
        
        return {
            nebraska: nebraska?.price || -275,
            opponent: opponent?.price || +225
        };
    }
    
    // Generate prop bets (mock data as most APIs don't include these)
    generatePropBets() {
        return [
            { type: 'Dylan Raiola Passing Yards', line: 'Over/Under 247.5' },
            { type: 'Total Touchdowns', line: 'Over/Under 6.5' },
            { type: 'First Team to Score', line: 'Nebraska -140' }
        ];
    }
    
    // Generate line movement data
    generateLineMovement() {
        return {
            spread: { open: -7.0, current: -6.5, direction: 'up' },
            total: { open: 54.0, current: 53.5, direction: 'down' }
        };
    }
    
    // Process injury data
    processInjuryData(returningData) {
        // This is simplified - in reality you'd need medical data
        return {
            out: [],
            doubtful: [],
            questionable: [
                { name: 'Nash Hutmacher', position: 'DT', injury: 'Shoulder', timeline: 'Game-time decision' }
            ],
            probable: []
        };
    }
    
    // Process historical matchup data
    processHistoricalData(gamesData, team1, team2) {
        if (!gamesData || !gamesData.length) {
            return this.getMockHistoricalData(team1, team2);
        }
        
        let team1Wins = 0;
        let team2Wins = 0;
        let ties = 0;
        let lastGame = null;
        
        gamesData.forEach(game => {
            if (game.home_team === team1 && game.home_points > game.away_points) {
                team1Wins++;
            } else if (game.away_team === team1 && game.away_points > game.home_points) {
                team1Wins++;
            } else if (game.home_points === game.away_points) {
                ties++;
            } else {
                team2Wins++;
            }
            
            if (!lastGame || game.season > lastGame.season) {
                lastGame = game;
            }
        });
        
        return {
            allTimeRecord: { nebraska: team1Wins, opponent: team2Wins, ties },
            lastMeeting: lastGame ? {
                year: lastGame.season,
                winner: this.getGameWinner(lastGame),
                score: `${lastGame.home_points}-${lastGame.away_points}`
            } : null,
            streaks: { current: `${team1} ${team1Wins} games` },
            avgScore: {
                nebraska: gamesData.reduce((sum, g) => sum + (g.home_team === team1 ? g.home_points : g.away_points), 0) / gamesData.length,
                opponent: gamesData.reduce((sum, g) => sum + (g.home_team !== team1 ? g.home_points : g.away_points), 0) / gamesData.length
            },
            recentMeetings: gamesData.slice(-5),
            commonOpponents: this.getCommonOpponents(team1, team2)
        };
    }
    
    // Helper method to determine game winner
    getGameWinner(game) {
        if (game.home_points > game.away_points) {
            return game.home_team;
        } else if (game.away_points > game.home_points) {
            return game.away_team;
        }
        return 'Tie';
    }
    
    // Get common opponents (simplified)
    getCommonOpponents(team1, team2) {
        return [
            { opponent: 'Illinois', nebResult: 'W 31-24', oppResult: 'L 38-17' },
            { opponent: 'Indiana', nebResult: 'L 56-7', oppResult: 'W 24-17' }
        ];
    }
    
    // Mock data generators for demo mode
    getMockTeamStats(teamName) {
        const isNebraska = teamName.toLowerCase().includes('nebraska');
        return {
            team: teamName,
            season: 2024,
            conference: isNebraska ? 'Big Ten' : 'Big 12',
            record: isNebraska ? '7-6' : '5-7',
            
            offense: {
                pointsPerGame: isNebraska ? 23.8 : 20.0,
                yardsPerGame: isNebraska ? 363.1 : 321.4,
                rushingYards: isNebraska ? 162.7 : 126.3,
                passingYards: isNebraska ? 200.4 : 195.1,
                thirdDownConv: isNebraska ? 37.2 : 35.8,
                redZoneEff: isNebraska ? 81.3 : 75.6,
                turnovers: isNebraska ? 19 : 21,
                sacks: isNebraska ? 27 : 23,
                timeOfPossession: isNebraska ? '31:45' : '28:15'
            },
            
            defense: {
                pointsAllowed: isNebraska ? 18.7 : 24.3,
                yardsAllowed: isNebraska ? 332.5 : 367.8,
                rushingAllowed: isNebraska ? 126.8 : 142.1,
                passingAllowed: isNebraska ? 205.7 : 225.7,
                thirdDownDef: isNebraska ? 35.4 : 41.2,
                redZoneDef: isNebraska ? 78.9 : 71.8,
                forcedTurnovers: isNebraska ? 22 : 18,
                sacksFor: isNebraska ? 31 : 26,
                tfl: isNebraska ? 87 : 72
            },
            
            specialTeams: {
                fieldGoalPct: isNebraska ? 78 : 72,
                puntAverage: isNebraska ? 42.3 : 39.8,
                kickReturnAvg: isNebraska ? 21.5 : 19.7,
                puntReturnAvg: isNebraska ? 8.2 : 6.9,
                netPunting: isNebraska ? 38.7 : 35.2
            },
            
            advanced: {
                offenseEPA: isNebraska ? 0.12 : -0.08,
                defenseEPA: isNebraska ? -0.15 : 0.05,
                successRate: isNebraska ? 45.2 : 41.8,
                explosivePlayRate: isNebraska ? 16.3 : 14.1,
                fpi: isNebraska ? 12.7 : -3.2,
                strengthOfSchedule: isNebraska ? 0.8 : -0.3,
                passingEPA: isNebraska ? 0.08 : -0.12,
                rushingEPA: isNebraska ? 0.16 : -0.04
            },
            
            keyPlayers: isNebraska ? [
                { name: 'Dylan Raiola', position: 'QB', stats: '2,819 yds, 13 TD, 67.1% completion', grade: 78.5, injury: 'Healthy' },
                { name: 'Emmett Johnson', position: 'RB', stats: '847 yds, 8 TD, 4.9 YPC', grade: 82.1, injury: 'Healthy' },
                { name: 'Isaiah Neyor', position: 'WR', stats: '649 yds, 5 TD, 16.2 YPR', grade: 75.8, injury: 'Healthy' },
                { name: 'Nash Hutmacher', position: 'DT', stats: '42 tackles, 8.5 TFL, 4 sacks', grade: 85.2, injury: 'Questionable' },
                { name: 'MJ Sherman', position: 'LB', stats: '78 tackles, 12 TFL, 3 INT', grade: 79.4, injury: 'Healthy' }
            ] : [
                { name: 'Brendan Sorsby', position: 'QB', stats: '2,813 yds, 18 TD, 7 INT', grade: 74.2, injury: 'Healthy' },
                { name: 'Corey Kiner', position: 'RB', stats: '1,153 yds, 4 TD, 5.1 YPC', grade: 80.3, injury: 'Probable' },
                { name: 'Dontay Corleone', position: 'DT', stats: '45 tackles, 8.5 TFL, 6 sacks', grade: 88.7, injury: 'Healthy' },
                { name: 'Simeon Coleman', position: 'LB', stats: '32 tackles, 4.5 TFL, 2 INT', grade: 76.9, injury: 'Healthy' }
            ],
            
            trends: {
                recentForm: isNebraska ? ['W', 'W', 'L', 'W', 'L'] : ['L', 'L', 'W', 'L', 'L'],
                scoringTrend: isNebraska ? [17, 24, 31, 28, 35] : [14, 21, 28, 17, 20],
                allowedTrend: isNebraska ? [21, 17, 24, 20, 14] : [31, 28, 35, 24, 27]
            }
        };
    }
    
    getMockBettingLines() {
        return {
            spread: 'Nebraska -6.5',
            moneyline: { nebraska: -275, opponent: +225 },
            overUnder: 53.5,
            propBets: [
                { type: 'Dylan Raiola Passing Yards', line: 'Over/Under 247.5' },
                { type: 'Total Touchdowns', line: 'Over/Under 6.5' },
                { type: 'First Team to Score', line: 'Nebraska -140' }
            ],
            movement: {
                spread: { open: -7.0, current: -6.5, direction: 'up' },
                total: { open: 54.0, current: 53.5, direction: 'down' }
            }
        };
    }
    
    getMockInjuryReport(teamName) {
        const isNebraska = teamName.toLowerCase().includes('nebraska');
        return {
            out: isNebraska ? [] : [
                { name: 'Xzavier Henderson', position: 'WR', injury: 'Ankle', timeline: 'Season' }
            ],
            doubtful: [],
            questionable: isNebraska ? [
                { name: 'Nash Hutmacher', position: 'DT', injury: 'Shoulder', timeline: 'Game-time decision' }
            ] : [
                { name: 'Joe Royer', position: 'TE', injury: 'Knee', timeline: 'Likely to play' }
            ],
            probable: isNebraska ? [] : [
                { name: 'Corey Kiner', position: 'RB', injury: 'Minor hamstring', timeline: 'Expected to play' }
            ]
        };
    }
    
    getMockHistoricalData(team1, team2) {
        return {
            allTimeRecord: { nebraska: 1, opponent: 0, ties: 0 },
            lastMeeting: { year: 1906, winner: 'Nebraska', score: '41-0' },
            streaks: { current: 'Nebraska 1 game', longest: 'Nebraska 1 game' },
            avgScore: { nebraska: 41.0, opponent: 0.0 },
            recentMeetings: [
                { year: 1906, winner: 'Nebraska', score: '41-0', location: 'Lincoln' }
            ],
            commonOpponents: [
                { opponent: 'Illinois', nebResult: 'W 31-24', oppResult: 'L 38-17' },
                { opponent: 'Indiana', nebResult: 'L 56-7', oppResult: 'W 24-17' }
            ]
        };
    }
    
    // Clear cache
    clearCache() {
        this.cache.clear();
        console.log('API cache cleared');
    }
    
    // Get cache statistics
    getCacheStats() {
        return {
            size: this.cache.size,
            keys: Array.from(this.cache.keys())
        };
    }
}

// Export the API handler
if (typeof module !== 'undefined' && module.exports) {
    module.exports = HuskersAPI;
} else {
    window.HuskersAPI = HuskersAPI;
}
