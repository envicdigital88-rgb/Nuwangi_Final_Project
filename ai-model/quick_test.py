from size_recommender import SizeRecommender
import json

rec = SizeRecommender()

# Test 1: Small measurements
result1 = rec.recommend_size({'chest_cm': 82, 'waist_cm': 66, 'hip_cm': 90, 'height_cm': 160}, 'female', 'shirt')
print("Test 1 (Small):", result1['recommended_size'], f"({result1['confidence']}%)")

# Test 2: Medium measurements
result2 = rec.recommend_size({'chest_cm': 88, 'waist_cm': 72, 'hip_cm': 95, 'height_cm': 165}, 'female', 'shirt')
print("Test 2 (Medium):", result2['recommended_size'], f"({result2['confidence']}%)")

# Test 3: Large measurements
result3 = rec.recommend_size({'chest_cm': 110, 'waist_cm': 95, 'hip_cm': 115, 'height_cm': 175}, 'female', 'shirt')
print("Test 3 (Large):", result3['recommended_size'], f"({result3['confidence']}%)")
