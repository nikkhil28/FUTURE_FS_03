#!/usr/bin/env python3
"""
Backend API Testing for Pineapple Website
Tests Firebase Firestore integration and all API endpoints
"""

import requests
import json
import os
from typing import Dict, List, Any

# Get base URL from environment
BASE_URL = os.getenv('NEXT_PUBLIC_BASE_URL', 'https://apple-rebrand.preview.emergentagent.com')
API_BASE = f"{BASE_URL}/api"

class PineappleAPITester:
    def __init__(self):
        self.base_url = API_BASE
        self.session = requests.Session()
        self.session.headers.update({
            'Content-Type': 'application/json',
            'User-Agent': 'Pineapple-API-Tester/1.0'
        })
        self.test_results = []
        self.product_ids = []
        
    def log_result(self, test_name: str, success: bool, message: str, data: Any = None):
        """Log test result"""
        result = {
            'test': test_name,
            'success': success,
            'message': message,
            'data': data
        }
        self.test_results.append(result)
        status = "✅ PASS" if success else "❌ FAIL"
        print(f"{status}: {test_name} - {message}")
        if data and not success:
            print(f"   Data: {json.dumps(data, indent=2)}")
    
    def test_firebase_connection(self):
        """Test basic API connectivity"""
        try:
            response = self.session.get(f"{self.base_url}")
            if response.status_code == 200:
                data = response.json()
                self.log_result(
                    "Firebase API Connection", 
                    True, 
                    f"API accessible, response: {data.get('message', 'OK')}"
                )
                return True
            else:
                self.log_result(
                    "Firebase API Connection", 
                    False, 
                    f"API returned status {response.status_code}",
                    response.text
                )
                return False
        except Exception as e:
            self.log_result(
                "Firebase API Connection", 
                False, 
                f"Connection failed: {str(e)}"
            )
            return False
    
    def test_get_all_products(self):
        """Test GET /api/products - Should return all products"""
        try:
            response = self.session.get(f"{self.base_url}/products")
            
            if response.status_code != 200:
                self.log_result(
                    "GET /api/products", 
                    False, 
                    f"Expected status 200, got {response.status_code}",
                    response.text
                )
                return False
            
            data = response.json()
            
            # Check response structure
            if 'products' not in data:
                self.log_result(
                    "GET /api/products", 
                    False, 
                    "Response missing 'products' field",
                    data
                )
                return False
            
            products = data['products']
            
            if not isinstance(products, list):
                self.log_result(
                    "GET /api/products", 
                    False, 
                    "Products field is not an array",
                    data
                )
                return False
            
            if len(products) == 0:
                self.log_result(
                    "GET /api/products", 
                    False, 
                    "No products found - database may be empty"
                )
                return False
            
            # Store product IDs for later tests
            self.product_ids = [p.get('id') for p in products if p.get('id')]
            
            # Validate product structure
            required_fields = ['id', 'name', 'category', 'price', 'description', 'image', 'features', 'colors']
            sample_product = products[0]
            missing_fields = [field for field in required_fields if field not in sample_product]
            
            if missing_fields:
                self.log_result(
                    "GET /api/products", 
                    False, 
                    f"Product missing required fields: {missing_fields}",
                    sample_product
                )
                return False
            
            # Check categories
            categories = set(p.get('category') for p in products)
            expected_categories = {'phone', 'laptop', 'tablet', 'watch'}
            
            self.log_result(
                "GET /api/products", 
                True, 
                f"Retrieved {len(products)} products with categories: {categories}",
                {
                    'product_count': len(products),
                    'categories': list(categories),
                    'sample_product': sample_product
                }
            )
            return True
            
        except Exception as e:
            self.log_result(
                "GET /api/products", 
                False, 
                f"Request failed: {str(e)}"
            )
            return False
    
    def test_get_products_by_category(self):
        """Test GET /api/products/category/:category for all categories"""
        categories = ['phone', 'laptop', 'tablet', 'watch']
        all_passed = True
        
        for category in categories:
            try:
                response = self.session.get(f"{self.base_url}/products/category/{category}")
                
                if response.status_code != 200:
                    self.log_result(
                        f"GET /api/products/category/{category}", 
                        False, 
                        f"Expected status 200, got {response.status_code}",
                        response.text
                    )
                    all_passed = False
                    continue
                
                data = response.json()
                
                if 'products' not in data:
                    self.log_result(
                        f"GET /api/products/category/{category}", 
                        False, 
                        "Response missing 'products' field",
                        data
                    )
                    all_passed = False
                    continue
                
                products = data['products']
                
                # Verify all products belong to the requested category
                wrong_category = [p for p in products if p.get('category') != category]
                if wrong_category:
                    self.log_result(
                        f"GET /api/products/category/{category}", 
                        False, 
                        f"Found {len(wrong_category)} products with wrong category",
                        wrong_category
                    )
                    all_passed = False
                    continue
                
                self.log_result(
                    f"GET /api/products/category/{category}", 
                    True, 
                    f"Retrieved {len(products)} {category} products",
                    {'product_count': len(products)}
                )
                
            except Exception as e:
                self.log_result(
                    f"GET /api/products/category/{category}", 
                    False, 
                    f"Request failed: {str(e)}"
                )
                all_passed = False
        
        return all_passed
    
    def test_get_single_product(self):
        """Test GET /api/products/:id with valid and invalid IDs"""
        if not self.product_ids:
            self.log_result(
                "GET /api/products/:id", 
                False, 
                "No product IDs available for testing"
            )
            return False
        
        all_passed = True
        
        # Test with valid product ID
        test_id = self.product_ids[0]
        try:
            response = self.session.get(f"{self.base_url}/products/{test_id}")
            
            if response.status_code != 200:
                self.log_result(
                    f"GET /api/products/{test_id}", 
                    False, 
                    f"Expected status 200, got {response.status_code}",
                    response.text
                )
                all_passed = False
            else:
                data = response.json()
                
                if 'product' not in data:
                    self.log_result(
                        f"GET /api/products/{test_id}", 
                        False, 
                        "Response missing 'product' field",
                        data
                    )
                    all_passed = False
                else:
                    product = data['product']
                    if product.get('id') != test_id:
                        self.log_result(
                            f"GET /api/products/{test_id}", 
                            False, 
                            f"Product ID mismatch: expected {test_id}, got {product.get('id')}",
                            product
                        )
                        all_passed = False
                    else:
                        self.log_result(
                            f"GET /api/products/{test_id}", 
                            True, 
                            f"Retrieved product: {product.get('name')}",
                            {'product_name': product.get('name')}
                        )
        
        except Exception as e:
            self.log_result(
                f"GET /api/products/{test_id}", 
                False, 
                f"Request failed: {str(e)}"
            )
            all_passed = False
        
        # Test with invalid product ID
        invalid_id = "nonexistent-product-id-12345"
        try:
            response = self.session.get(f"{self.base_url}/products/{invalid_id}")
            
            if response.status_code != 404:
                self.log_result(
                    f"GET /api/products/{invalid_id} (invalid)", 
                    False, 
                    f"Expected status 404, got {response.status_code}",
                    response.text
                )
                all_passed = False
            else:
                data = response.json()
                if 'error' not in data:
                    self.log_result(
                        f"GET /api/products/{invalid_id} (invalid)", 
                        False, 
                        "404 response missing error field",
                        data
                    )
                    all_passed = False
                else:
                    self.log_result(
                        f"GET /api/products/{invalid_id} (invalid)", 
                        True, 
                        f"Correctly returned 404 with error: {data['error']}"
                    )
        
        except Exception as e:
            self.log_result(
                f"GET /api/products/{invalid_id} (invalid)", 
                False, 
                f"Request failed: {str(e)}"
            )
            all_passed = False
        
        return all_passed
    
    def test_seed_products(self):
        """Test POST /api/products/seed"""
        try:
            response = self.session.post(f"{self.base_url}/products/seed")
            
            if response.status_code != 200:
                self.log_result(
                    "POST /api/products/seed", 
                    False, 
                    f"Expected status 200, got {response.status_code}",
                    response.text
                )
                return False
            
            data = response.json()
            
            required_fields = ['message', 'count', 'products']
            missing_fields = [field for field in required_fields if field not in data]
            
            if missing_fields:
                self.log_result(
                    "POST /api/products/seed", 
                    False, 
                    f"Response missing required fields: {missing_fields}",
                    data
                )
                return False
            
            if data['count'] != 8:
                self.log_result(
                    "POST /api/products/seed", 
                    False, 
                    f"Expected 8 products to be seeded, got {data['count']}",
                    data
                )
                return False
            
            self.log_result(
                "POST /api/products/seed", 
                True, 
                f"Successfully seeded {data['count']} products",
                {'count': data['count'], 'message': data['message']}
            )
            return True
            
        except Exception as e:
            self.log_result(
                "POST /api/products/seed", 
                False, 
                f"Request failed: {str(e)}"
            )
            return False
    
    def run_all_tests(self):
        """Run all backend tests"""
        print("🍍 Starting Pineapple Backend API Tests")
        print(f"Testing API at: {self.base_url}")
        print("=" * 60)
        
        # Test Firebase connection first
        if not self.test_firebase_connection():
            print("❌ Firebase connection failed - aborting tests")
            return False
        
        # Run all API tests
        tests = [
            self.test_get_all_products,
            self.test_get_products_by_category,
            self.test_get_single_product,
            self.test_seed_products
        ]
        
        passed = 0
        total = len(tests)
        
        for test in tests:
            if test():
                passed += 1
        
        print("=" * 60)
        print(f"🍍 Test Results: {passed}/{total} tests passed")
        
        if passed == total:
            print("✅ All backend tests PASSED!")
            return True
        else:
            print(f"❌ {total - passed} tests FAILED")
            return False
    
    def get_summary(self):
        """Get test summary"""
        passed = sum(1 for r in self.test_results if r['success'])
        total = len(self.test_results)
        
        return {
            'total_tests': total,
            'passed': passed,
            'failed': total - passed,
            'success_rate': f"{(passed/total*100):.1f}%" if total > 0 else "0%",
            'results': self.test_results
        }

if __name__ == "__main__":
    tester = PineappleAPITester()
    success = tester.run_all_tests()
    
    # Print detailed summary
    summary = tester.get_summary()
    print(f"\n📊 Final Summary:")
    print(f"   Total Tests: {summary['total_tests']}")
    print(f"   Passed: {summary['passed']}")
    print(f"   Failed: {summary['failed']}")
    print(f"   Success Rate: {summary['success_rate']}")
    
    if not success:
        print("\n❌ Some tests failed. Check the logs above for details.")
        exit(1)
    else:
        print("\n✅ All backend tests completed successfully!")
        exit(0)