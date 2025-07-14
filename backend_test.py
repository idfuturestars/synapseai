#!/usr/bin/env python3
"""
SynapseTrade AI™ Backend API Testing Suite
Tests all backend endpoints for functionality and error handling
"""

import requests
import json
import sys
from datetime import datetime
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv('frontend/.env')

# Get backend URL from environment
BACKEND_URL = os.getenv('REACT_APP_BACKEND_URL', 'http://localhost:8001')
BASE_URL = f"{BACKEND_URL}/api"

class BackendTester:
    def __init__(self):
        self.base_url = BASE_URL
        self.session = requests.Session()
        self.test_results = []
        self.auth_token = None
        self.test_user_email = "sarah.johnson@synapsetrade.ai"
        self.test_user_password = "SecureTrading2025!"
        self.test_user_name = "Sarah Johnson"
        
    def log_result(self, test_name, success, message, response_data=None):
        """Log test result"""
        result = {
            'test': test_name,
            'success': success,
            'message': message,
            'timestamp': datetime.now().isoformat(),
            'response_data': response_data
        }
        self.test_results.append(result)
        status = "✅ PASS" if success else "❌ FAIL"
        print(f"{status} {test_name}: {message}")
        if response_data and not success:
            print(f"   Response: {response_data}")
    
    def test_health_check(self):
        """Test /api/health endpoint"""
        try:
            response = self.session.get(f"{self.base_url}/health")
            if response.status_code == 200:
                data = response.json()
                if 'status' in data and data['status'] == 'healthy':
                    self.log_result("Health Check", True, "Health endpoint working correctly", data)
                    return True
                else:
                    self.log_result("Health Check", False, "Health endpoint returned unexpected data", data)
                    return False
            else:
                self.log_result("Health Check", False, f"Health endpoint returned status {response.status_code}", response.text)
                return False
        except Exception as e:
            self.log_result("Health Check", False, f"Health endpoint failed with exception: {str(e)}")
            return False
    
    def test_user_registration(self):
        """Test /api/auth/register endpoint"""
        try:
            # First, try to register a new user
            user_data = {
                "email": self.test_user_email,
                "password": self.test_user_password,
                "full_name": self.test_user_name
            }
            
            response = self.session.post(f"{self.base_url}/auth/register", json=user_data)
            
            if response.status_code == 200:
                data = response.json()
                if 'access_token' in data and 'user_id' in data:
                    self.auth_token = data['access_token']
                    self.log_result("User Registration", True, "User registration successful", {
                        'user_id': data['user_id'],
                        'email': data['email'],
                        'token_type': data['token_type']
                    })
                    return True
                else:
                    self.log_result("User Registration", False, "Registration response missing required fields", data)
                    return False
            elif response.status_code == 400:
                # User might already exist, try to continue with login
                data = response.json()
                if "already registered" in data.get('detail', ''):
                    self.log_result("User Registration", True, "User already exists (expected for repeated tests)", data)
                    return True
                else:
                    self.log_result("User Registration", False, f"Registration failed with 400: {data.get('detail')}", data)
                    return False
            else:
                self.log_result("User Registration", False, f"Registration failed with status {response.status_code}", response.text)
                return False
        except Exception as e:
            self.log_result("User Registration", False, f"Registration failed with exception: {str(e)}")
            return False
    
    def test_user_login(self):
        """Test /api/auth/login endpoint"""
        try:
            login_data = {
                "email": self.test_user_email,
                "password": self.test_user_password
            }
            
            response = self.session.post(f"{self.base_url}/auth/login", json=login_data)
            
            if response.status_code == 200:
                data = response.json()
                if 'access_token' in data and 'user_id' in data:
                    self.auth_token = data['access_token']
                    self.log_result("User Login", True, "User login successful", {
                        'user_id': data['user_id'],
                        'email': data['email'],
                        'token_type': data['token_type']
                    })
                    return True
                else:
                    self.log_result("User Login", False, "Login response missing required fields", data)
                    return False
            else:
                self.log_result("User Login", False, f"Login failed with status {response.status_code}", response.text)
                return False
        except Exception as e:
            self.log_result("User Login", False, f"Login failed with exception: {str(e)}")
            return False
    
    def test_jwt_token_validation(self):
        """Test JWT token validation with protected endpoints"""
        if not self.auth_token:
            self.log_result("JWT Token Validation", False, "No auth token available for testing")
            return False
        
        try:
            # Test with valid token
            headers = {"Authorization": f"Bearer {self.auth_token}"}
            response = self.session.get(f"{self.base_url}/user/profile", headers=headers)
            
            if response.status_code == 200:
                self.log_result("JWT Token Validation", True, "Valid JWT token accepted by protected endpoint")
                
                # Test with invalid token
                invalid_headers = {"Authorization": "Bearer invalid_token_here"}
                invalid_response = self.session.get(f"{self.base_url}/user/profile", headers=invalid_headers)
                
                if invalid_response.status_code == 401:
                    self.log_result("JWT Token Validation - Invalid Token", True, "Invalid JWT token correctly rejected")
                    return True
                else:
                    self.log_result("JWT Token Validation - Invalid Token", False, f"Invalid token should return 401, got {invalid_response.status_code}")
                    return False
            else:
                self.log_result("JWT Token Validation", False, f"Valid token rejected with status {response.status_code}", response.text)
                return False
        except Exception as e:
            self.log_result("JWT Token Validation", False, f"JWT validation failed with exception: {str(e)}")
            return False
    
    def test_user_profile(self):
        """Test /api/user/profile endpoint"""
        if not self.auth_token:
            self.log_result("User Profile", False, "No auth token available for testing")
            return False
        
        try:
            headers = {"Authorization": f"Bearer {self.auth_token}"}
            response = self.session.get(f"{self.base_url}/user/profile", headers=headers)
            
            if response.status_code == 200:
                data = response.json()
                required_fields = ['user_id', 'email', 'full_name', 'created_at', 'last_login']
                
                if all(field in data for field in required_fields):
                    self.log_result("User Profile", True, "User profile endpoint working correctly", {
                        'email': data['email'],
                        'full_name': data['full_name'],
                        'provider': data.get('provider')
                    })
                    return True
                else:
                    missing_fields = [field for field in required_fields if field not in data]
                    self.log_result("User Profile", False, f"Profile response missing fields: {missing_fields}", data)
                    return False
            else:
                self.log_result("User Profile", False, f"Profile endpoint failed with status {response.status_code}", response.text)
                return False
        except Exception as e:
            self.log_result("User Profile", False, f"Profile endpoint failed with exception: {str(e)}")
            return False
    
    def test_user_stats(self):
        """Test /api/user/stats endpoint"""
        if not self.auth_token:
            self.log_result("User Stats", False, "No auth token available for testing")
            return False
        
        try:
            headers = {"Authorization": f"Bearer {self.auth_token}"}
            response = self.session.get(f"{self.base_url}/user/stats", headers=headers)
            
            if response.status_code == 200:
                data = response.json()
                required_fields = ['user_id', 'total_trades', 'total_strategies', 'recent_activity', 'account_status']
                
                if all(field in data for field in required_fields):
                    self.log_result("User Stats", True, "User stats endpoint working correctly", {
                        'total_trades': data['total_trades'],
                        'total_strategies': data['total_strategies'],
                        'account_status': data['account_status']
                    })
                    return True
                else:
                    missing_fields = [field for field in required_fields if field not in data]
                    self.log_result("User Stats", False, f"Stats response missing fields: {missing_fields}", data)
                    return False
            else:
                self.log_result("User Stats", False, f"Stats endpoint failed with status {response.status_code}", response.text)
                return False
        except Exception as e:
            self.log_result("User Stats", False, f"Stats endpoint failed with exception: {str(e)}")
            return False
    
    def test_oauth_endpoint_structure(self):
        """Test /api/auth/oauth endpoint structure (without actual OAuth flow)"""
        try:
            # Test with invalid provider
            oauth_data = {
                "access_token": "fake_token_for_testing",
                "provider": "invalid_provider"
            }
            
            response = self.session.post(f"{self.base_url}/auth/oauth", json=oauth_data)
            
            if response.status_code == 400:
                data = response.json()
                if "Unsupported OAuth provider" in data.get('detail', ''):
                    self.log_result("OAuth Endpoint Structure", True, "OAuth endpoint correctly validates provider")
                    return True
                else:
                    self.log_result("OAuth Endpoint Structure", False, f"Unexpected error message: {data.get('detail')}", data)
                    return False
            else:
                self.log_result("OAuth Endpoint Structure", False, f"OAuth endpoint returned unexpected status {response.status_code}", response.text)
                return False
        except Exception as e:
            self.log_result("OAuth Endpoint Structure", False, f"OAuth endpoint test failed with exception: {str(e)}")
            return False
    
    def test_error_handling(self):
        """Test various error handling scenarios"""
        error_tests_passed = 0
        total_error_tests = 3
        
        try:
            # Test 1: Login with invalid credentials
            invalid_login = {
                "email": "nonexistent@example.com",
                "password": "wrongpassword"
            }
            response = self.session.post(f"{self.base_url}/auth/login", json=invalid_login)
            if response.status_code == 401:
                error_tests_passed += 1
                self.log_result("Error Handling - Invalid Login", True, "Invalid credentials correctly rejected")
            else:
                self.log_result("Error Handling - Invalid Login", False, f"Expected 401, got {response.status_code}")
            
            # Test 2: Access protected endpoint without token
            response = self.session.get(f"{self.base_url}/user/profile")
            if response.status_code == 403:  # FastAPI HTTPBearer returns 403 for missing token
                error_tests_passed += 1
                self.log_result("Error Handling - Missing Token", True, "Missing token correctly rejected")
            else:
                self.log_result("Error Handling - Missing Token", False, f"Expected 403, got {response.status_code}")
            
            # Test 3: Register with missing required field
            invalid_user = {
                "email": "test@example.com",
                "password": "password123"
                # Missing full_name field
            }
            response = self.session.post(f"{self.base_url}/auth/register", json=invalid_user)
            if response.status_code == 422:  # Pydantic validation error
                error_tests_passed += 1
                self.log_result("Error Handling - Missing Field", True, "Missing required field correctly rejected")
            else:
                self.log_result("Error Handling - Missing Field", False, f"Expected 422, got {response.status_code}")
            
            # Overall error handling result
            if error_tests_passed == total_error_tests:
                self.log_result("Error Handling Overall", True, f"All {total_error_tests} error handling tests passed")
                return True
            else:
                self.log_result("Error Handling Overall", False, f"Only {error_tests_passed}/{total_error_tests} error handling tests passed")
                return False
                
        except Exception as e:
            self.log_result("Error Handling", False, f"Error handling tests failed with exception: {str(e)}")
            return False
    
    def run_all_tests(self):
        """Run all backend tests"""
        print(f"🚀 Starting SynapseTrade AI™ Backend API Tests")
        print(f"📍 Backend URL: {self.base_url}")
        print("=" * 60)
        
        # Test sequence
        tests = [
            ("Health Check", self.test_health_check),
            ("User Registration", self.test_user_registration),
            ("User Login", self.test_user_login),
            ("JWT Token Validation", self.test_jwt_token_validation),
            ("User Profile", self.test_user_profile),
            ("User Stats", self.test_user_stats),
            ("OAuth Endpoint Structure", self.test_oauth_endpoint_structure),
            ("Error Handling", self.test_error_handling)
        ]
        
        passed_tests = 0
        total_tests = len(tests)
        
        for test_name, test_func in tests:
            print(f"\n🧪 Running {test_name}...")
            if test_func():
                passed_tests += 1
        
        print("\n" + "=" * 60)
        print(f"📊 TEST SUMMARY")
        print(f"✅ Passed: {passed_tests}/{total_tests}")
        print(f"❌ Failed: {total_tests - passed_tests}/{total_tests}")
        
        if passed_tests == total_tests:
            print("🎉 All tests passed! Backend is working correctly.")
            return True
        else:
            print("⚠️  Some tests failed. Check the details above.")
            return False
    
    def get_detailed_results(self):
        """Return detailed test results"""
        return self.test_results

if __name__ == "__main__":
    tester = BackendTester()
    success = tester.run_all_tests()
    
    # Print detailed results if requested
    if len(sys.argv) > 1 and sys.argv[1] == "--detailed":
        print("\n" + "=" * 60)
        print("📋 DETAILED RESULTS")
        for result in tester.get_detailed_results():
            print(f"\n{result['test']}:")
            print(f"  Status: {'PASS' if result['success'] else 'FAIL'}")
            print(f"  Message: {result['message']}")
            print(f"  Time: {result['timestamp']}")
            if result['response_data']:
                print(f"  Data: {json.dumps(result['response_data'], indent=2)}")
    
    sys.exit(0 if success else 1)