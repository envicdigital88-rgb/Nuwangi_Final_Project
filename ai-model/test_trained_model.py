"""
Test Trained AI Model
Quick test to verify your trained model works correctly
"""

import pickle
import numpy as np
import json

def load_trained_model():
    """Load the trained model"""
    try:
        with open('models/size_recommender.pkl', 'rb') as f:
            data = pickle.load(f)
        print("✓ Loaded trained model successfully!")
        print(f"✓ Model accuracy: {data.get('accuracy', 0) * 100:.2f}%")
        return data['model'], data['scaler'], data['size_labels']
    except FileNotFoundError:
        print("❌ No trained model found!")
        print("Run 'python train_size_model.py' first to train the model")
        return None, None, None


def test_predictions(model, scaler, size_labels):
    """Test model with various measurements"""
    print("\n" + "=" * 60)
    print("Testing Trained Model with Sample Predictions")
    print("=" * 60)
    
    test_cases = [
        {
            'name': 'Small Female',
            'measurements': {'chest_cm': 82, 'waist_cm': 66, 'hip_cm': 90, 'height_cm': 160},
            'expected': 'S'
        },
        {
            'name': 'Medium Female',
            'measurements': {'chest_cm': 88, 'waist_cm': 72, 'hip_cm': 95, 'height_cm': 165},
            'expected': 'M'
        },
        {
            'name': 'Large Female',
            'measurements': {'chest_cm': 98, 'waist_cm': 82, 'hip_cm': 105, 'height_cm': 170},
            'expected': 'L'
        },
        {
            'name': 'Medium Male',
            'measurements': {'chest_cm': 96, 'waist_cm': 82, 'hip_cm': 98, 'height_cm': 175},
            'expected': 'M'
        },
        {
            'name': 'Large Male',
            'measurements': {'chest_cm': 106, 'waist_cm': 92, 'hip_cm': 106, 'height_cm': 180},
            'expected': 'L'
        }
    ]
    
    correct = 0
    total = len(test_cases)
    
    for i, test in enumerate(test_cases, 1):
        m = test['measurements']
        features = np.array([[m['chest_cm'], m['waist_cm'], m['hip_cm'], m['height_cm']]])
        features_scaled = scaler.transform(features)
        
        prediction = model.predict(features_scaled)[0]
        probabilities = model.predict_proba(features_scaled)[0]
        
        predicted_size = size_labels[prediction]
        confidence = probabilities[prediction] * 100
        
        is_correct = predicted_size == test['expected']
        if is_correct:
            correct += 1
        
        print(f"\nTest {i}: {test['name']}")
        print(f"  Measurements: Chest={m['chest_cm']}cm, Waist={m['waist_cm']}cm, "
              f"Hip={m['hip_cm']}cm, Height={m['height_cm']}cm")
        print(f"  Expected: {test['expected']}")
        print(f"  Predicted: {predicted_size} (Confidence: {confidence:.1f}%)")
        print(f"  Result: {'✓ CORRECT' if is_correct else '✗ INCORRECT'}")
        
        # Show top 3 predictions
        top_3_indices = np.argsort(probabilities)[-3:][::-1]
        print(f"  Top 3 predictions:")
        for idx in top_3_indices:
            print(f"    - {size_labels[idx]}: {probabilities[idx] * 100:.1f}%")
    
    print("\n" + "=" * 60)
    print(f"Test Results: {correct}/{total} correct ({correct/total * 100:.1f}%)")
    print("=" * 60)


def interactive_test(model, scaler, size_labels):
    """Interactive testing - enter your own measurements"""
    print("\n" + "=" * 60)
    print("Interactive Testing - Enter Your Measurements")
    print("=" * 60)
    print("\nEnter measurements (or press Enter to skip):")
    
    try:
        chest = input("Chest (cm) [default: 88]: ").strip()
        chest = float(chest) if chest else 88.0
        
        waist = input("Waist (cm) [default: 72]: ").strip()
        waist = float(waist) if waist else 72.0
        
        hip = input("Hip (cm) [default: 95]: ").strip()
        hip = float(hip) if hip else 95.0
        
        height = input("Height (cm) [default: 165]: ").strip()
        height = float(height) if height else 165.0
        
        # Make prediction
        features = np.array([[chest, waist, hip, height]])
        features_scaled = scaler.transform(features)
        
        prediction = model.predict(features_scaled)[0]
        probabilities = model.predict_proba(features_scaled)[0]
        
        predicted_size = size_labels[prediction]
        confidence = probabilities[prediction] * 100
        
        print("\n" + "=" * 60)
        print("Prediction Result")
        print("=" * 60)
        print(f"\nYour measurements:")
        print(f"  Chest: {chest}cm")
        print(f"  Waist: {waist}cm")
        print(f"  Hip: {hip}cm")
        print(f"  Height: {height}cm")
        print(f"\nRecommended Size: {predicted_size}")
        print(f"Confidence: {confidence:.1f}%")
        
        print(f"\nAll size probabilities:")
        for i, size in enumerate(size_labels):
            prob = probabilities[i] * 100
            bar = '█' * int(prob / 5)
            print(f"  {size:>3}: {bar} {prob:.1f}%")
        
        # Alternative sizes
        print(f"\nAlternative sizes:")
        sorted_indices = np.argsort(probabilities)[::-1]
        for idx in sorted_indices[1:3]:
            if probabilities[idx] > 0.15:
                print(f"  - {size_labels[idx]}: {probabilities[idx] * 100:.1f}% "
                      f"({'tighter fit' if idx < prediction else 'looser fit'})")
        
    except ValueError:
        print("Invalid input. Please enter numbers only.")
    except KeyboardInterrupt:
        print("\nTest cancelled.")


if __name__ == "__main__":
    print("\n" + "=" * 60)
    print("🤖 Testing Trained AI Model")
    print("=" * 60)
    
    # Load model
    model, scaler, size_labels = load_trained_model()
    
    if model is None:
        exit(1)
    
    # Run automated tests
    test_predictions(model, scaler, size_labels)
    
    # Interactive test
    print("\n")
    response = input("Would you like to test with your own measurements? (y/n): ").strip().lower()
    if response == 'y':
        interactive_test(model, scaler, size_labels)
    
    print("\n" + "=" * 60)
    print("✅ Testing Complete!")
    print("=" * 60)
    print("\nYour trained model is working correctly!")
    print("\nNext steps:")
    print("1. Start AI service: python ai_service.py")
    print("2. The service will automatically use your trained model")
    print("3. Test via API: python test_ai_service.py")
    print()
