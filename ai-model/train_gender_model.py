"""
Gender Detection Model Training System
Train your own AI model to detect gender from body photos
"""

import cv2
import numpy as np
import json
import pickle
import os
from datetime import datetime
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score, classification_report, confusion_matrix
try:
    import mediapipe as mp
    MEDIAPIPE_AVAILABLE = True
except:
    MEDIAPIPE_AVAILABLE = False
    print("⚠ MediaPipe not available")


class GenderDetectionTrainer:
    def __init__(self):
        """Initialize the gender detection training system"""
        if MEDIAPIPE_AVAILABLE:
            try:
                self.mp_pose = mp.solutions.pose
                self.pose = self.mp_pose.Pose(
                    static_image_mode=True,
                    model_complexity=2,
                    enable_segmentation=False,
                    min_detection_confidence=0.5
                )
                print("✓ MediaPipe initialized for gender detection")
            except Exception as e:
                print(f"⚠ MediaPipe initialization failed: {e}")
                self.mp_pose = None
                self.pose = None
        else:
            self.mp_pose = None
            self.pose = None
        
        self.training_data = []
        self.model = None
        
    def add_training_sample(self, image_path, gender):
        """
        Add a training sample for gender detection
        
        Args:
            image_path: Path to person's photo
            gender: 'male' or 'female'
        """
        if not self.pose:
            print("✗ MediaPipe not available - cannot process image")
            return False
        
        try:
            # Read and process image
            image = cv2.imread(image_path)
            if image is None:
                print(f"✗ Could not read image: {image_path}")
                return False
            
            image_rgb = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
            results = self.pose.process(image_rgb)
            
            if not results.pose_landmarks:
                print(f"✗ Could not detect person in: {image_path}")
                return False
            
            # Extract features for gender detection
            h, w, _ = image.shape
            landmarks = results.pose_landmarks.landmark
            features = self._extract_gender_features(landmarks, w, h)
            
            # Store training sample
            sample = {
                'image_path': image_path,
                'features': features,
                'gender': gender,
                'gender_label': 1 if gender.lower() == 'male' else 0  # 1=male, 0=female
            }
            
            self.training_data.append(sample)
            print(f"✓ Added sample: {os.path.basename(image_path)} ({gender})")
            return True
            
        except Exception as e:
            print(f"✗ Error processing {image_path}: {e}")
            return False
    
    def _extract_gender_features(self, landmarks, width, height):
        """Extract features specifically for gender detection"""
        features = []
        
        # Key landmark indices
        LEFT_SHOULDER = 11
        RIGHT_SHOULDER = 12
        LEFT_HIP = 23
        RIGHT_HIP = 24
        LEFT_ELBOW = 13
        RIGHT_ELBOW = 14
        LEFT_WRIST = 15
        RIGHT_WRIST = 16
        NOSE = 0
        LEFT_ANKLE = 27
        RIGHT_ANKLE = 28
        
        # 1. Shoulder width
        shoulder_width = self._distance(
            landmarks[LEFT_SHOULDER], 
            landmarks[RIGHT_SHOULDER], 
            width, height
        )
        features.append(shoulder_width)
        
        # 2. Hip width
        hip_width = self._distance(
            landmarks[LEFT_HIP], 
            landmarks[RIGHT_HIP], 
            width, height
        )
        features.append(hip_width)
        
        # 3. Shoulder-to-hip ratio (KEY FEATURE for gender)
        sh_ratio = shoulder_width / hip_width if hip_width > 0 else 1.0
        features.append(sh_ratio)
        
        # 4. Torso length
        torso_length = self._distance(
            landmarks[LEFT_SHOULDER], 
            landmarks[LEFT_HIP], 
            width, height
        )
        features.append(torso_length)
        
        # 5. Body height
        body_height = self._distance(
            landmarks[NOSE], 
            landmarks[LEFT_ANKLE], 
            width, height
        )
        features.append(body_height)
        
        # 6. Torso-to-height ratio
        th_ratio = torso_length / body_height if body_height > 0 else 0.5
        features.append(th_ratio)
        
        # 7. Shoulder-to-torso ratio
        st_ratio = shoulder_width / torso_length if torso_length > 0 else 1.0
        features.append(st_ratio)
        
        # 8. Hip-to-torso ratio
        ht_ratio = hip_width / torso_length if torso_length > 0 else 1.0
        features.append(ht_ratio)
        
        # 9. Upper body width (shoulder to elbow)
        upper_width = (
            self._distance(landmarks[LEFT_SHOULDER], landmarks[LEFT_ELBOW], width, height) +
            self._distance(landmarks[RIGHT_SHOULDER], landmarks[RIGHT_ELBOW], width, height)
        ) / 2
        features.append(upper_width)
        
        # 10. Lower body width indicator
        lower_width = hip_width
        features.append(lower_width)
        
        return features
    
    def _distance(self, point1, point2, width, height):
        """Calculate Euclidean distance between two landmarks"""
        x1, y1 = point1.x * width, point1.y * height
        x2, y2 = point2.x * width, point2.y * height
        return np.sqrt((x2 - x1)**2 + (y2 - y1)**2)
    
    def train_model(self, test_size=0.2):
        """
        Train the gender detection model
        
        Args:
            test_size: Fraction of data to use for testing (default 0.2 = 20%)
        """
        if len(self.training_data) < 10:
            print(f"✗ Need at least 10 samples to train (have {len(self.training_data)})")
            return False
        
        print(f"\n{'='*60}")
        print(f"🎓 Training Gender Detection Model")
        print(f"{'='*60}")
        print(f"Training samples: {len(self.training_data)}")
        
        # Count male/female samples
        male_count = sum(1 for s in self.training_data if s['gender'].lower() == 'male')
        female_count = sum(1 for s in self.training_data if s['gender'].lower() == 'female')
        print(f"Male samples: {male_count}")
        print(f"Female samples: {female_count}")
        
        # Prepare data
        X = []  # Features
        y = []  # Labels (1=male, 0=female)
        
        for sample in self.training_data:
            X.append(sample['features'])
            y.append(sample['gender_label'])
        
        X = np.array(X)
        y = np.array(y)
        
        # Split data
        X_train, X_test, y_train, y_test = train_test_split(
            X, y, test_size=test_size, random_state=42, stratify=y
        )
        
        print(f"Training set: {len(X_train)} samples")
        print(f"Test set: {len(X_test)} samples")
        print(f"Features per sample: {X.shape[1]}")
        
        # Train Random Forest Classifier
        print("\n🔧 Training Random Forest Classifier...")
        self.model = RandomForestClassifier(
            n_estimators=100,
            max_depth=10,
            min_samples_split=5,
            random_state=42,
            n_jobs=-1
        )
        
        import time
        start_time = time.time()
        self.model.fit(X_train, y_train)
        duration = time.time() - start_time
        
        # Evaluate model
        print(f"\n{'='*60}")
        print("📊 Model Performance")
        print(f"{'='*60}")
        
        # Training accuracy
        train_pred = self.model.predict(X_train)
        train_accuracy = accuracy_score(y_train, train_pred)
        print(f"Training Accuracy: {train_accuracy*100:.2f}%")
        
        # Test accuracy
        test_pred = self.model.predict(X_test)
        test_accuracy = accuracy_score(y_test, test_pred)
        print(f"Test Accuracy: {test_accuracy*100:.2f}%")
        
        # Confusion matrix
        cm = confusion_matrix(y_test, test_pred)
        print(f"\nConfusion Matrix:")
        print(f"                Predicted")
        print(f"              Female  Male")
        print(f"Actual Female   {cm[0][0]:3d}    {cm[0][1]:3d}")
        print(f"       Male     {cm[1][0]:3d}    {cm[1][1]:3d}")
        
        # Classification report
        print(f"\nDetailed Report:")
        report = classification_report(
            y_test, test_pred,
            target_names=['Female', 'Male'],
            output_dict=True
        )
        
        print(f"Female - Precision: {report['Female']['precision']*100:.1f}%, Recall: {report['Female']['recall']*100:.1f}%")
        print(f"Male   - Precision: {report['Male']['precision']*100:.1f}%, Recall: {report['Male']['recall']*100:.1f}%")
        
        # Feature importance
        print(f"\n{'='*60}")
        print("🔍 Feature Importance")
        print(f"{'='*60}")
        feature_names = [
            'Shoulder Width',
            'Hip Width',
            'Shoulder-Hip Ratio',
            'Torso Length',
            'Body Height',
            'Torso-Height Ratio',
            'Shoulder-Torso Ratio',
            'Hip-Torso Ratio',
            'Upper Body Width',
            'Lower Body Width'
        ]
        
        importances = self.model.feature_importances_
        for name, importance in sorted(zip(feature_names, importances), key=lambda x: x[1], reverse=True):
            print(f"{name:25s}: {importance*100:5.1f}%")
        
        print(f"\n{'='*60}")
        print(f"✓ Training Complete!")
        print(f"  Duration: {duration:.2f} seconds")
        print(f"  Accuracy: {test_accuracy*100:.1f}%")
        print(f"{'='*60}")
        
        return True
    
    def predict_gender(self, image_path):
        """
        Predict gender from a photo using trained model
        
        Args:
            image_path: Path to person's photo
            
        Returns:
            dict: {'gender': 'male'/'female', 'confidence': 0.0-1.0}
        """
        if not self.model:
            return {'gender': 'unknown', 'confidence': 0.0, 'error': 'Model not trained'}
        
        if not self.pose:
            return {'gender': 'unknown', 'confidence': 0.0, 'error': 'MediaPipe not available'}
        
        try:
            # Read and process image
            image = cv2.imread(image_path)
            if image is None:
                return {'gender': 'unknown', 'confidence': 0.0, 'error': 'Could not read image'}
            
            image_rgb = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
            results = self.pose.process(image_rgb)
            
            if not results.pose_landmarks:
                return {'gender': 'unknown', 'confidence': 0.0, 'error': 'Could not detect person'}
            
            # Extract features
            h, w, _ = image.shape
            landmarks = results.pose_landmarks.landmark
            features = self._extract_gender_features(landmarks, w, h)
            
            # Predict
            prediction = self.model.predict([features])[0]
            probabilities = self.model.predict_proba([features])[0]
            
            gender = 'male' if prediction == 1 else 'female'
            confidence = probabilities[prediction]
            
            return {
                'gender': gender,
                'confidence': float(confidence),
                'probabilities': {
                    'female': float(probabilities[0]),
                    'male': float(probabilities[1])
                }
            }
            
        except Exception as e:
            return {'gender': 'unknown', 'confidence': 0.0, 'error': str(e)}
    
    def save_model(self, filename='models/gender_detection_model.pkl'):
        """Save trained model to file"""
        if not self.model:
            print("✗ No model to save - train first")
            return False
        
        os.makedirs('models', exist_ok=True)
        
        model_data = {
            'model': self.model,
            'training_samples': len(self.training_data),
            'male_samples': sum(1 for s in self.training_data if s['gender'].lower() == 'male'),
            'female_samples': sum(1 for s in self.training_data if s['gender'].lower() == 'female'),
            'trained_date': datetime.now().isoformat(),
            'version': '1.0.0'
        }
        
        with open(filename, 'wb') as f:
            pickle.dump(model_data, f)
        
        print(f"\n✓ Gender detection model saved to: {filename}")
        return True
    
    def load_model(self, filename='models/gender_detection_model.pkl'):
        """Load trained model from file"""
        try:
            with open(filename, 'rb') as f:
                model_data = pickle.load(f)
            
            self.model = model_data['model']
            print(f"✓ Loaded gender detection model")
            print(f"  Training samples: {model_data['training_samples']}")
            print(f"  Trained: {model_data['trained_date']}")
            return True
        except Exception as e:
            print(f"✗ Could not load model: {e}")
            return False


# Example usage
if __name__ == "__main__":
    print("""
╔══════════════════════════════════════════════════════════════╗
║         Gender Detection Model Training System               ║
╚══════════════════════════════════════════════════════════════╝
    """)
    
    trainer = GenderDetectionTrainer()
    
    print("\n📝 Example: How to train gender detection model")
    print("="*60)
    print("""
# Add training samples
trainer.add_training_sample('photos/male1.jpg', 'male')
trainer.add_training_sample('photos/female1.jpg', 'female')
trainer.add_training_sample('photos/male2.jpg', 'male')
trainer.add_training_sample('photos/female2.jpg', 'female')
# ... add more samples (minimum 10, recommended 50+)

# Train the model
trainer.train_model()

# Save model
trainer.save_model()

# Use model to predict
result = trainer.predict_gender('new_photo.jpg')
print(f"Gender: {result['gender']}, Confidence: {result['confidence']*100:.1f}%")
    """)
    
    print("\n💡 Next Steps:")
    print("1. Collect photos with known genders")
    print("2. Use the training UI to add samples")
    print("3. Train your custom gender detection model")
    print("4. Use it to auto-detect gender in new photos")
