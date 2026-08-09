"""
AI Size Recommendation System
Recommends perfect clothing size based on body measurements
Trains in 30 minutes - perfect for campus project
"""

import numpy as np
from sklearn.ensemble import RandomForestClassifier
from sklearn.preprocessing import StandardScaler
import pickle
import json

class SizeRecommender:
    def __init__(self):
        self.model = None
        self.scaler = StandardScaler()
        self.size_labels = ['XS', 'S', 'M', 'L', 'XL', 'XXL']
        
        # Load trained model if exists
        try:
            with open('models/size_recommender.pkl', 'rb') as f:
                data = pickle.load(f)
                self.model = data['model']
                self.scaler = data['scaler']
            print("✓ Loaded trained size recommender")
        except:
            print("⚠ No trained model - will use rule-based system")
    
    def recommend_size(self, measurements, gender='female', clothing_type='shirt'):
        """
        Recommend clothing size based on body measurements
        
        Args:
            measurements: dict with chest_cm, waist_cm, hip_cm, height_cm
            gender: 'male' or 'female'
            clothing_type: 'shirt', 'pants', 'dress', etc.
            
        Returns:
            dict: Recommended size, confidence, and alternatives
        """
        chest = measurements.get('chest_cm', 88)
        waist = measurements.get('waist_cm', 72)
        hip = measurements.get('hip_cm', 95)
        height = measurements.get('height_cm', 165)
        
        # Use ML model if available
        if self.model is not None:
            features = np.array([[chest, waist, hip, height]])
            features_scaled = self.scaler.transform(features)
            
            size_idx = self.model.predict(features_scaled)[0]
            probabilities = self.model.predict_proba(features_scaled)[0]
            
            recommended_size = self.size_labels[size_idx]
            confidence = probabilities[size_idx]
            
            # Get alternative sizes
            alternatives = []
            for i, prob in enumerate(probabilities):
                if i != size_idx and prob > 0.15:
                    alternatives.append({
                        'size': self.size_labels[i],
                        'probability': round(prob * 100, 1)
                    })
        else:
            # Rule-based recommendation
            recommended_size, confidence = self._rule_based_recommendation(
                chest, waist, hip, gender, clothing_type
            )
            alternatives = self._get_alternative_sizes(recommended_size)
        
        return {
            'recommended_size': recommended_size,
            'confidence': round(confidence * 100, 1),
            'alternatives': alternatives,
            'fit_notes': self._generate_fit_notes(measurements, recommended_size, clothing_type)
        }
    
    def _rule_based_recommendation(self, chest, waist, hip, gender, clothing_type):
        """Rule-based size recommendation (no training needed)"""
        if gender.lower() == 'female':
            if clothing_type == 'shirt':
                if chest < 82: return 'XS', 0.85
                elif chest < 88: return 'S', 0.90
                elif chest < 94: return 'M', 0.90
                elif chest < 100: return 'L', 0.90
                elif chest < 108: return 'XL', 0.85
                else: return 'XXL', 0.80
            elif clothing_type == 'pants':
                if waist < 65: return 'XS', 0.85
                elif waist < 70: return 'S', 0.90
                elif waist < 76: return 'M', 0.90
                elif waist < 82: return 'L', 0.90
                elif waist < 90: return 'XL', 0.85
                else: return 'XXL', 0.80
        else:  # male
            if clothing_type == 'shirt':
                if chest < 90: return 'S', 0.85
                elif chest < 98: return 'M', 0.90
                elif chest < 106: return 'L', 0.90
                elif chest < 114: return 'XL', 0.85
                else: return 'XXL', 0.80
            elif clothing_type == 'pants':
                if waist < 76: return 'S', 0.85
                elif waist < 84: return 'M', 0.90
                elif waist < 92: return 'L', 0.90
                elif waist < 100: return 'XL', 0.85
                else: return 'XXL', 0.80
        
        return 'M', 0.75  # Default
    
    def _get_alternative_sizes(self, recommended_size):
        """Get alternative sizes near the recommended one"""
        idx = self.size_labels.index(recommended_size)
        alternatives = []
        
        if idx > 0:
            alternatives.append({
                'size': self.size_labels[idx - 1],
                'probability': 25.0,
                'note': 'For a tighter fit'
            })
        if idx < len(self.size_labels) - 1:
            alternatives.append({
                'size': self.size_labels[idx + 1],
                'probability': 20.0,
                'note': 'For a looser fit'
            })
        
        return alternatives
    
    def _generate_fit_notes(self, measurements, size, clothing_type):
        """Generate personalized fit notes"""
        notes = []
        
        chest = measurements.get('chest_cm', 88)
        waist = measurements.get('waist_cm', 72)
        
        if clothing_type == 'shirt':
            if chest > 100:
                notes.append("Consider relaxed fit for comfort")
            notes.append(f"Size {size} should fit comfortably around chest")
        elif clothing_type == 'pants':
            if waist < 70:
                notes.append("Consider a belt for better fit")
            notes.append(f"Size {size} recommended for your waist measurement")
        
        return notes
    
    def train_model(self, training_data_path):
        """
        Train the size recommendation model
        
        Args:
            training_data_path: Path to JSON training data
            Format: [{"measurements": {...}, "actual_size": "M", "gender": "female"}]
        """
        print("Training size recommendation model...")
        
        with open(training_data_path, 'r') as f:
            training_data = json.load(f)
        
        X = []
        y = []
        
        for data in training_data:
            m = data['measurements']
            X.append([m['chest_cm'], m['waist_cm'], m['hip_cm'], m['height_cm']])
            y.append(self.size_labels.index(data['actual_size']))
        
        X = np.array(X)
        y = np.array(y)
        
        # Scale features
        X_scaled = self.scaler.fit_transform(X)
        
        # Train model
        self.model = RandomForestClassifier(n_estimators=100, random_state=42)
        self.model.fit(X_scaled, y)
        
        # Save model
        import os
        os.makedirs('models', exist_ok=True)
        with open('models/size_recommender.pkl', 'wb') as f:
            pickle.dump({'model': self.model, 'scaler': self.scaler}, f)
        
        print(f"✓ Model trained on {len(X)} samples!")


# Example usage
if __name__ == "__main__":
    recommender = SizeRecommender()
    
    # Test recommendation
    measurements = {
        'chest_cm': 92,
        'waist_cm': 76,
        'hip_cm': 98,
        'height_cm': 170
    }
    
    result = recommender.recommend_size(measurements, gender='female', clothing_type='shirt')
    print("\n=== Size Recommendation ===")
    print(json.dumps(result, indent=2))
