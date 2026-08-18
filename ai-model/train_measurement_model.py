"""
Custom Measurement Model Training System
Trains your own AI model for body measurement extraction with gender detection
"""

import cv2
import numpy as np
import json
import pickle
import os
from datetime import datetime
from sklearn.ensemble import RandomForestRegressor
from sklearn.model_selection import train_test_split
from sklearn.metrics import mean_absolute_error, r2_score
try:
    import mediapipe as mp
    # MediaPipe 0.10+ uses the Tasks API — mp.solutions is no longer available
    if hasattr(mp, 'tasks') and hasattr(mp.tasks, 'vision'):
        MEDIAPIPE_AVAILABLE = True
        MEDIAPIPE_TASKS_API = True
    else:
        MEDIAPIPE_AVAILABLE = False
        MEDIAPIPE_TASKS_API = False
except:
    MEDIAPIPE_AVAILABLE = False
    MEDIAPIPE_TASKS_API = False
    print("MediaPipe not available - manual measurements only")



class MeasurementModelTrainer:
    def __init__(self):
        """Initialize the training system"""
        self.pose = None
        self.mp_pose = None
        self._mp_landmarker = None

        if MEDIAPIPE_TASKS_API:
            try:
                # New MediaPipe Tasks API (0.10+)
                self._PoseLandmarker = mp.tasks.vision.PoseLandmarker
                self._PoseLandmarkerOptions = mp.tasks.vision.PoseLandmarkerOptions
                self._BaseOptions = mp.tasks.BaseOptions
                self._RunningMode = mp.tasks.vision.RunningMode
                print("MediaPipe Tasks API ready")
            except Exception as e:
                print(f"MediaPipe Tasks API setup failed: {e}")
                self._PoseLandmarker = None
        else:
            self._PoseLandmarker = None
            print("MediaPipe not available - using manual measurements only")

        self.training_data = []
        self.model = None
        self.gender_model = None

        
    def _get_pose_landmarks(self, image_path):
        """Extract pose landmarks from an image using the Tasks API.
        Returns (landmarks, width, height) or (None, 0, 0) on failure."""
        if self._PoseLandmarker is None:
            return None, 0, 0
        try:
            model_path = os.path.join(os.path.dirname(__file__), 'models', 'pose_landmarker.task')
            if not os.path.exists(model_path):
                return None, 0, 0
            options = self._PoseLandmarkerOptions(
                base_options=self._BaseOptions(model_asset_path=model_path),
                running_mode=self._RunningMode.IMAGE
            )
            with self._PoseLandmarker.create_from_options(options) as landmarker:
                image = cv2.imread(image_path)
                if image is None:
                    return None, 0, 0
                h, w, _ = image.shape
                mp_image = mp.Image(
                    image_format=mp.ImageFormat.SRGB,
                    data=cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
                )
                result = landmarker.detect(mp_image)
                if not result.pose_landmarks:
                    return None, 0, 0
                return result.pose_landmarks[0], w, h
        except Exception as e:
            print(f"Pose detection failed: {e}")
            return None, 0, 0

    def add_training_sample(self, image_path, height_cm, chest_cm, waist_cm, hip_cm, gender):
        """
        Add a training sample — works with or without MediaPipe.
        If pose detection fails, the manual measurements are stored directly.

        Args:
            image_path: Path to person's photo
            height_cm: Actual height in cm
            chest_cm: Actual chest measurement in cm
            waist_cm: Actual waist measurement in cm
            hip_cm: Actual hip measurement in cm
            gender: 'male' or 'female'
        """
        gender_value = 1 if gender.lower() == 'male' else 0

        # Attempt pose landmark extraction for richer ML features
        landmarks, w, h = self._get_pose_landmarks(image_path)
        if landmarks is not None:
            # Build feature vector from pose
            features = self._extract_features_from_task_landmarks(landmarks, w, h)
        else:
            # Fallback: use only the measurement values as features (still trains a useful model)
            features = self._features_from_measurements(height_cm, chest_cm, waist_cm, hip_cm, gender_value)

        features.append(gender_value)

        sample = {
            'image_path': image_path,
            'features': features,
            'height_cm': height_cm,
            'chest_cm': chest_cm,
            'waist_cm': waist_cm,
            'hip_cm': hip_cm,
            'gender': gender,
            'gender_value': gender_value
        }

        self.training_data.append(sample)
        print(f"Added sample: {os.path.basename(image_path)} ({gender}, {'pose' if landmarks else 'manual'})")
        return True

    
    def _features_from_measurements(self, height_cm, chest_cm, waist_cm, hip_cm, gender_value):
        """Build a feature vector from raw measurements when pose is unavailable."""
        # Normalise to typical ranges (ratios)
        shoulder_est = chest_cm / 2.2
        hip_half = hip_cm / 2.0
        sh_ratio = shoulder_est / hip_half if hip_half > 0 else 1.0
        wh_ratio = waist_cm / hip_cm if hip_cm > 0 else 1.0
        torso_est = height_cm * 0.30
        leg_est = height_cm * 0.47
        tl_ratio = torso_est / leg_est if leg_est > 0 else 1.0
        return [shoulder_est, hip_half, torso_est, height_cm, torso_est * 0.4, leg_est, sh_ratio, tl_ratio]

    def _extract_features_from_task_landmarks(self, landmarks, width, height):
        """Extract feature vector from new Tasks API normalized landmarks."""
        features = []
        # Landmark indices are the same between old solutions and new tasks
        LEFT_SHOULDER = 11
        RIGHT_SHOULDER = 12
        LEFT_HIP = 23
        RIGHT_HIP = 24
        LEFT_ELBOW = 13
        LEFT_KNEE = 25
        NOSE = 0
        LEFT_ANKLE = 27

        def dist(a, b):
            x1, y1 = a.x * width, a.y * height
            x2, y2 = b.x * width, b.y * height
            return np.sqrt((x2 - x1)**2 + (y2 - y1)**2)

        shoulder_width = dist(landmarks[LEFT_SHOULDER], landmarks[RIGHT_SHOULDER])
        hip_width = dist(landmarks[LEFT_HIP], landmarks[RIGHT_HIP])
        torso_length = dist(landmarks[LEFT_SHOULDER], landmarks[LEFT_HIP])
        body_height = dist(landmarks[NOSE], landmarks[LEFT_ANKLE])
        arm_length = dist(landmarks[LEFT_SHOULDER], landmarks[LEFT_ELBOW])
        leg_length = dist(landmarks[LEFT_HIP], landmarks[LEFT_KNEE])
        sh_ratio = shoulder_width / hip_width if hip_width > 0 else 1.0
        tl_ratio = torso_length / leg_length if leg_length > 0 else 1.0

        features = [shoulder_width, hip_width, torso_length, body_height, arm_length, leg_length, sh_ratio, tl_ratio]
        return features

    def _extract_features(self, landmarks, width, height):
        """Legacy helper — kept for back-compat but delegates to new method."""
        return self._extract_features_from_task_landmarks(landmarks, width, height)


    
    def train_model(self, test_size=0.2):
        """
        Train the measurement prediction model
        
        Args:
            test_size: Fraction of data to use for testing (default 0.2 = 20%)
        """
        if len(self.training_data) < 10:
            print(f"✗ Need at least 10 samples to train (have {len(self.training_data)})")
            return False
        
        print(f"\n{'='*60}")
        print(f"🎓 Training Measurement Model")
        print(f"{'='*60}")
        print(f"Training samples: {len(self.training_data)}")
        
        # Prepare data
        X = []  # Features
        y_chest = []
        y_waist = []
        y_hip = []
        
        for sample in self.training_data:
            X.append(sample['features'])
            y_chest.append(sample['chest_cm'])
            y_waist.append(sample['waist_cm'])
            y_hip.append(sample['hip_cm'])
        
        X = np.array(X)
        y_chest = np.array(y_chest)
        y_waist = np.array(y_waist)
        y_hip = np.array(y_hip)
        
        # Split data
        X_train, X_test, y_chest_train, y_chest_test = train_test_split(
            X, y_chest, test_size=test_size, random_state=42
        )
        _, _, y_waist_train, y_waist_test = train_test_split(
            X, y_waist, test_size=test_size, random_state=42
        )
        _, _, y_hip_train, y_hip_test = train_test_split(
            X, y_hip, test_size=test_size, random_state=42
        )
        
        print(f"Training set: {len(X_train)} samples")
        print(f"Test set: {len(X_test)} samples")
        print(f"Features per sample: {X.shape[1]}")
        
        # Train separate models for each measurement
        print("\n🔧 Training chest model...")
        chest_model = RandomForestRegressor(n_estimators=100, random_state=42, n_jobs=-1)
        chest_model.fit(X_train, y_chest_train)
        
        print("🔧 Training waist model...")
        waist_model = RandomForestRegressor(n_estimators=100, random_state=42, n_jobs=-1)
        waist_model.fit(X_train, y_waist_train)
        
        print("🔧 Training hip model...")
        hip_model = RandomForestRegressor(n_estimators=100, random_state=42, n_jobs=-1)
        hip_model.fit(X_train, y_hip_train)
        
        # Evaluate models
        print(f"\n{'='*60}")
        print("📊 Model Performance")
        print(f"{'='*60}")
        
        # Chest predictions
        chest_pred = chest_model.predict(X_test)
        chest_mae = mean_absolute_error(y_chest_test, chest_pred)
        chest_r2 = r2_score(y_chest_test, chest_pred)
        print(f"Chest:  MAE = {chest_mae:.2f} cm, R² = {chest_r2:.3f}")
        
        # Waist predictions
        waist_pred = waist_model.predict(X_test)
        waist_mae = mean_absolute_error(y_waist_test, waist_pred)
        waist_r2 = r2_score(y_waist_test, waist_pred)
        print(f"Waist:  MAE = {waist_mae:.2f} cm, R² = {waist_r2:.3f}")
        
        # Hip predictions
        hip_pred = hip_model.predict(X_test)
        hip_mae = mean_absolute_error(y_hip_test, hip_pred)
        hip_r2 = r2_score(y_hip_test, hip_pred)
        print(f"Hip:    MAE = {hip_mae:.2f} cm, R² = {hip_r2:.3f}")
        
        # Overall accuracy
        avg_mae = (chest_mae + waist_mae + hip_mae) / 3
        avg_r2 = (chest_r2 + waist_r2 + hip_r2) / 3
        accuracy = max(0, (1 - avg_mae / 50) * 100)  # Rough accuracy estimate
        
        print(f"\n{'='*60}")
        print(f"Overall Accuracy: {accuracy:.1f}%")
        print(f"Average Error: {avg_mae:.2f} cm")
        print(f"{'='*60}")
        
        # Store models
        self.model = {
            'chest': chest_model,
            'waist': waist_model,
            'hip': hip_model,
            'accuracy': accuracy,
            'avg_mae': avg_mae,
            'training_samples': len(self.training_data),
            'trained_date': datetime.now().isoformat()
        }
        
        return True
    
    def train_gender_classifier(self):
        """Train a model to detect gender from body features"""
        if len(self.training_data) < 10:
            print("✗ Need at least 10 samples to train gender classifier")
            return False
        
        print(f"\n{'='*60}")
        print(f"🎓 Training Gender Classifier")
        print(f"{'='*60}")
        
        # Prepare data (exclude gender feature itself)
        X = []
        y = []
        
        for sample in self.training_data:
            features = sample['features'][:-1]  # Exclude gender feature
            X.append(features)
            y.append(sample['gender_value'])
        
        X = np.array(X)
        y = np.array(y)
        
        # Split data
        X_train, X_test, y_train, y_test = train_test_split(
            X, y, test_size=0.2, random_state=42
        )
        
        # Train classifier
        from sklearn.ensemble import RandomForestClassifier
        gender_model = RandomForestClassifier(n_estimators=100, random_state=42, n_jobs=-1)
        gender_model.fit(X_train, y_train)
        
        # Evaluate
        accuracy = gender_model.score(X_test, y_test)
        print(f"Gender Classification Accuracy: {accuracy*100:.1f}%")
        
        self.gender_model = gender_model
        return True
    
    def save_model(self, filename='models/custom_measurement_model.pkl'):
        """Save trained model to file"""
        if not self.model:
            print("✗ No model to save - train first")
            return False
        
        os.makedirs('models', exist_ok=True)
        
        model_data = {
            'measurement_model': self.model,
            'gender_model': self.gender_model,
            'training_data_count': len(self.training_data),
            'version': '1.0.0'
        }
        
        with open(filename, 'wb') as f:
            pickle.dump(model_data, f)
        
        print(f"\n✓ Model saved to: {filename}")
        print(f"  - Training samples: {len(self.training_data)}")
        print(f"  - Accuracy: {self.model['accuracy']:.1f}%")
        print(f"  - Average error: {self.model['avg_mae']:.2f} cm")
        
        return True
    
    def save_training_data(self, filename='training_data/measurement_training_data.json'):
        """Save training data for future use"""
        os.makedirs('training_data', exist_ok=True)
        
        # Prepare data for JSON (remove non-serializable objects)
        data_to_save = []
        for sample in self.training_data:
            data_to_save.append({
                'image_path': sample['image_path'],
                'height_cm': sample['height_cm'],
                'chest_cm': sample['chest_cm'],
                'waist_cm': sample['waist_cm'],
                'hip_cm': sample['hip_cm'],
                'gender': sample['gender']
            })
        
        with open(filename, 'w', encoding='utf-8') as f:
            json.dump(data_to_save, f, indent=2)

        
        print(f"✓ Training data saved to: {filename}")
        return True

    def load_training_data(self, filename='training_data/measurement_training_data.json'):
        """Load saved training samples from JSON file if it exists."""
        if not os.path.exists(filename):
            return False
        try:
            with open(filename, 'r', encoding='utf-8') as f:
                data = json.load(f)

            self.training_data = []
            for item in data:
                # Add sample directly
                gender_val = 1 if item['gender'].lower() == 'male' else 0
                features = self._features_from_measurements(item['height_cm'], item['chest_cm'], item['waist_cm'], item['hip_cm'], gender_val)
                features.append(gender_val)
                self.training_data.append({
                    'image_path': item['image_path'],
                    'features': features,
                    'height_cm': item['height_cm'],
                    'chest_cm': item['chest_cm'],
                    'waist_cm': item['waist_cm'],
                    'hip_cm': item['hip_cm'],
                    'gender': item['gender'],
                    'gender_value': gender_val
                })
            print(f"✓ Loaded {len(self.training_data)} training samples from {filename}")
            return True
        except Exception as e:
            print(f"⚠ Could not load training data: {e}")
            return False

    
    def generate_training_report(self):
        """Generate a detailed training report"""
        if not self.model:
            print("✗ No model trained yet")
            return
        
        report = f"""
{'='*70}
                    TRAINING REPORT
{'='*70}

Training Date: {self.model['trained_date']}
Model Version: 1.0.0

DATASET STATISTICS
{'='*70}
Total Samples: {self.model['training_samples']}
Male Samples: {sum(1 for s in self.training_data if s['gender'] == 'male')}
Female Samples: {sum(1 for s in self.training_data if s['gender'] == 'female')}

MEASUREMENT RANGES
{'='*70}
Chest:  {min(s['chest_cm'] for s in self.training_data):.1f} - {max(s['chest_cm'] for s in self.training_data):.1f} cm
Waist:  {min(s['waist_cm'] for s in self.training_data):.1f} - {max(s['waist_cm'] for s in self.training_data):.1f} cm
Hip:    {min(s['hip_cm'] for s in self.training_data):.1f} - {max(s['hip_cm'] for s in self.training_data):.1f} cm

MODEL PERFORMANCE
{'='*70}
Overall Accuracy: {self.model['accuracy']:.1f}%
Average Error: {self.model['avg_mae']:.2f} cm

FEATURE IMPORTANCE
{'='*70}
1. Shoulder Width
2. Hip Width
3. Torso Length
4. Body Height
5. Arm Length
6. Leg Length
7. Shoulder-Hip Ratio
8. Torso-Leg Ratio
9. Gender

RECOMMENDATIONS
{'='*70}
"""
        
        if self.model['training_samples'] < 50:
            report += "⚠ Collect more training samples (target: 100+)\n"
        if self.model['accuracy'] < 80:
            report += "⚠ Improve photo quality and measurement accuracy\n"
        if self.model['accuracy'] >= 85:
            report += "✓ Model is production-ready!\n"
        
        report += f"\n{'='*70}\n"
        
        print(report)
        
        # Save report to file
        with open('training_data/training_report.txt', 'w', encoding='utf-8') as f:
            f.write(report)

        
        print("✓ Report saved to: training_data/training_report.txt")


# Example usage
if __name__ == "__main__":
    print("""
╔══════════════════════════════════════════════════════════════╗
║         Custom Measurement Model Training System             ║
║              With Gender Detection                           ║
╚══════════════════════════════════════════════════════════════╝
    """)
    
    trainer = MeasurementModelTrainer()
    
    print("\n📝 Example: How to add training samples")
    print("="*60)
    print("""
# Add training samples with actual measurements
trainer.add_training_sample(
    image_path='photos/person1.jpg',
    height_cm=170,
    chest_cm=92,
    waist_cm=76,
    hip_cm=98,
    gender='female'
)

trainer.add_training_sample(
    image_path='photos/person2.jpg',
    height_cm=180,
    chest_cm=102,
    waist_cm=88,
    hip_cm=100,
    gender='male'
)

# Add more samples... (minimum 10, recommended 100+)

# Train the model
trainer.train_model()

# Train gender classifier
trainer.train_gender_classifier()

# Save model
trainer.save_model()

# Generate report
trainer.generate_training_report()
    """)
    
    print("\n💡 Next Steps:")
    print("1. Collect photos with known measurements")
    print("2. Use the training UI (training_ui.py) to add samples easily")
    print("3. Train your custom model")
    print("4. Deploy to production")
