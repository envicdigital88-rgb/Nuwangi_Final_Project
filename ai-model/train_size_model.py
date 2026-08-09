"""
Train Size Recommendation Model
Trains the AI model with your data - perfect for campus project demo!
"""

import json
import numpy as np
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
from sklearn.metrics import accuracy_score, classification_report, confusion_matrix
import pickle
import os
import time
from datetime import datetime

def load_training_data(filename='training_data_size.json'):
    """Load training data from JSON file"""
    try:
        with open(filename, 'r') as f:
            data = json.load(f)
        print(f"✓ Loaded {len(data)} training samples from {filename}")
        return data
    except FileNotFoundError:
        print(f"❌ Error: {filename} not found!")
        print("Run 'python generate_training_data.py' first to create training data")
        return None


def prepare_data(training_data):
    """Prepare data for training"""
    X = []  # Features (measurements)
    y = []  # Labels (sizes)
    
    size_labels = ['XS', 'S', 'M', 'L', 'XL', 'XXL']
    
    for sample in training_data:
        measurements = sample['measurements']
        
        # Extract features
        features = [
            measurements['chest_cm'],
            measurements['waist_cm'],
            measurements['hip_cm'],
            measurements['height_cm']
        ]
        X.append(features)
        
        # Convert size to numeric label
        size = sample['actual_size']
        if size in size_labels:
            y.append(size_labels.index(size))
        else:
            print(f"Warning: Unknown size '{size}', skipping sample")
    
    return np.array(X), np.array(y), size_labels


def train_model(X, y, size_labels):
    """Train the Random Forest model"""
    print("\n" + "=" * 60)
    print("Training Size Recommendation Model")
    print("=" * 60)
    
    # Start timing
    start_time = time.time()
    
    # Split data into training and testing sets
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42
    )
    
    print(f"\nTraining samples: {len(X_train)}")
    print(f"Testing samples: {len(X_test)}")
    
    # Scale features
    scaler = StandardScaler()
    X_train_scaled = scaler.fit_transform(X_train)
    X_test_scaled = scaler.transform(X_test)
    
    # Train Random Forest model
    print("\nTraining Random Forest Classifier...")
    model = RandomForestClassifier(
        n_estimators=100,      # Number of trees
        max_depth=10,          # Maximum depth of trees
        min_samples_split=5,   # Minimum samples to split
        random_state=42
    )
    
    model.fit(X_train_scaled, y_train)
    print("✓ Training complete!")
    
    # Evaluate model
    print("\n" + "=" * 60)
    print("Model Evaluation")
    print("=" * 60)
    
    # Training accuracy
    train_predictions = model.predict(X_train_scaled)
    train_accuracy = accuracy_score(y_train, train_predictions)
    print(f"\nTraining Accuracy: {train_accuracy * 100:.2f}%")
    
    # Testing accuracy
    test_predictions = model.predict(X_test_scaled)
    test_accuracy = accuracy_score(y_test, test_predictions)
    print(f"Testing Accuracy: {test_accuracy * 100:.2f}%")
    
    # Detailed classification report
    print("\nDetailed Classification Report:")
    print(classification_report(
        y_test, test_predictions,
        target_names=[size_labels[i] for i in sorted(set(y_test))],
        zero_division=0
    ))
    
    # Confusion matrix
    print("\nConfusion Matrix:")
    cm = confusion_matrix(y_test, test_predictions)
    print("Predicted →")
    print("Actual ↓")
    
    # Print confusion matrix with labels
    unique_labels = sorted(set(y_test))
    header = "     " + "  ".join([f"{size_labels[i]:>4}" for i in unique_labels])
    print(header)
    for i, row in enumerate(cm):
        label = size_labels[unique_labels[i]]
        print(f"{label:>4} {row}")
    
    # Feature importance
    print("\nFeature Importance:")
    feature_names = ['Chest', 'Waist', 'Hip', 'Height']
    importances = model.feature_importances_
    for name, importance in zip(feature_names, importances):
        print(f"  {name}: {importance * 100:.1f}%")
    
    # Calculate training duration
    duration = time.time() - start_time
    
    # Save training history
    save_training_history(len(X_train), train_accuracy, test_accuracy, duration)
    
    return model, scaler, test_accuracy


def save_model(model, scaler, size_labels, accuracy):
    """Save trained model to file"""
    os.makedirs('models', exist_ok=True)
    
    model_data = {
        'model': model,
        'scaler': scaler,
        'size_labels': size_labels,
        'accuracy': accuracy,
        'trained_date': datetime.now().strftime('%Y-%m-%d %H:%M:%S'),
        'algorithm': 'Random Forest Classifier',
        'n_estimators': model.n_estimators,
        'max_depth': model.max_depth
    }
    
    filename = 'models/size_recommender.pkl'
    with open(filename, 'wb') as f:
        pickle.dump(model_data, f)
    
    print(f"\n✓ Model saved to {filename}")
    print(f"✓ Model accuracy: {accuracy * 100:.2f}%")


def save_training_history(training_samples, training_accuracy, testing_accuracy, duration):
    """Save training session to history log"""
    history_file = 'training_history.json'
    
    # Load existing history
    if os.path.exists(history_file):
        with open(history_file, 'r') as f:
            history = json.load(f)
    else:
        history = []
    
    # Create new record
    record = {
        'session': len(history) + 1,
        'timestamp': datetime.now().strftime('%Y-%m-%d %H:%M:%S'),
        'training_samples': training_samples,
        'training_accuracy': round(training_accuracy * 100, 2),
        'testing_accuracy': round(testing_accuracy * 100, 2),
        'duration': round(duration, 2)
    }
    
    # Add to history
    history.append(record)
    
    # Save
    with open(history_file, 'w') as f:
        json.dump(history, f, indent=2)
    
    print(f"✓ Training session logged to {history_file}")


def test_model(model, scaler, size_labels):
    """Test model with sample predictions"""
    print("\n" + "=" * 60)
    print("Testing Model with Sample Predictions")
    print("=" * 60)
    
    test_cases = [
        {'chest_cm': 88, 'waist_cm': 72, 'hip_cm': 95, 'height_cm': 165, 'expected': 'M'},
        {'chest_cm': 82, 'waist_cm': 66, 'hip_cm': 90, 'height_cm': 160, 'expected': 'S'},
        {'chest_cm': 98, 'waist_cm': 82, 'hip_cm': 105, 'height_cm': 175, 'expected': 'L'},
    ]
    
    for i, test_case in enumerate(test_cases, 1):
        features = np.array([[
            test_case['chest_cm'],
            test_case['waist_cm'],
            test_case['hip_cm'],
            test_case['height_cm']
        ]])
        
        features_scaled = scaler.transform(features)
        prediction = model.predict(features_scaled)[0]
        probabilities = model.predict_proba(features_scaled)[0]
        
        predicted_size = size_labels[prediction]
        confidence = probabilities[prediction] * 100
        
        print(f"\nTest Case {i}:")
        print(f"  Measurements: Chest={test_case['chest_cm']}cm, Waist={test_case['waist_cm']}cm, "
              f"Hip={test_case['hip_cm']}cm, Height={test_case['height_cm']}cm")
        print(f"  Expected: {test_case['expected']}")
        print(f"  Predicted: {predicted_size} (Confidence: {confidence:.1f}%)")
        print(f"  Result: {'✓ CORRECT' if predicted_size == test_case['expected'] else '✗ INCORRECT'}")


if __name__ == "__main__":
    print("\n" + "=" * 60)
    print("🤖 AI Model Training - Size Recommendation")
    print("=" * 60)
    print()
    
    # Load training data
    training_data = load_training_data()
    if training_data is None:
        exit(1)
    
    # Prepare data
    print("\nPreparing data...")
    X, y, size_labels = prepare_data(training_data)
    print(f"✓ Prepared {len(X)} samples with {X.shape[1]} features")
    print(f"✓ Size labels: {', '.join(size_labels)}")
    
    # Train model
    model, scaler, accuracy = train_model(X, y, size_labels)
    
    # Save model
    save_model(model, scaler, size_labels, accuracy)
    
    # Test model
    test_model(model, scaler, size_labels)
    
    print("\n" + "=" * 60)
    print("✅ Training Complete!")
    print("=" * 60)
    print("\nYour AI model is now trained and ready to use!")
    print("\nNext steps:")
    print("1. Start AI service: python ai_service.py")
    print("2. Test predictions: python test_trained_model.py")
    print("3. Use in your app - it will automatically load the trained model")
    print("\nFor your campus project presentation:")
    print(f"- Model accuracy: {accuracy * 100:.2f}%")
    print(f"- Training samples: {len(X)}")
    print("- Algorithm: Random Forest Classifier")
    print("- Features: Chest, Waist, Hip, Height measurements")
    print()
