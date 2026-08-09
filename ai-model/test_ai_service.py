"""
Test AI Service - Quick verification script
Run this to test all AI features
"""

import requests
import json

BASE_URL = "http://localhost:5000"

def test_health():
    """Test if AI service is running"""
    print("\n" + "="*60)
    print("TEST 1: Health Check")
    print("="*60)
    
    try:
        response = requests.get(f"{BASE_URL}/health")
        print(f"Status: {response.status_code}")
        print(f"Response: {json.dumps(response.json(), indent=2)}")
        return response.status_code == 200
    except Exception as e:
        print(f"❌ FAILED: {e}")
        print("Make sure AI service is running: python ai_service.py")
        return False

def test_size_recommendation():
    """Test size recommendation"""
    print("\n" + "="*60)
    print("TEST 2: Size Recommendation")
    print("="*60)
    
    data = {
        "measurements": {
            "chest_cm": 92,
            "waist_cm": 76,
            "hip_cm": 98,
            "height_cm": 170
        },
        "gender": "female",
        "clothing_type": "shirt"
    }
    
    print(f"Input: {json.dumps(data, indent=2)}")
    
    try:
        response = requests.post(
            f"{BASE_URL}/api/ai/recommend-size",
            json=data
        )
        print(f"\nStatus: {response.status_code}")
        print(f"Response: {json.dumps(response.json(), indent=2)}")
        return response.status_code == 200
    except Exception as e:
        print(f"❌ FAILED: {e}")
        return False

def test_color_recommendation():
    """Test color recommendation"""
    print("\n" + "="*60)
    print("TEST 3: Color Recommendation")
    print("="*60)
    
    data = {
        "skin_tone": "medium",
        "occasion": "casual"
    }
    
    print(f"Input: {json.dumps(data, indent=2)}")
    
    try:
        response = requests.post(
            f"{BASE_URL}/api/ai/recommend-colors",
            json=data
        )
        print(f"\nStatus: {response.status_code}")
        result = response.json()
        if result.get('success'):
            recommendations = result.get('recommendations', {})
            print(f"\nBest Colors:")
            for color in recommendations.get('best_colors', [])[:3]:
                print(f"  - {color['name']}: {color['hex']} (Match: {color['match']}%)")
        return response.status_code == 200
    except Exception as e:
        print(f"❌ FAILED: {e}")
        return False

def test_style_recommendation():
    """Test style recommendation"""
    print("\n" + "="*60)
    print("TEST 4: Style Recommendation")
    print("="*60)
    
    data = {
        "body_shape": "hourglass",
        "gender": "female",
        "clothing_type": "shirt"
    }
    
    print(f"Input: {json.dumps(data, indent=2)}")
    
    try:
        response = requests.post(
            f"{BASE_URL}/api/ai/recommend-style",
            json=data
        )
        print(f"\nStatus: {response.status_code}")
        result = response.json()
        if result.get('success'):
            recommendations = result.get('recommendations', {})
            print(f"\nRecommended Styles:")
            for style in recommendations.get('recommended_styles', [])[:3]:
                print(f"  - {style}")
            print(f"\nStyle Tips:")
            for tip in recommendations.get('tips', [])[:2]:
                print(f"  - {tip}")
        return response.status_code == 200
    except Exception as e:
        print(f"❌ FAILED: {e}")
        return False

def test_complete_recommendation():
    """Test complete recommendation"""
    print("\n" + "="*60)
    print("TEST 5: Complete Recommendation (All Features)")
    print("="*60)
    
    data = {
        "measurements": {
            "chest_cm": 92,
            "waist_cm": 76,
            "hip_cm": 98,
            "height_cm": 170
        },
        "skin_tone": "medium",
        "body_shape": "hourglass",
        "gender": "female",
        "clothing_type": "shirt",
        "occasion": "casual"
    }
    
    print(f"Input: User profile with all details")
    
    try:
        response = requests.post(
            f"{BASE_URL}/api/ai/complete-recommendation",
            json=data
        )
        print(f"\nStatus: {response.status_code}")
        result = response.json()
        if result.get('success'):
            print("\n✅ Complete recommendation generated successfully!")
            print(f"  - Size: {result.get('size_recommendation', {}).get('recommended_size')}")
            print(f"  - Confidence: {result.get('size_recommendation', {}).get('confidence')}%")
            print(f"  - Best colors available")
            print(f"  - Style tips provided")
        return response.status_code == 200
    except Exception as e:
        print(f"❌ FAILED: {e}")
        return False

def run_all_tests():
    """Run all tests"""
    print("\n" + "="*60)
    print("🤖 AI SERVICE TEST SUITE")
    print("="*60)
    print("Testing all AI features...")
    
    results = []
    
    # Run tests
    results.append(("Health Check", test_health()))
    results.append(("Size Recommendation", test_size_recommendation()))
    results.append(("Color Recommendation", test_color_recommendation()))
    results.append(("Style Recommendation", test_style_recommendation()))
    results.append(("Complete Recommendation", test_complete_recommendation()))
    
    # Summary
    print("\n" + "="*60)
    print("TEST SUMMARY")
    print("="*60)
    
    passed = sum(1 for _, result in results if result)
    total = len(results)
    
    for test_name, result in results:
        status = "✅ PASS" if result else "❌ FAIL"
        print(f"{status} - {test_name}")
    
    print(f"\nTotal: {passed}/{total} tests passed")
    
    if passed == total:
        print("\n🎉 All tests passed! Your AI service is working perfectly!")
        print("\nNext steps:")
        print("1. Keep AI service running")
        print("2. Start your Java backend: mvn spring-boot:run")
        print("3. Test from Java: curl http://localhost:8082/api/ai/health")
    else:
        print("\n⚠️  Some tests failed. Check the errors above.")
        print("Make sure AI service is running: python ai_service.py")
    
    print("="*60)

if __name__ == "__main__":
    run_all_tests()
