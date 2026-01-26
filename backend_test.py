#!/usr/bin/env python3

import requests
import sys
import json
import uuid
from datetime import datetime
import base64

class HomeViewProAPITester:
    def __init__(self, base_url="https://homeview-pro.preview.emergentagent.com/api"):
        self.base_url = base_url
        self.token = None
        self.user_id = None
        self.test_property_id = None
        self.tests_run = 0
        self.tests_passed = 0
        self.failed_tests = []
        
        # Test data
        self.test_email = f"test_{uuid.uuid4().hex[:8]}@example.com"
        self.test_password = "TestPass123!"
        self.test_company = "Test Emlak Ltd."
        self.test_phone = "05551234567"

    def log_result(self, test_name, success, details=""):
        """Log test result"""
        self.tests_run += 1
        if success:
            self.tests_passed += 1
            print(f"✅ {test_name} - PASSED")
        else:
            self.failed_tests.append({"test": test_name, "details": details})
            print(f"❌ {test_name} - FAILED: {details}")

    def make_request(self, method, endpoint, data=None, expected_status=200):
        """Make HTTP request with proper headers"""
        url = f"{self.base_url}/{endpoint}"
        headers = {'Content-Type': 'application/json'}
        
        if self.token:
            headers['Authorization'] = f'Bearer {self.token}'

        try:
            if method == 'GET':
                response = requests.get(url, headers=headers, timeout=30)
            elif method == 'POST':
                response = requests.post(url, json=data, headers=headers, timeout=30)
            elif method == 'PUT':
                response = requests.put(url, json=data, headers=headers, timeout=30)
            elif method == 'DELETE':
                response = requests.delete(url, headers=headers, timeout=30)
            else:
                return False, {"error": f"Unsupported method: {method}"}

            success = response.status_code == expected_status
            
            try:
                response_data = response.json()
            except:
                response_data = {"raw_response": response.text}
                
            return success, response_data

        except requests.exceptions.RequestException as e:
            return False, {"error": str(e)}

    def test_health_check(self):
        """Test API health endpoints"""
        print("\n🔍 Testing Health Check...")
        
        # Test root endpoint
        success, data = self.make_request('GET', '')
        self.log_result("Root endpoint", success and "HomeView Pro API" in str(data))
        
        # Test health endpoint
        success, data = self.make_request('GET', 'health')
        self.log_result("Health endpoint", success and data.get("status") == "healthy")

    def test_user_registration(self):
        """Test user registration"""
        print("\n🔍 Testing User Registration...")
        
        registration_data = {
            "email": self.test_email,
            "password": self.test_password,
            "company_name": self.test_company,
            "phone": self.test_phone
        }
        
        success, data = self.make_request('POST', 'auth/register', registration_data, 200)
        
        if success and 'access_token' in data:
            self.token = data['access_token']
            self.user_id = data['user']['id']
            self.log_result("User registration", True)
        else:
            self.log_result("User registration", False, str(data))

    def test_user_login(self):
        """Test user login with existing credentials"""
        print("\n🔍 Testing User Login...")
        
        login_data = {
            "email": self.test_email,
            "password": self.test_password
        }
        
        success, data = self.make_request('POST', 'auth/login', login_data, 200)
        
        if success and 'access_token' in data:
            self.token = data['access_token']  # Update token
            self.log_result("User login", True)
        else:
            self.log_result("User login", False, str(data))

    def test_get_user_profile(self):
        """Test getting current user profile"""
        print("\n🔍 Testing User Profile...")
        
        success, data = self.make_request('GET', 'auth/me', expected_status=200)
        
        if success and data.get('email') == self.test_email:
            self.log_result("Get user profile", True)
        else:
            self.log_result("Get user profile", False, str(data))

    def test_create_property(self):
        """Test creating a new property"""
        print("\n🔍 Testing Property Creation...")
        
        # Create a simple base64 image for testing
        sample_image = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=="
        
        property_data = {
            "title": "Test Luxury Apartment",
            "description": "Beautiful test apartment with sea view",
            "address": "Test Street 123",
            "city": "Istanbul",
            "district": "Kadikoy",
            "square_meters": 120.5,
            "room_count": "3+1",
            "floor": 5,
            "total_floors": 10,
            "building_age": 3,
            "heating_type": "Doğalgaz (Kombi)",
            "facing_direction": "Güney",
            "price": 2500000.0,
            "currency": "TRY",
            "panorama_image": sample_image,
            "regular_images": [sample_image],
            "pois": [
                {
                    "name": "Test School",
                    "type": "school",
                    "distance": "500m"
                },
                {
                    "name": "Test Market",
                    "type": "market", 
                    "distance": "200m"
                }
            ]
        }
        
        success, data = self.make_request('POST', 'properties', property_data, 201)
        
        if success and 'id' in data:
            self.test_property_id = data['id']
            self.log_result("Create property", True)
        else:
            self.log_result("Create property", False, str(data))

    def test_get_properties(self):
        """Test getting user properties"""
        print("\n🔍 Testing Get Properties...")
        
        success, data = self.make_request('GET', 'properties', expected_status=200)
        
        if success and isinstance(data, list):
            self.log_result("Get properties list", True)
            
            # Check if our test property is in the list
            if self.test_property_id:
                property_found = any(p.get('id') == self.test_property_id for p in data)
                self.log_result("Test property in list", property_found)
        else:
            self.log_result("Get properties list", False, str(data))

    def test_get_single_property(self):
        """Test getting a single property by ID"""
        print("\n🔍 Testing Get Single Property...")
        
        if not self.test_property_id:
            self.log_result("Get single property", False, "No test property ID available")
            return
            
        success, data = self.make_request('GET', f'properties/{self.test_property_id}', expected_status=200)
        
        if success and data.get('id') == self.test_property_id:
            self.log_result("Get single property", True)
            
            # Verify property data
            expected_fields = ['title', 'address', 'city', 'district', 'price', 'pois']
            all_fields_present = all(field in data for field in expected_fields)
            self.log_result("Property data completeness", all_fields_present)
        else:
            self.log_result("Get single property", False, str(data))

    def test_update_property(self):
        """Test updating a property"""
        print("\n🔍 Testing Property Update...")
        
        if not self.test_property_id:
            self.log_result("Update property", False, "No test property ID available")
            return
            
        update_data = {
            "title": "Updated Test Apartment",
            "price": 2750000.0,
            "description": "Updated description with new features"
        }
        
        success, data = self.make_request('PUT', f'properties/{self.test_property_id}', update_data, 200)
        
        if success and data.get('title') == update_data['title']:
            self.log_result("Update property", True)
        else:
            self.log_result("Update property", False, str(data))

    def test_visit_tracking(self):
        """Test visit tracking functionality"""
        print("\n🔍 Testing Visit Tracking...")
        
        if not self.test_property_id:
            self.log_result("Visit tracking", False, "No test property ID available")
            return
            
        visit_data = {
            "property_id": self.test_property_id,
            "duration": 45,  # 45 seconds
            "visitor_ip": "192.168.1.1",
            "user_agent": "Mozilla/5.0 (Test Browser)"
        }
        
        success, data = self.make_request('POST', 'visits', visit_data, 200)
        
        if success and data.get('property_id') == self.test_property_id:
            self.log_result("Record visit", True)
        else:
            self.log_result("Record visit", False, str(data))

    def test_analytics(self):
        """Test analytics endpoints"""
        print("\n🔍 Testing Analytics...")
        
        success, data = self.make_request('GET', 'analytics', expected_status=200)
        
        if success and 'total_views' in data and 'total_duration' in data:
            self.log_result("Get analytics", True)
            
            # Verify analytics structure
            required_fields = ['total_views', 'total_duration', 'avg_duration', 'daily_views', 'top_properties']
            all_fields_present = all(field in data for field in required_fields)
            self.log_result("Analytics data structure", all_fields_present)
        else:
            self.log_result("Get analytics", False, str(data))

    def test_property_visits(self):
        """Test getting visits for a specific property"""
        print("\n🔍 Testing Property Visits...")
        
        if not self.test_property_id:
            self.log_result("Get property visits", False, "No test property ID available")
            return
            
        success, data = self.make_request('GET', f'properties/{self.test_property_id}/visits', expected_status=200)
        
        if success and isinstance(data, list):
            self.log_result("Get property visits", True)
        else:
            self.log_result("Get property visits", False, str(data))

    def test_invalid_login(self):
        """Test login with invalid credentials"""
        print("\n🔍 Testing Invalid Login...")
        
        invalid_login_data = {
            "email": "nonexistent@example.com",
            "password": "wrongpassword"
        }
        
        success, data = self.make_request('POST', 'auth/login', invalid_login_data, 401)
        self.log_result("Invalid login rejection", success)

    def test_unauthorized_access(self):
        """Test accessing protected endpoints without token"""
        print("\n🔍 Testing Unauthorized Access...")
        
        # Temporarily remove token
        original_token = self.token
        self.token = None
        
        success, data = self.make_request('GET', 'properties', expected_status=401)
        self.log_result("Unauthorized access rejection", success)
        
        # Restore token
        self.token = original_token

    def test_delete_property(self):
        """Test deleting a property (run last)"""
        print("\n🔍 Testing Property Deletion...")
        
        if not self.test_property_id:
            self.log_result("Delete property", False, "No test property ID available")
            return
            
        success, data = self.make_request('DELETE', f'properties/{self.test_property_id}', expected_status=200)
        
        if success and 'message' in data:
            self.log_result("Delete property", True)
        else:
            self.log_result("Delete property", False, str(data))

    def run_all_tests(self):
        """Run all backend tests"""
        print("🚀 Starting HomeView Pro Backend API Tests")
        print(f"📍 Testing against: {self.base_url}")
        print("=" * 60)
        
        # Test sequence
        self.test_health_check()
        self.test_user_registration()
        self.test_user_login()
        self.test_get_user_profile()
        self.test_create_property()
        self.test_get_properties()
        self.test_get_single_property()
        self.test_update_property()
        self.test_visit_tracking()
        self.test_analytics()
        self.test_property_visits()
        self.test_invalid_login()
        self.test_unauthorized_access()
        self.test_delete_property()  # Run last
        
        # Print summary
        print("\n" + "=" * 60)
        print("📊 TEST SUMMARY")
        print("=" * 60)
        print(f"✅ Tests Passed: {self.tests_passed}/{self.tests_run}")
        print(f"❌ Tests Failed: {len(self.failed_tests)}/{self.tests_run}")
        
        if self.failed_tests:
            print("\n🔍 FAILED TESTS:")
            for failure in self.failed_tests:
                print(f"   • {failure['test']}: {failure['details']}")
        
        success_rate = (self.tests_passed / self.tests_run) * 100 if self.tests_run > 0 else 0
        print(f"\n📈 Success Rate: {success_rate:.1f}%")
        
        return self.tests_passed == self.tests_run

def main():
    """Main test execution"""
    tester = HomeViewProAPITester()
    
    try:
        all_passed = tester.run_all_tests()
        return 0 if all_passed else 1
    except Exception as e:
        print(f"\n💥 Test execution failed: {str(e)}")
        return 1

if __name__ == "__main__":
    sys.exit(main())