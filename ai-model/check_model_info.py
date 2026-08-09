"""
Check Trained Model Information
Shows metadata and details about the trained model - perfect for proving you trained it!
"""

import pickle
import os
import json
from datetime import datetime

def check_model_info():
    """Display detailed information about the trained model"""
    
    print("\n" + "=" * 60)
    print("📊 Trained Model Information")
    print("=" * 60)
    
    model_path = 'models/size_recommender.pkl'
    
    # Check if model exists
    if not os.path.exists(model_path):
        print("\n❌ No trained model found!")
        print("Please train the model first: python train_size_model.py")
        return
    
    # Get file information
    file_stats = os.stat(model_path)
    file_size_mb = file_stats.st_size / (1024 * 1024)
    created_time = datetime.fromtimestamp(file_stats.st_ctime)
    modified_time = datetime.fromtimestamp(file_stats.st_mtime)
    
    print(f"\n📁 Model File: {model_path}")
    print(f"📦 File Size: {file_size_mb:.2f} MB")
    print(f"📅 Created: {created_time.strftime('%Y-%m-%d %H:%M:%S')}")
    print(f"🔄 Last Modified: {modified_time.strftime('%Y-%m-%d %H:%M:%S')}")
    
    # Load model
    try:
        with open(model_path, 'rb') as f:
            model_data = pickle.load(f)
        
        model = model_data['model']
        scaler = model_data['scaler']
        size_labels = model_data['size_labels']
        accuracy = model_data.get('accuracy', 'N/A')
        
        print("\n" + "=" * 60)
        print("🤖 Model Details")
        print("=" * 60)
        
        print(f"\n  Algorithm: Random Forest Classifier")
        print(f"  Number of Trees: {model.n_estimators}")
        print(f"  Max Depth: {model.max_depth if model.max_depth else 'Unlimited'}")
        print(f"  Min Samples Split: {model.min_samples_split}")
        print(f"  Min Samples Leaf: {model.min_samples_leaf}")
        
        if accuracy != 'N/A':
            print(f"\n  Testing Accuracy: {accuracy * 100:.2f}%")
        
        print(f"\n  Size Classes: {', '.join(size_labels)}")
        print(f"  Number of Classes: {len(size_labels)}")
        
        # Feature importance
        feature_names = ['Chest', 'Waist', 'Hip', 'Height']
        importances = model.feature_importances_
        
        print("\n" + "=" * 60)
        print("📈 Feature Importance")
        print("=" * 60)
        
        for name, importance in sorted(zip(feature_names, importances), 
                                      key=lambda x: x[1], reverse=True):
            bar = '█' * int(importance * 50)
            print(f"  {name:8s}: {bar} {importance * 100:.1f}%")
        
        # Check training data
        if os.path.exists('training_data_size.json'):
            with open('training_data_size.json', 'r') as f:
                training_data = json.load(f)
            
            print("\n" + "=" * 60)
            print("📊 Training Data Information")
            print("=" * 60)
            
            print(f"\n  Total Samples: {len(training_data)}")
            
            # Count by gender
            genders = {}
            sizes = {}
            for sample in training_data:
                gender = sample.get('gender', 'unknown')
                size = sample.get('actual_size', 'unknown')
                genders[gender] = genders.get(gender, 0) + 1
                sizes[size] = sizes.get(size, 0) + 1
            
            print(f"\n  Gender Distribution:")
            for gender, count in genders.items():
                print(f"    {gender.capitalize()}: {count} ({count/len(training_data)*100:.1f}%)")
            
            print(f"\n  Size Distribution:")
            for size in size_labels:
                count = sizes.get(size, 0)
                if count > 0:
                    bar = '█' * int(count / len(training_data) * 50)
                    print(f"    {size:4s}: {bar} {count} ({count/len(training_data)*100:.1f}%)")
        
        print("\n" + "=" * 60)
        print("✅ Model is Ready to Use!")
        print("=" * 60)
        
        print("\nYou can:")
        print("  1. Test predictions: python test_trained_model.py")
        print("  2. Start AI service: python ai_service.py")
        print("  3. Retrain model: python train_size_model.py")
        print()
        
    except Exception as e:
        print(f"\n❌ Error loading model: {e}")
        print("The model file might be corrupted. Please retrain.")


if __name__ == "__main__":
    check_model_info()
