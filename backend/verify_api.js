const axios = require('axios');

const BASE_URL = 'http://localhost:3000/api/ikv1';

const runTests = async () => {
  try {
    console.log('--- Testing Loan Packages ---');
    // 1. Get Packages
    const pkgRes = await axios.get(`${BASE_URL}/loans/packages/all`);
    console.log('GET /packages/all:', pkgRes.status === 200 ? 'SUCCESS' : 'FAILED');
    console.log('Packages count:', pkgRes.data.length);
    if (pkgRes.data.length > 0) {
        console.log('First package:', pkgRes.data[0].name);
    }
    
    // 2. Check Eligibility (Member 9 from seed)
    console.log('\n--- Testing Eligibility ---');
    const memberId = 9;
    const eligRes = await axios.get(`${BASE_URL}/loans/eligibility/${memberId}`);
    console.log('GET /eligibility/9:', eligRes.status === 200 ? 'SUCCESS' : 'FAILED');
    console.log('Default Eligibility:', eligRes.data);

    // 3. Check Eligibility for specific package (ID 1 - Standard)
    const pkg1Res = await axios.get(`${BASE_URL}/loans/eligibility/${memberId}?packageId=1`);
    console.log('GET /eligibility/9?packageId=1:', pkg1Res.status === 200 ? 'SUCCESS' : 'FAILED');
    console.log('Standard Package Eligibility:', pkg1Res.data);

    // 4. Try Request Loan (if eligible)
    if (eligRes.data.eligible) {
        console.log('\n--- Testing Loan Request ---');
        // Request limit - 1000
        const amount = 1000;
        const reqRes = await axios.post(`${BASE_URL}/loans/auto`, {
            memberId: 9,
            amount: amount,
            re: "Test API Loan",
            duration: 6,
            packageId: 1
        });
        console.log('POST /loans/auto:', reqRes.status === 200 ? 'SUCCESS' : 'FAILED');
        console.log('Response:', reqRes.data);
    } else {
        console.log('\nSkipping Loan Request (Not eligible)');
    }

  } catch (error) {
    console.error('Test Failed:', error.response ? error.response.data : error.message);
  }
};

runTests();
