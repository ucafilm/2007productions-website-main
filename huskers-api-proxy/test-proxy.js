// test-proxy.js - Quick test script for the API proxy
const fetch = require('node-fetch');

const PROXY_URL = 'http://localhost:3000';

async function testProxy() {
    console.log('🧪 Testing Nebraska Huskers API Proxy...\n');
    
    // Test 1: Health Check
    console.log('1️⃣ Testing health endpoint...');
    try {
        const healthResponse = await fetch(`${PROXY_URL}/api/health`);
        const healthData = await healthResponse.json();
        
        if (healthResponse.ok) {
            console.log('✅ Health check passed');
            console.log(`   CFBD: ${healthData.apis.cfbd.status}`);
            console.log(`   Odds: ${healthData.apis.odds.status}`);
        } else {
            console.log('❌ Health check failed:', healthData.message);
        }
    } catch (error) {
        console.log('❌ Health check error:', error.message);
        return;
    }
    
    console.log('\n2️⃣ Testing CFBD API (Nebraska team stats)...');
    try {
        const cfbdResponse = await fetch(`${PROXY_URL}/api/cfbd/stats/season?year=2024&team=Nebraska`);
        const cfbdData = await cfbdResponse.json();
        
        if (cfbdResponse.ok && Array.isArray(cfbdData)) {
            console.log('✅ CFBD API working');
            console.log(`   Retrieved ${cfbdData.length} stat records`);
        } else {
            console.log('❌ CFBD API failed:', cfbdData.error || cfbdData.message);
        }
    } catch (error) {
        console.log('❌ CFBD API error:', error.message);
    }
    
    console.log('\n3️⃣ Testing Odds API...');
    try {
        const oddsResponse = await fetch(`${PROXY_URL}/api/odds/sports?all=false`);
        const oddsData = await oddsResponse.json();
        
        if (oddsResponse.ok && Array.isArray(oddsData)) {
            console.log('✅ Odds API working');
            console.log(`   Retrieved ${oddsData.length} sports`);
        } else {
            console.log('❌ Odds API failed:', oddsData.error || oddsData.message);
        }
    } catch (error) {
        console.log('❌ Odds API error:', error.message);
    }
    
    console.log('\n4️⃣ Testing full API test endpoint...');
    try {
        const testResponse = await fetch(`${PROXY_URL}/api/test`);
        const testData = await testResponse.json();
        
        if (testResponse.ok) {
            console.log('✅ Full API test completed');
            console.log(`   CFBD: ${testData.tests.cfbd.status} - ${testData.tests.cfbd.message}`);
            console.log(`   Odds: ${testData.tests.odds.status} - ${testData.tests.odds.message}`);
        } else {
            console.log('❌ Full API test failed');
        }
    } catch (error) {
        console.log('❌ Full API test error:', error.message);
    }
    
    console.log('\n🎯 Proxy test complete!');
    console.log('\nIf all tests passed, your proxy is ready for deployment! 🚀');
}

// Run the test
testProxy().catch(console.error);
