// Simple test script to verify member creation
const axios = require('axios');

const testMember = {
  nid: '1234567890123456',
  firstName: 'Test',
  lastName: 'User',
  telephone: '0781234567',
  email: 'test@example.com',
  balance: 1000
};

async function testAddMember() {
  try {
    console.log('Testing member creation...');
    const response = await axios.post('http://localhost:3000/api/ikv1/members', testMember);
    console.log('Success:', response.data);
  } catch (error) {
    console.error('Error:', error.response?.data || error.message);
  }
}

testAddMember();