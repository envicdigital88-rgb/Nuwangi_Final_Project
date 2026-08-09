"""
Analyze AI Model Confidence Levels
Shows why we can't get 100% confidence
"""

from size_recommender import SizeRecommender
import json

recommender = SizeRecommender()

print("=" * 70)
print("AI CONFIDENCE ANALYSIS")
print("=" * 70)

test_cases = [
    {
        'name': 'Clear Size S (Small person)',
        'measurements': {'chest_cm': 82, 'waist_cm': 66, 'hip_cm': 90, 'height_cm': 160},
        'expected': 'S'
    },
    {
        'name': 'Clear Size M (Medium person)',
        'measurements': {'chest_cm': 92, 'waist_cm': 76, 'hip_cm': 98, 'height_cm': 170},
        'expected': 'M'
    },
    {
        'name': 'Clear Size XXL (Large person)',
        'measurements': {'chest_cm': 110, 'waist_cm': 95, 'hip_cm': 115, 'height_cm': 175},
        'expected': 'XXL'
    },
    {
        'name': 'BORDERLINE M/L (Between sizes)',
        'measurements': {'chest_cm': 95, 'waist_cm': 78, 'hip_cm': 101, 'height_cm': 168},
        'expected': 'M or L'
    },
    {
        'name': 'BORDERLINE S/M (Between sizes)',
        'measurements': {'chest_cm': 88, 'waist_cm': 72, 'hip_cm': 95, 'height_cm': 165},
        'expected': 'S or M'
    }
]

for i, test in enumerate(test_cases, 1):
    print(f"\n{i}. {test['name']}")
    print("-" * 70)
    print(f"Measurements: Chest={test['measurements']['chest_cm']}cm, "
          f"Waist={test['measurements']['waist_cm']}cm, "
          f"Hip={test['measurements']['hip_cm']}cm")
    
    result = recommender.recommend_size(test['measurements'], 'female', 'shirt')
    
    print(f"\n✓ Recommended: Size {result['recommended_size']}")
    print(f"  Confidence: {result['confidence']}%")
    
    if result['confidence'] >= 90:
        print(f"  → VERY CONFIDENT (Clear case)")
    elif result['confidence'] >= 75:
        print(f"  → CONFIDENT (Good prediction)")
    elif result['confidence'] >= 60:
        print(f"  → MODERATE (Borderline case)")
    else:
        print(f"  → LOW (Uncertain)")
    
    if result['alternatives']:
        print(f"\n  Alternatives:")
        for alt in result['alternatives']:
            print(f"    - Size {alt['size']}: {alt['probability']}%")
    
    print(f"\n  Why not 100%?")
    if result['confidence'] >= 90:
        print(f"    → Very clear case, but still shows alternatives for user choice")
    elif result['confidence'] >= 75:
        print(f"    → Measurements are typical for this size")
    else:
        print(f"    → Measurements are BETWEEN two sizes")
        print(f"    → Different body proportions could need different sizes")
        print(f"    → Personal preference matters (tight vs loose fit)")

print("\n" + "=" * 70)
print("KEY INSIGHTS")
print("=" * 70)
print("""
1. HIGH CONFIDENCE (90%+): Clear cases where measurements match one size
   → Still not 100% because personal preference matters

2. MODERATE CONFIDENCE (75-89%): Typical measurements for a size
   → Not 100% because body proportions vary

3. LOW CONFIDENCE (<75%): Borderline between two sizes
   → Not 100% because it COULD be either size!

4. WHY THIS IS GOOD:
   ✓ Honest about uncertainty
   ✓ Shows alternative sizes
   ✓ User can choose based on preference
   ✓ Reduces returns (user makes informed choice)

5. HOW TO IMPROVE:
   → Add more training data (500 → 5,000+ samples)
   → Add more features (shoulder width, arm length, etc.)
   → Use deep learning (neural networks)
   → Collect real customer feedback
""")

print("\n" + "=" * 70)
print("REAL WORLD EXAMPLE")
print("=" * 70)
print("""
Scenario: Two women with SAME measurements (Chest 92cm)

Woman A:
- Athletic build (muscle)
- Prefers tight fit
- Broad shoulders
→ Needs Size M

Woman B:
- Curvy build (soft tissue)
- Prefers loose fit
- Narrow shoulders
→ Needs Size L

Same measurements, different needs!
That's why AI shows: "M (82% confident) + L alternative (18%)"
User chooses based on their preference!
""")
