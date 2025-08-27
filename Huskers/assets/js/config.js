// Configuration for Nebraska Huskers Game Sheet Generator
// API endpoints and settings

const CONFIG = {
    // API Configuration
    APIs: {
        COLLEGE_FOOTBALL_DATA: {
            baseUrl: 'https://api.collegefootballdata.com',
            endpoints: {
                teams: '/teams',
                games: '/games',
                stats: {
                    season: '/stats/season',
                    advanced: '/stats/season/advanced',
                    player: '/player/season/stats'
                },
                recruiting: '/recruiting/players',
                fpi: '/ratings/fpi',
                betting: '/lines',
                drives: '/drives',
                ppa: '/ppa/teams',
                returning: '/player/returning'
            },
            rateLimit: 100, // requests per minute
            requiresAuth: true
        },
        
        THE_ODDS_API: {
            baseUrl: 'https://api.the-odds-api.com/v4',
            endpoints: {
                odds: '/sports/americanfootball_ncaaf/odds',
                scores: '/sports/americanfootball_ncaaf/scores',
                events: '/sports/americanfootball_ncaaf/events'
            },
            rateLimit: 500, // requests per month (free tier)
            requiresAuth: true
        },
        
        ESPN: {
            baseUrl: 'https://site.api.espn.com/apis/site/v2/sports/football/college-football',
            endpoints: {
                scoreboard: '/scoreboard',
                teams: '/teams',
                rankings: '/rankings',
                news: '/news'
            },
            rateLimit: 1000, // requests per day (unofficial)
            requiresAuth: false
        }
    },
    
    // Team Configuration
    TEAMS: {
        NEBRASKA: {
            id: 158,
            name: 'Nebraska',
            fullName: 'Nebraska Cornhuskers',
            abbreviation: 'NEB',
            conference: 'Big Ten',
            colors: {
                primary: '#D00000',
                secondary: '#FEFDFA'
            },
            mascot: 'Cornhuskers',
            stadium: 'Memorial Stadium',
            location: 'Lincoln, NE'
        }
    },
    
    // Data refresh intervals (in milliseconds)
    REFRESH_INTERVALS: {
        live_game: 30000,      // 30 seconds during live games
        pre_game: 300000,      // 5 minutes before games
        off_season: 3600000,   // 1 hour during off-season
        betting_lines: 60000,  // 1 minute for betting data
        injury_reports: 1800000 // 30 minutes for injury data
    },
    
    // Cache configuration
    CACHE: {
        enabled: true,
        defaultTTL: 300000, // 5 minutes default
        keys: {
            team_stats: 'team_stats_',
            player_stats: 'player_stats_',
            betting_lines: 'betting_lines_',
            injury_report: 'injury_report_',
            historical_data: 'historical_data_'
        }
    },
    
    // Chart configuration
    CHARTS: {
        colors: {
            nebraska: '#D00000',
            opponent: '#2563eb',
            neutral: '#6b7280',
            positive: '#059669',
            negative: '#dc2626',
            warning: '#d97706'
        },
        
        radar: {
            scales: {
                r: {
                    angleLines: { display: false },
                    suggestedMin: 0,
                    suggestedMax: 100,
                    ticks: { display: false }
                }
            },
            plugins: {
                legend: { position: 'bottom' }
            }
        },
        
        line: {
            responsive: true,
            plugins: {
                legend: { position: 'bottom' }
            },
            scales: {
                y: { beginAtZero: true }
            }
        },
        
        bar: {
            responsive: true,
            plugins: {
                legend: { display: false }
            },
            scales: {
                y: { beginAtZero: true }
            }
        }
    },
    
    // Default game sheet configuration
    GAME_SHEET: {
        sections: [
            'game_info',
            'betting_lines',
            'team_comparison',
            'advanced_metrics',
            'key_players',
            'injury_report',
            'historical_matchup',
            'prediction'
        ],
        
        stats_categories: {
            offense: [
                'points_per_game',
                'total_yards',
                'rushing_yards',
                'passing_yards',
                'third_down_conversion',
                'red_zone_efficiency',
                'turnovers',
                'time_of_possession'
            ],
            defense: [
                'points_allowed',
                'total_yards_allowed',
                'rushing_yards_allowed',
                'passing_yards_allowed',
                'third_down_defense',
                'red_zone_defense',
                'sacks',
                'tackles_for_loss',
                'interceptions',
                'forced_fumbles'
            ],
            special_teams: [
                'field_goal_percentage',
                'punt_average',
                'kickoff_return_average',
                'punt_return_average'
            ]
        }
    },
    
    // Mock data for demo mode
    DEMO_MODE: {
        enabled: true,
        use_when_api_fails: true,
        sample_data_path: './assets/data/sample_data.json'
    },
    
    // Error handling
    ERROR_HANDLING: {
        max_retries: 3,
        retry_delay: 1000, // 1 second
        timeout: 10000,    // 10 seconds
        fallback_to_demo: true
    },
    
    // Export options
    EXPORT: {
        formats: ['txt', 'pdf', 'json'],
        default_format: 'txt',
        include_charts: true,
        pdf_options: {
            format: 'A4',
            margin: {
                top: 20,
                right: 20,
                bottom: 20,
                left: 20
            }
        }
    },
    
    // Storage configuration
    STORAGE: {
        use_local_storage: true,
        keys: {
            api_keys: 'huskers_api_keys',
            preferences: 'huskers_preferences',
            cache: 'huskers_cache'
        },
        encrypt_api_keys: true
    },
    
    // Analytics and tracking (optional)
    ANALYTICS: {
        enabled: false,
        track_api_usage: true,
        track_user_interactions: false
    },
    
    // Development settings
    DEV: {
        debug_mode: false,
        log_api_calls: true,
        show_mock_data_warning: true,
        enable_test_data: false
    },
    
    // Version and metadata
    VERSION: '1.0.0',
    BUILD_DATE: '2025-08-27',
    AUTHOR: '2007 Productions',
    DESCRIPTION: 'Nebraska Huskers Advanced Game Sheet Generator',
    
    // Feature flags
    FEATURES: {
        live_betting_lines: true,
        injury_reports: true,
        advanced_charts: true,
        historical_analysis: true,
        weather_data: true,
        coaching_analysis: true,
        social_sharing: false,
        email_reports: false,
        pdf_export: false
    }
};

// Utility functions for configuration
CONFIG.getApiUrl = function(service, endpoint, params = {}) {
    const baseUrl = this.APIs[service].baseUrl;
    const endpointPath = this.APIs[service].endpoints[endpoint];
    
    if (!baseUrl || !endpointPath) {
        throw new Error(`Invalid API configuration: ${service}.${endpoint}`);
    }
    
    let url = baseUrl + endpointPath;
    
    // Add query parameters
    if (Object.keys(params).length > 0) {
        const queryString = new URLSearchParams(params).toString();
        url += '?' + queryString;
    }
    
    return url;
};

CONFIG.getCacheKey = function(keyType, identifier) {
    const baseKey = this.CACHE.keys[keyType];
    if (!baseKey) {
        throw new Error(`Invalid cache key type: ${keyType}`);
    }
    return baseKey + identifier;
};

CONFIG.isFeatureEnabled = function(feature) {
    return this.FEATURES[feature] === true;
};

CONFIG.getChartConfig = function(type) {
    return this.CHARTS[type] || {};
};

CONFIG.shouldUseCache = function() {
    return this.CACHE.enabled && typeof Storage !== 'undefined';
};

CONFIG.isDemoMode = function() {
    return this.DEMO_MODE.enabled;
};

// Export configuration
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CONFIG;
} else {
    window.CONFIG = CONFIG;
}
