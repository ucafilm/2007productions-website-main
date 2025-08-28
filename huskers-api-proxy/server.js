// server.js - Secure API Proxy for Nebraska Huskers
// Keeps API keys secure on the server side

const express = require('express');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Security middleware
app.use(helmet({
    crossOriginEmbedderPolicy: false,
    contentSecurityPolicy: false
}));

// CORS configuration
app.use(cors({
    origin: [
        'https://www.2007productions.com',
        'https://2007productions.com',
        'http://localhost:3000',
        'http://localhost:8080',
        'http://127.0.0.1:5500' // For Live Server
    ],
    credentials: true,
    methods: ['GET', 'POST', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

// Rate limiting - more generous for development
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 200, // limit each IP to 200 requests per windowMs
    message: {
        error: 'Too many requests from this IP',
        message: 'Please try again later.',
        retryAfter: 900 // 15 minutes in seconds
    },
    standardHeaders: true,
    legacyHeaders: false
});
app.use(limiter);

app.use(express.json());

// Store API keys securely in environment variables
const API_KEYS = {
    CFBD: process.env.CFBD_API_KEY,
    ODDS: process.env.ODDS_API_KEY
};

// Helper function to make API requests with better error handling
async function makeSecureRequest(url, headers = {}) {
    const fetch = (await import('node-fetch')).default;
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
    
    try {
        console.log(`🔗 Making request to: ${url.replace(/apiKey=[^&]+/, 'apiKey=***')}`);
        
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'User-Agent': 'Nebraska-Huskers-Analysis/1.0 (https://2007productions.com)',
                'Accept': 'application/json',
                ...headers
            },
            signal: controller.signal
        });
        
        clearTimeout(timeoutId);
        
        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`HTTP ${response.status}: ${response.statusText} - ${errorText}`);
        }
        
        const data = await response.json();
        console.log(`✅ Request successful, received ${JSON.stringify(data).length} bytes`);
        return data;
        
    } catch (error) {
        clearTimeout(timeoutId);
        if (error.name === 'AbortError') {
            throw new Error('Request timeout after 10 seconds');
        }
        console.error('❌ API request failed:', error.message);
        throw error;
    }
}

// Root endpoint
app.get('/', (req, res) => {
    res.json({
        name: 'Nebraska Huskers API Proxy',
        version: '1.0.0',
        status: 'healthy',
        endpoints: {
            health: '/api/health',
            cfbd: '/api/cfbd/*',
            odds: '/api/odds/*'
        },
        documentation: 'https://github.com/2007productions/huskers-api-proxy'
    });
});

// Health check endpoint
app.get('/api/health', (req, res) => {
    const status = {
        status: 'healthy',
        timestamp: new Date().toISOString(),
        uptime: Math.floor(process.uptime()),
        apis: {
            cfbd: {
                configured: !!API_KEYS.CFBD,
                status: API_KEYS.CFBD ? 'ready' : 'missing_key'
            },
            odds: {
                configured: !!API_KEYS.ODDS,
                status: API_KEYS.ODDS ? 'ready' : 'missing_key'
            }
        },
        memory: {
            used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024) + 'MB',
            total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024) + 'MB'
        }
    };
    
    // Return 503 if no API keys are configured
    if (!API_KEYS.CFBD && !API_KEYS.ODDS) {
        return res.status(503).json({
            ...status,
            status: 'degraded',
            message: 'No API keys configured'
        });
    }
    
    res.json(status);
});

// Proxy endpoint for College Football Data API
app.get('/api/cfbd/*', async (req, res) => {
    try {
        if (!API_KEYS.CFBD) {
            return res.status(503).json({ 
                error: 'CFBD API not configured',
                message: 'College Football Data API key not found'
            });
        }
        
        const endpoint = req.path.replace('/api/cfbd/', '');
        const queryString = new URLSearchParams(req.query).toString();
        const url = `https://api.collegefootballdata.com/${endpoint}${queryString ? '?' + queryString : ''}`;
        
        console.log(`📊 CFBD Request: ${endpoint} ${queryString ? '?' + queryString : ''}`);
        
        const data = await makeSecureRequest(url, {
            'Authorization': `Bearer ${API_KEYS.CFBD}`
        });
        
        // Add cache headers based on data type
        if (endpoint.includes('stats') || endpoint.includes('ratings')) {
            res.set('Cache-Control', 'public, max-age=300'); // 5 minutes for stats
        } else if (endpoint.includes('games')) {
            res.set('Cache-Control', 'public, max-age=3600'); // 1 hour for historical games
        } else {
            res.set('Cache-Control', 'public, max-age=1800'); // 30 minutes default
        }
        
        res.json(data);
        
    } catch (error) {
        console.error('CFBD API Error:', error.message);
        
        // Return appropriate error status
        if (error.message.includes('401') || error.message.includes('403')) {
            res.status(401).json({ 
                error: 'Authentication failed',
                message: 'Invalid or expired CFBD API key'
            });
        } else if (error.message.includes('429')) {
            res.status(429).json({ 
                error: 'Rate limit exceeded',
                message: 'CFBD API rate limit reached, please try again later'
            });
        } else if (error.message.includes('timeout')) {
            res.status(408).json({ 
                error: 'Request timeout',
                message: 'CFBD API request timed out'
            });
        } else {
            res.status(500).json({ 
                error: 'Failed to fetch college football data',
                message: error.message.substring(0, 100) // Limit error message length
            });
        }
    }
});

// Proxy endpoint for The Odds API
app.get('/api/odds/*', async (req, res) => {
    try {
        if (!API_KEYS.ODDS) {
            return res.status(503).json({ 
                error: 'Odds API not configured',
                message: 'The Odds API key not found'
            });
        }
        
        const endpoint = req.path.replace('/api/odds/', '');
        const queryParams = new URLSearchParams(req.query);
        queryParams.append('apiKey', API_KEYS.ODDS);
        
        const url = `https://api.the-odds-api.com/v4/${endpoint}?${queryParams.toString()}`;
        
        console.log(`🎲 Odds Request: ${endpoint}`);
        
        const data = await makeSecureRequest(url);
        
        // Shorter cache for betting data as it changes frequently
        res.set('Cache-Control', 'public, max-age=60'); // 1 minute for betting data
        res.json(data);
        
    } catch (error) {
        console.error('Odds API Error:', error.message);
        
        // Return appropriate error status
        if (error.message.includes('401') || error.message.includes('403')) {
            res.status(401).json({ 
                error: 'Authentication failed',
                message: 'Invalid or expired Odds API key'
            });
        } else if (error.message.includes('429')) {
            res.status(429).json({ 
                error: 'Rate limit exceeded',
                message: 'Odds API rate limit reached, please try again later'
            });
        } else if (error.message.includes('timeout')) {
            res.status(408).json({ 
                error: 'Request timeout',
                message: 'Odds API request timed out'
            });
        } else {
            res.status(500).json({ 
                error: 'Failed to fetch betting data',
                message: error.message.substring(0, 100)
            });
        }
    }
});

// Test endpoint to verify API connectivity
app.get('/api/test', async (req, res) => {
    const results = {
        timestamp: new Date().toISOString(),
        tests: {}
    };
    
    // Test CFBD API
    if (API_KEYS.CFBD) {
        try {
            const cfbdTest = await makeSecureRequest(
                'https://api.collegefootballdata.com/teams?conference=Big%20Ten',
                { 'Authorization': `Bearer ${API_KEYS.CFBD}` }
            );
            results.tests.cfbd = {
                status: 'success',
                message: `Retrieved ${cfbdTest.length} teams`,
                responseTime: Date.now()
            };
        } catch (error) {
            results.tests.cfbd = {
                status: 'error',
                message: error.message,
                responseTime: Date.now()
            };
        }
    } else {
        results.tests.cfbd = {
            status: 'skipped',
            message: 'No API key configured'
        };
    }
    
    // Test Odds API
    if (API_KEYS.ODDS) {
        try {
            const oddsTest = await makeSecureRequest(
                `https://api.the-odds-api.com/v4/sports?apiKey=${API_KEYS.ODDS}`
            );
            results.tests.odds = {
                status: 'success',
                message: `Retrieved ${oddsTest.length} sports`,
                responseTime: Date.now()
            };
        } catch (error) {
            results.tests.odds = {
                status: 'error',
                message: error.message,
                responseTime: Date.now()
            };
        }
    } else {
        results.tests.odds = {
            status: 'skipped',
            message: 'No API key configured'
        };
    }
    
    res.json(results);
});

// API usage statistics (for monitoring)
app.get('/api/stats', (req, res) => {
    res.json({
        server: {
            name: 'Nebraska Huskers API Proxy',
            version: '1.0.0',
            uptime: Math.floor(process.uptime()),
            memory: process.memoryUsage(),
            nodeVersion: process.version
        },
        apis: {
            cfbd: { 
                configured: !!API_KEYS.CFBD,
                endpoint: 'https://api.collegefootballdata.com'
            },
            odds: { 
                configured: !!API_KEYS.ODDS,
                endpoint: 'https://api.the-odds-api.com/v4'
            }
        },
        limits: {
            rateLimit: '200 requests per 15 minutes',
            timeout: '10 seconds per request'
        }
    });
});

// Error handling middleware
app.use((error, req, res, next) => {
    console.error('💥 Server Error:', error);
    res.status(500).json({
        error: 'Internal server error',
        message: 'Something went wrong on our end',
        timestamp: new Date().toISOString()
    });
});

// 404 handler
app.use('*', (req, res) => {
    res.status(404).json({
        error: 'Not found',
        message: 'API endpoint not found',
        availableEndpoints: ['/api/health', '/api/cfbd/*', '/api/odds/*', '/api/test', '/api/stats']
    });
});

// Start server
app.listen(PORT, () => {
    console.log(`\n🚀 Nebraska Huskers API Proxy Server`);
    console.log(`📍 Running on port ${PORT}`);
    console.log(`🛡️  CFBD API: ${API_KEYS.CFBD ? '✅ Configured' : '❌ Missing'}`);
    console.log(`🎲 Odds API: ${API_KEYS.ODDS ? '✅ Configured' : '❌ Missing'}`);
    console.log(`📊 Health Check: http://localhost:${PORT}/api/health`);
    console.log(`🧪 Test Endpoint: http://localhost:${PORT}/api/test`);
    console.log(`📈 Stats: http://localhost:${PORT}/api/stats\n`);
    
    if (!API_KEYS.CFBD && !API_KEYS.ODDS) {
        console.log('⚠️  WARNING: No API keys configured!');
        console.log('   Create a .env file with your API keys:');
        console.log('   CFBD_API_KEY=your_key_here');
        console.log('   ODDS_API_KEY=your_key_here\n');
    }
});

// Graceful shutdown
process.on('SIGTERM', () => {
    console.log('🛑 Received SIGTERM, shutting down gracefully');
    process.exit(0);
});

process.on('SIGINT', () => {
    console.log('🛑 Received SIGINT, shutting down gracefully');
    process.exit(0);
});

module.exports = app;
