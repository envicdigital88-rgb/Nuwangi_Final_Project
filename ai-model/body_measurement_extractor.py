"""
AI Body Measurement Extractor
Extracts body measurements from a person's photo using Computer Vision
Perfect for campus project - trains in 2-3 hours on CPU
"""

import cv2
import numpy as np
import os
try:
    import mediapipe as mp
    # MediaPipe 0.10+ no longer has mp.solutions — use Tasks API instead
    MEDIAPIPE_AVAILABLE = hasattr(mp, 'tasks') and hasattr(mp.tasks, 'vision')
except:
    MEDIAPIPE_AVAILABLE = False
from sklearn.ensemble import RandomForestRegressor
import pickle
import json


class BodyMeasurementExtractor:
    def __init__(self):
        self.pose = None   # kept for legacy compatibility
        self.mp_pose = None
        self._PoseLandmarker = None
        self._model_asset_path = os.path.join(os.path.dirname(__file__), 'models', 'pose_landmarker.task')

        if MEDIAPIPE_AVAILABLE:
            try:
                self._PoseLandmarker = mp.tasks.vision.PoseLandmarker
                self._PoseLandmarkerOptions = mp.tasks.vision.PoseLandmarkerOptions
                self._BaseOptions = mp.tasks.BaseOptions
                self._RunningMode = mp.tasks.vision.RunningMode
                print("MediaPipe Tasks API ready (PoseLandmarker)")
            except Exception as e:
                print(f"MediaPipe Tasks API init failed: {e}")
                self._PoseLandmarker = None
        else:
            print("MediaPipe not available - using fallback estimation")

        # Load trained measurement model if present
        try:
            with open('models/measurement_model.pkl', 'rb') as f:
                self.model = pickle.load(f)
            print("Loaded trained measurement model")
        except:
            print("No trained model found - will use rule-based estimation")
            self.model = None

    def validate_human_image(self, image_path):
        """
        Validates if an uploaded photo contains a human person.
        Returns (is_human: bool, message: str).
        """
        image = cv2.imread(image_path)
        if image is None:
            return False, "Invalid or unreadable image file."
            
        h, w, _ = image.shape
        if h < 50 or w < 50:
            return False, "Image resolution is too low."

        # 1. Check with MediaPipe Pose Landmarker if available
        landmarks, _, _ = self._detect_pose(image_path)
        if landmarks is not None:
            return True, "Human pose detected successfully."

        # 2. Check with OpenCV HOG People Detector
        try:
            hog = cv2.HOGDescriptor()
            hog.setSVMDetector(cv2.HOGDescriptor_getDefaultPeopleDetector())
            boxes, _ = hog.detectMultiScale(image, winStride=(8, 8), padding=(4, 4), scale=1.05)
            if len(boxes) > 0:
                return True, "Human figure detected via OpenCV HOG detector."
        except Exception:
            pass

        # 3. HSV & YCrCb Skin Tone Color Analysis
        try:
            hsv = cv2.cvtColor(image, cv2.COLOR_BGR2HSV)
            lower_skin1 = np.array([0, 20, 70], dtype=np.uint8)
            upper_skin1 = np.array([25, 255, 255], dtype=np.uint8)
            lower_skin2 = np.array([170, 20, 70], dtype=np.uint8)
            upper_skin2 = np.array([180, 255, 255], dtype=np.uint8)

            mask1 = cv2.inRange(hsv, lower_skin1, upper_skin1)
            mask2 = cv2.inRange(hsv, lower_skin2, upper_skin2)
            skin_mask = cv2.bitwise_or(mask1, mask2)
            skin_perc = (cv2.countNonZero(skin_mask) / (h * w)) * 100

            if skin_perc >= 12.0:
                return True, f"Human skin features detected ({skin_perc:.1f}%)."
        except Exception:
            pass

        return False, "No human detected in the image. Please upload a clear photo of a person."


    def _detect_pose(self, image_path):
        """Run PoseLandmarker on an image. Returns (landmarks, w, h) or (None, 0, 0)."""
        if self._PoseLandmarker is None or not os.path.exists(self._model_asset_path):
            return None, 0, 0
        try:
            options = self._PoseLandmarkerOptions(
                base_options=self._BaseOptions(model_asset_path=self._model_asset_path),
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
            print(f"PoseLandmarker failed: {e}")
            return None, 0, 0

    
    def extract_measurements_from_photo(self, image_path, height_cm=None):
        """
        Extract body measurements from a photo

        Args:
            image_path: Path to person's photo
            height_cm: Optional - person's actual height for calibration

        Returns:
            dict: Body measurements (chest, waist, hips, shoulders)
        """
        # Validate that uploaded photo is human
        is_human, human_msg = self.validate_human_image(image_path)
        if not is_human:
            raise ValueError(human_msg)

        landmarks, w, h = self._detect_pose(image_path)


        if landmarks is None:
            # No pose detected — use rule-based fallback
            return self._fallback_measurements(height_cm)

        # Scale factor: pixels -> cm using height calibration
        left_shoulder = landmarks[11]
        right_shoulder = landmarks[12]
        left_hip = landmarks[23]
        right_hip = landmarks[24]
        nose = landmarks[0]
        left_ankle = landmarks[27]

        def dist_px(a, b):
            return np.sqrt(((a.x - b.x) * w) ** 2 + ((a.y - b.y) * h) ** 2)

        shoulder_width_px = dist_px(left_shoulder, right_shoulder)
        hip_width_px = dist_px(left_hip, right_hip)
        body_height_px = dist_px(nose, left_ankle)

        if height_cm is None:
            height_cm = 165

        scale_factor = height_cm / body_height_px if body_height_px > 0 else 1

        measurements = {
            'height_cm': height_cm,
            'shoulder_width_cm': round(shoulder_width_px * scale_factor, 1),
            'chest_cm': round(shoulder_width_px * scale_factor * 2.2, 1),
            'waist_cm': round(hip_width_px * scale_factor * 1.8, 1),
            'hip_cm': round(hip_width_px * scale_factor * 2.0, 1),
            'confidence': 0.85,
            'landmarks_detected': len(landmarks)
        }

        # Use ML model if available for better accuracy
        if self.model is not None:
            try:
                from train_measurement_model import MeasurementModelTrainer
                trainer = MeasurementModelTrainer.__new__(MeasurementModelTrainer)
                features = trainer._extract_features_from_task_landmarks(landmarks, w, h)
                features.append(0)  # gender placeholder
                ml_measurements = self.model.predict([features])[0]
                measurements.update({
                    'chest_cm': round(float(ml_measurements[0]), 1),
                    'waist_cm': round(float(ml_measurements[1]), 1),
                    'hip_cm': round(float(ml_measurements[2]), 1),
                    'confidence': 0.92
                })
            except Exception as e:
                print(f"ML model prediction failed: {e}")

        return measurements

    
    def _distance(self, point1, point2, width, height):
        """Calculate Euclidean distance between two landmarks"""
        x1, y1 = point1.x * width, point1.y * height
        x2, y2 = point2.x * width, point2.y * height
        return np.sqrt((x2 - x1)**2 + (y2 - y1)**2)
    
    def _fallback_measurements(self, height_cm=None):
        """Fallback measurements when MediaPipe is not available"""
        if height_cm is None:
            height_cm = 165  # Default average
        
        # Return average measurements based on height
        return {
            'height_cm': height_cm,
            'shoulder_width_cm': round(height_cm * 0.25, 1),
            'chest_cm': round(height_cm * 0.53, 1),
            'waist_cm': round(height_cm * 0.44, 1),
            'hip_cm': round(height_cm * 0.57, 1),
            'confidence': 0.70,
            'method': 'fallback',
            'note': 'MediaPipe not available - using estimated measurements'
        }
    
    def _extract_features(self, landmarks, width, height):
        """Extract feature vector for ML model"""
        # Extract key measurements as features
        features = []
        key_points = [
            (self.mp_pose.PoseLandmark.LEFT_SHOULDER, self.mp_pose.PoseLandmark.RIGHT_SHOULDER),
            (self.mp_pose.PoseLandmark.LEFT_HIP, self.mp_pose.PoseLandmark.RIGHT_HIP),
            (self.mp_pose.PoseLandmark.LEFT_SHOULDER, self.mp_pose.PoseLandmark.LEFT_HIP),
        ]
        
        for p1, p2 in key_points:
            dist = self._distance(landmarks[p1], landmarks[p2], width, height)
            features.append(dist)
        
        return features
    
    def train_model(self, training_data_path):
        """
        Train the measurement prediction model
        
        Args:
            training_data_path: Path to JSON file with training data
            Format: [{"image": "path", "measurements": {"chest": 90, "waist": 75, "hip": 95}}]
        """
        print("Training measurement extraction model...")
        
        with open(training_data_path, 'r') as f:
            training_data = json.load(f)
        
        X = []  # Features
        y = []  # Target measurements
        
        for data in training_data:
            try:
                image = cv2.imread(data['image'])
                image_rgb = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
                results = self.pose.process(image_rgb)
                
                if results.pose_landmarks:
                    h, w, _ = image.shape
                    features = self._extract_features(results.pose_landmarks.landmark, w, h)
                    X.append(features)
                    
                    measurements = data['measurements']
                    y.append([measurements['chest'], measurements['waist'], measurements['hip']])
            except Exception as e:
                print(f"Skipping {data['image']}: {e}")
        
        # Train Random Forest model
        self.model = RandomForestRegressor(n_estimators=100, random_state=42)
        self.model.fit(X, y)
        
        # Save model
        import os
        os.makedirs('models', exist_ok=True)
        with open('models/measurement_model.pkl', 'wb') as f:
            pickle.dump(self.model, f)
        
        print(f"✓ Model trained on {len(X)} samples and saved!")


# Example usage
if __name__ == "__main__":
    extractor = BodyMeasurementExtractor()
    
    # Test with a sample image
    try:
        measurements = extractor.extract_measurements_from_photo(
            "sample_person.jpg",
            height_cm=170
        )
        print("\n=== Extracted Measurements ===")
        print(json.dumps(measurements, indent=2))
    except Exception as e:
        print(f"Error: {e}")
