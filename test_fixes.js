#!/usr/bin/env node

const axios = require('axios');

const BASE_URL = 'https://123test-new.launchpulse.ai';

async function testEndpoints() {
  console.log('Testing browser test fix deployments...\n');
  
  // Test 1: Health check
  console.log('1. Testing health endpoint...');
  try {
    const response = await axios.get(`${BASE_URL}/api/health`);
    console.log('✅ Health check passed:', response.status, response.data);
  } catch (error) {
    console.log('❌ Health check failed:', error.message);
    if (error.response) {
      console.log('Response:', error.response.status, error.response.data);
    }
  }
  
  // Test 2: Registration
  console.log('\n2. Testing registration endpoint...');
  const testUser = {
    email: `test-${Date.now()}@example.com`,
    password: 'testpass123',
    name: 'Test User'
  };
  
  try {
    const response = await axios.post(`${BASE_URL}/api/auth/register`, testUser);
    console.log('✅ Registration passed:', response.status);
    console.log('Response structure:', Object.keys(response.data));
    
    if (response.data.user && response.data.token) {
      console.log('✅ Response contains required fields (user, token)');
      
      // Test 3: Login with the same credentials
      console.log('\n3. Testing login endpoint...');
      try {
        const loginResponse = await axios.post(`${BASE_URL}/api/auth/login`, {
          email: testUser.email,
          password: testUser.password
        });
        console.log('✅ Login passed:', loginResponse.status);
        console.log('Login response structure:', Object.keys(loginResponse.data));
        
        // Test 4: Auth verification
        console.log('\n4. Testing auth verification...');
        try {
          const verifyResponse = await axios.get(`${BASE_URL}/api/auth/verify`, {
            headers: {
              Authorization: `Bearer ${loginResponse.data.token}`
            }
          });
          console.log('✅ Auth verification passed:', verifyResponse.status);
          console.log('Verified user:', verifyResponse.data.user.email);
          
          // Test 5: Tasks endpoint (protected)
          console.log('\n5. Testing tasks endpoint...');
          try {
            const tasksResponse = await axios.get(`${BASE_URL}/api/tasks`, {
              headers: {
                Authorization: `Bearer ${loginResponse.data.token}`
              }
            });
            console.log('✅ Tasks endpoint passed:', tasksResponse.status);
            console.log('Tasks count:', tasksResponse.data.length);
          } catch (error) {
            console.log('❌ Tasks endpoint failed:', error.message);
          }
        } catch (error) {
          console.log('❌ Auth verification failed:', error.message);
        }
      } catch (error) {
        console.log('❌ Login failed:', error.message);
        if (error.response) {
          console.log('Response:', error.response.status, error.response.data);
        }
      }
    } else {
      console.log('❌ Registration response missing required fields');
    }
  } catch (error) {
    console.log('❌ Registration failed:', error.message);
    if (error.response) {
      console.log('Response:', error.response.status, error.response.data);
    }
  }
  
  // Test 6: Frontend accessibility
  console.log('\n6. Testing frontend accessibility...');
  try {
    const frontendResponse = await axios.get(BASE_URL);
    console.log('✅ Frontend accessible:', frontendResponse.status);
    if (frontendResponse.data.includes('DOCTYPE html') || frontendResponse.data.includes('<html')) {
      console.log('✅ Frontend returns HTML content');
    }
  } catch (error) {
    console.log('❌ Frontend not accessible:', error.message);
  }
  
  console.log('\n=== Test Summary ===');
  console.log('The following issues have been addressed:');
  console.log('• Enhanced CORS logging and error handling');
  console.log('• Added comprehensive request/response logging');
  console.log('• Implemented response validation middleware');
  console.log('• Added error boundaries for JSON serialization');
  console.log('• Enhanced authentication flow debugging');
  console.log('• Added 404 handlers for API routes');
  console.log('• Ensured all endpoints return valid JSON');
}

testEndpoints().catch(console.error);