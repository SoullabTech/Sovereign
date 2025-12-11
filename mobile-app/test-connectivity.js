/**
 * Simple connectivity test for mobile app
 * Tests if the configured endpoints are reachable
 */

const fetch = require('node-fetch');

const baseUrls = [
    'http://127.0.0.1:3008',        // iOS Simulator compatible basic server
    'http://127.0.0.1:3001',        // iOS Simulator compatible full API server
    'http://localhost:3008',         // Basic consciousness computing server
    'http://localhost:3001',         // Full API server with beta chat
    'http://soullab.life',           // Primary universal HTTP access
];

async function testEndpoint(url) {
    try {
        console.log(`🔍 Testing: ${url}/api/status`);
        const response = await fetch(`${url}/api/status`, {
            timeout: 5000
        });

        if (response.ok) {
            const data = await response.text();
            console.log(`✅ ${url} - Status: ${response.status}`);
            return true;
        } else {
            console.log(`⚠️ ${url} - Status: ${response.status} ${response.statusText}`);
            return false;
        }
    } catch (error) {
        console.log(`❌ ${url} - Error: ${error.message}`);
        return false;
    }
}

async function testConnectivity() {
    console.log('🧠 MAIA Mobile App Connectivity Test\n');

    let workingEndpoints = 0;

    for (const url of baseUrls) {
        const isWorking = await testEndpoint(url);
        if (isWorking) workingEndpoints++;
        console.log('');
    }

    console.log(`\n📊 Results: ${workingEndpoints}/${baseUrls.length} endpoints working`);

    if (workingEndpoints > 0) {
        console.log('✅ Mobile app will be able to connect to consciousness computing platform');
        console.log('🚀 Ready for iOS simulator testing');
    } else {
        console.log('❌ No working endpoints found');
        console.log('🛠 Check that consciousness computing servers are running');
    }

    return workingEndpoints > 0;
}

// Run the test
if (require.main === module) {
    testConnectivity().then(success => {
        process.exit(success ? 0 : 1);
    });
}

module.exports = testConnectivity;