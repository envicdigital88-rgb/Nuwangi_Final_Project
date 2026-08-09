"""
AI Model Training Web UI
A beautiful web interface to train your AI model - perfect for demos!
"""

from flask import Flask, render_template, jsonify, request, send_file
from flask_cors import CORS
import json
import os
import time
import threading
from datetime import datetime
import numpy as np
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
from sklearn.metrics import accuracy_score, classification_report, confusion_matrix
import pickle
from train_measurement_model import MeasurementModelTrainer
from train_gender_model import GenderDetectionTrainer

app = Flask(__name__)
CORS(app)

# Initialize measurement model trainer
try:
    measurement_trainer = MeasurementModelTrainer()
    print("✓ Measurement trainer initialized")
except Exception as e:
    print(f"⚠ Measurement trainer initialization warning: {e}")
    print("⚠ Measurement training features may be limited")
    measurement_trainer = None

# Initialize gender detection trainer
try:
    gender_trainer = GenderDetectionTrainer()
    # Try to load existing gender model
    if os.path.exists('models/gender_detection_model.pkl'):
        gender_trainer.load_model()
        print("✓ Gender detection model loaded")
    else:
        print("✓ Gender trainer initialized (no model yet)")
except Exception as e:
    print(f"⚠ Gender trainer initialization warning: {e}")
    gender_trainer = None

# Global variable to track training progress
training_status = {
    'is_training': False,
    'progress': 0,
    'stage': 'idle',
    'message': 'Ready to train',
    'results': None
}

# Measurement training status
measurement_training_status = {
    'is_training': False,
    'progress': 0,
    'stage': 'idle',
    'message': 'Ready to train measurement model',
    'results': None
}

# Load existing measurement training data if available
MEASUREMENT_TRAINING_FILE = 'training_data/measurement_samples.json'
if measurement_trainer and os.path.exists(MEASUREMENT_TRAINING_FILE):
    try:
        with open(MEASUREMENT_TRAINING_FILE, 'r') as f:
            existing_data = json.load(f)
            print(f"✓ Loaded {len(existing_data)} existing measurement training samples")
            for sample in existing_data:
                measurement_trainer.add_training_sample(
                    sample['image_path'],
                    sample['height_cm'],
                    sample['chest_cm'],
                    sample['waist_cm'],
                    sample['hip_cm'],
                    sample['gender']
                )
    except Exception as e:
        print(f"⚠ Could not load existing measurement data: {e}")


@app.route('/')
def index():
    """Serve the training UI"""
    return render_template('training_ui.html')


@app.route('/api/status')
def get_status():
    """Get current training status"""
    return jsonify(training_status)


@app.route('/api/model-info')
def get_model_info():
    """Get information about the current trained model"""
    model_path = 'models/size_recommender.pkl'
    
    if not os.path.exists(model_path):
        return jsonify({'exists': False})
    
    try:
        # Get file info
        file_stats = os.stat(model_path)
        file_size_mb = file_stats.st_size / (1024 * 1024)
        created_time = datetime.fromtimestamp(file_stats.st_ctime)
        modified_time = datetime.fromtimestamp(file_stats.st_mtime)
        
        # Load model
        with open(model_path, 'rb') as f:
            model_data = pickle.load(f)
        
        model = model_data['model']
        accuracy = model_data.get('accuracy', 0)
        
        # Get training data info
        training_samples = 0
        if os.path.exists('training_data_size.json'):
            with open('training_data_size.json', 'r') as f:
                training_data = json.load(f)
                training_samples = len(training_data)
        
        return jsonify({
            'exists': True,
            'file_size_mb': round(file_size_mb, 2),
            'created': created_time.strftime('%Y-%m-%d %H:%M:%S'),
            'modified': modified_time.strftime('%Y-%m-%d %H:%M:%S'),
            'accuracy': round(accuracy * 100, 2),
            'n_estimators': model.n_estimators,
            'max_depth': model.max_depth,
            'training_samples': training_samples,
            'feature_importance': {
                'Chest': round(model.feature_importances_[0] * 100, 1),
                'Waist': round(model.feature_importances_[1] * 100, 1),
                'Hip': round(model.feature_importances_[2] * 100, 1),
                'Height': round(model.feature_importances_[3] * 100, 1)
            }
        })
    except Exception as e:
        return jsonify({'exists': True, 'error': str(e)})


@app.route('/api/training-history')
def get_training_history():
    """Get training history"""
    history_file = 'training_history.json'
    
    if not os.path.exists(history_file):
        return jsonify({'history': []})
    
    try:
        with open(history_file, 'r') as f:
            history = json.load(f)
        return jsonify({'history': history})
    except Exception as e:
        return jsonify({'history': [], 'error': str(e)})


@app.route('/api/training-data')
def get_training_data():
    """Get current training data"""
    if not os.path.exists('training_data_size.json'):
        return jsonify({'samples': [], 'count': 0})
    
    try:
        with open('training_data_size.json', 'r') as f:
            data = json.load(f)
        return jsonify({'samples': data, 'count': len(data)})  # Return all samples
    except Exception as e:
        return jsonify({'samples': [], 'count': 0, 'error': str(e)})


@app.route('/api/upload-dataset', methods=['POST'])
def upload_dataset():
    """Upload dataset from CSV or JSON file"""
    try:
        if 'file' not in request.files:
            return jsonify({'error': 'No file provided'}), 400
        
        file = request.files['file']
        if file.filename == '':
            return jsonify({'error': 'No file selected'}), 400
        
        # Read file content
        content = file.read().decode('utf-8')
        
        # Load existing data
        if os.path.exists('training_data_size.json'):
            with open('training_data_size.json', 'r') as f:
                training_data = json.load(f)
        else:
            training_data = []
        
        added_count = 0
        added_samples = []
        
        # Parse based on file type
        if file.filename.endswith('.json'):
            # JSON format
            new_data = json.loads(content)
            if isinstance(new_data, list):
                for item in new_data:
                    if validate_sample(item):
                        training_data.append(item)
                        added_samples.append(item)
                        added_count += 1
            else:
                return jsonify({'error': 'JSON must be an array of samples'}), 400
                
        elif file.filename.endswith('.csv'):
            # CSV format
            import csv
            import io
            
            csv_file = io.StringIO(content)
            reader = csv.DictReader(csv_file)
            
            for row in reader:
                try:
                    sample = {
                        'measurements': {
                            'chest_cm': float(row.get('chest', row.get('chest_cm', 0))),
                            'waist_cm': float(row.get('waist', row.get('waist_cm', 0))),
                            'hip_cm': float(row.get('hip', row.get('hip_cm', 0))),
                            'height_cm': float(row.get('height', row.get('height_cm', 0)))
                        },
                        'actual_size': row.get('size', row.get('actual_size', '')),
                        'gender': row.get('gender', ''),
                        'clothing_type': row.get('clothing_type', 'shirt')
                    }
                    
                    if validate_sample(sample):
                        training_data.append(sample)
                        added_samples.append(sample)
                        added_count += 1
                except Exception as e:
                    continue  # Skip invalid rows
        else:
            return jsonify({'error': 'Unsupported file format. Use .json or .csv'}), 400
        
        # Save updated data
        with open('training_data_size.json', 'w') as f:
            json.dump(training_data, f, indent=2)
        
        return jsonify({
            'message': f'Successfully uploaded {added_count} samples',
            'total_samples': len(training_data),
            'added_count': added_count,
            'preview_samples': added_samples[:5]  # Return first 5 for preview
        })
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500


def validate_sample(sample):
    """Validate a training sample"""
    try:
        if 'measurements' not in sample:
            return False
        
        measurements = sample['measurements']
        required_measurements = ['chest_cm', 'waist_cm', 'hip_cm', 'height_cm']
        
        for measure in required_measurements:
            if measure not in measurements or measurements[measure] <= 0:
                return False
        
        if 'actual_size' not in sample or sample['actual_size'] not in ['XS', 'S', 'M', 'L', 'XL', 'XXL']:
            return False
        
        if 'gender' not in sample or sample['gender'] not in ['female', 'male']:
            return False
        
        return True
    except:
        return False


@app.route('/api/download-template/<format>')
def download_template(format):
    """Download sample template file"""
    if format == 'csv':
        csv_content = """chest,waist,hip,height,size,gender,clothing_type
88.0,72.0,95.0,165.0,M,female,shirt
92.0,76.0,98.0,170.0,M,female,shirt
100.0,86.0,102.0,178.0,L,male,shirt
"""
        return csv_content, 200, {
            'Content-Type': 'text/csv',
            'Content-Disposition': 'attachment; filename=training_data_template.csv'
        }
    
    elif format == 'json':
        json_content = [
            {
                "measurements": {
                    "chest_cm": 88.0,
                    "waist_cm": 72.0,
                    "hip_cm": 95.0,
                    "height_cm": 165.0
                },
                "actual_size": "M",
                "gender": "female",
                "clothing_type": "shirt"
            },
            {
                "measurements": {
                    "chest_cm": 92.0,
                    "waist_cm": 76.0,
                    "hip_cm": 98.0,
                    "height_cm": 170.0
                },
                "actual_size": "M",
                "gender": "female",
                "clothing_type": "shirt"
            }
        ]
        return jsonify(json_content), 200, {
            'Content-Disposition': 'attachment; filename=training_data_template.json'
        }
    
    return jsonify({'error': 'Invalid format'}), 400


@app.route('/api/add-sample', methods=['POST'])
def add_sample():
    """Add a single training sample"""
    try:
        sample = request.json
        
        # Validate sample
        required_fields = ['chest_cm', 'waist_cm', 'hip_cm', 'height_cm', 'actual_size', 'gender']
        for field in required_fields:
            if field not in sample:
                return jsonify({'error': f'Missing field: {field}'}), 400
        
        # Load existing data
        if os.path.exists('training_data_size.json'):
            with open('training_data_size.json', 'r') as f:
                training_data = json.load(f)
        else:
            training_data = []
        
        # Add new sample
        new_sample = {
            'measurements': {
                'chest_cm': float(sample['chest_cm']),
                'waist_cm': float(sample['waist_cm']),
                'hip_cm': float(sample['hip_cm']),
                'height_cm': float(sample['height_cm'])
            },
            'actual_size': sample['actual_size'],
            'gender': sample['gender'],
            'clothing_type': sample.get('clothing_type', 'shirt')
        }
        
        training_data.append(new_sample)
        
        # Save
        with open('training_data_size.json', 'w') as f:
            json.dump(training_data, f, indent=2)
        
        return jsonify({'message': 'Sample added successfully', 'total_samples': len(training_data)})
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/api/clear-data', methods=['POST'])
def clear_data():
    """Clear all training data"""
    try:
        if os.path.exists('training_data_size.json'):
            os.remove('training_data_size.json')
        return jsonify({'message': 'Training data cleared'})
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/api/train', methods=['POST'])
def start_training():
    """Start model training"""
    global training_status
    
    if training_status['is_training']:
        return jsonify({'error': 'Training already in progress'}), 400
    
    # Get parameters
    params = request.json
    num_samples = params.get('num_samples', 2000)
    n_estimators = params.get('n_estimators', 100)
    max_depth = params.get('max_depth', 10)
    use_existing_data = params.get('use_existing_data', False)
    
    # Start training in background thread
    thread = threading.Thread(
        target=train_model_background,
        args=(num_samples, n_estimators, max_depth, use_existing_data)
    )
    thread.start()
    
    return jsonify({'message': 'Training started'})


def train_model_background(num_samples, n_estimators, max_depth, use_existing_data=False):
    """Train model in background"""
    global training_status
    
    try:
        training_status['is_training'] = True
        training_status['progress'] = 0
        training_status['results'] = None
        
        # Stage 1: Generate or load data
        if use_existing_data and os.path.exists('training_data_size.json'):
            training_status['stage'] = 'loading_data'
            training_status['message'] = 'Loading existing training data...'
            training_status['progress'] = 10
            
            with open('training_data_size.json', 'r') as f:
                training_data = json.load(f)
            
            training_status['message'] = f'Loaded {len(training_data)} existing samples'
        else:
            training_status['stage'] = 'generating_data'
            training_status['message'] = f'Generating {num_samples} training samples...'
            training_status['progress'] = 10
            
            training_data = generate_training_data(num_samples)
            
            with open('training_data_size.json', 'w') as f:
                json.dump(training_data, f, indent=2)
        
        time.sleep(0.5)  # Let UI update
        
        # Stage 2: Prepare data
        training_status['stage'] = 'preparing_data'
        training_status['message'] = 'Preparing features and labels...'
        training_status['progress'] = 30
        
        X, y, size_labels = prepare_data(training_data)
        
        time.sleep(0.5)
        
        # Stage 3: Split data
        training_status['stage'] = 'splitting_data'
        training_status['message'] = 'Splitting into train/test sets...'
        training_status['progress'] = 40
        
        X_train, X_test, y_train, y_test = train_test_split(
            X, y, test_size=0.2, random_state=42
        )
        
        # Stage 4: Scale features
        training_status['stage'] = 'scaling_features'
        training_status['message'] = 'Scaling features...'
        training_status['progress'] = 50
        
        scaler = StandardScaler()
        X_train_scaled = scaler.fit_transform(X_train)
        X_test_scaled = scaler.transform(X_test)
        
        time.sleep(0.5)
        
        # Stage 5: Train model
        training_status['stage'] = 'training_model'
        training_status['message'] = f'Training Random Forest ({n_estimators} trees)...'
        training_status['progress'] = 60
        
        start_time = time.time()
        
        model = RandomForestClassifier(
            n_estimators=n_estimators,
            max_depth=max_depth if max_depth > 0 else None,
            min_samples_split=5,
            random_state=42
        )
        
        model.fit(X_train_scaled, y_train)
        
        duration = time.time() - start_time
        
        # Stage 6: Evaluate
        training_status['stage'] = 'evaluating'
        training_status['message'] = 'Evaluating model performance...'
        training_status['progress'] = 80
        
        train_predictions = model.predict(X_train_scaled)
        train_accuracy = accuracy_score(y_train, train_predictions)
        
        test_predictions = model.predict(X_test_scaled)
        test_accuracy = accuracy_score(y_test, test_predictions)
        
        # Get confusion matrix
        cm = confusion_matrix(y_test, test_predictions)
        
        # Get classification report
        report = classification_report(
            y_test, test_predictions,
            target_names=[size_labels[i] for i in sorted(set(y_test))],
            output_dict=True,
            zero_division=0
        )
        
        time.sleep(0.5)
        
        # Stage 7: Save model
        training_status['stage'] = 'saving_model'
        training_status['message'] = 'Saving trained model...'
        training_status['progress'] = 90
        
        os.makedirs('models', exist_ok=True)
        
        model_data = {
            'model': model,
            'scaler': scaler,
            'size_labels': size_labels,
            'accuracy': test_accuracy,
            'trained_date': datetime.now().strftime('%Y-%m-%d %H:%M:%S'),
            'algorithm': 'Random Forest Classifier',
            'n_estimators': n_estimators,
            'max_depth': max_depth
        }
        
        with open('models/size_recommender.pkl', 'wb') as f:
            pickle.dump(model_data, f)
        
        # Save training history
        save_training_history(len(X_train), train_accuracy, test_accuracy, duration)
        
        # Prepare results
        results = {
            'training_samples': len(X_train),
            'testing_samples': len(X_test),
            'train_accuracy': round(train_accuracy * 100, 2),
            'test_accuracy': round(test_accuracy * 100, 2),
            'duration': round(duration, 2),
            'confusion_matrix': cm.tolist(),
            'classification_report': report,
            'feature_importance': {
                'Chest': round(model.feature_importances_[0] * 100, 1),
                'Waist': round(model.feature_importances_[1] * 100, 1),
                'Hip': round(model.feature_importances_[2] * 100, 1),
                'Height': round(model.feature_importances_[3] * 100, 1)
            },
            'size_labels': size_labels
        }
        
        # Complete
        training_status['stage'] = 'complete'
        training_status['message'] = f'Training complete! Accuracy: {test_accuracy*100:.2f}%'
        training_status['progress'] = 100
        training_status['results'] = results
        
    except Exception as e:
        training_status['stage'] = 'error'
        training_status['message'] = f'Error: {str(e)}'
        training_status['progress'] = 0
    
    finally:
        training_status['is_training'] = False


def generate_training_data(num_samples):
    """Generate synthetic training data"""
    training_data = []
    
    female_sizes = {
        'XS': {'chest': (78, 82), 'waist': (60, 64), 'hip': (86, 90), 'height': (155, 165)},
        'S':  {'chest': (82, 88), 'waist': (64, 70), 'hip': (90, 96), 'height': (160, 170)},
        'M':  {'chest': (88, 94), 'waist': (70, 76), 'hip': (96, 102), 'height': (165, 175)},
        'L':  {'chest': (94, 100), 'waist': (76, 82), 'hip': (102, 108), 'height': (165, 175)},
        'XL': {'chest': (100, 108), 'waist': (82, 90), 'hip': (108, 116), 'height': (165, 180)},
        'XXL': {'chest': (108, 116), 'waist': (90, 98), 'hip': (116, 124), 'height': (165, 180)}
    }
    
    male_sizes = {
        'S':  {'chest': (86, 92), 'waist': (72, 78), 'hip': (90, 96), 'height': (165, 175)},
        'M':  {'chest': (92, 100), 'waist': (78, 86), 'hip': (96, 102), 'height': (170, 180)},
        'L':  {'chest': (100, 108), 'waist': (86, 94), 'hip': (102, 108), 'height': (175, 185)},
        'XL': {'chest': (108, 116), 'waist': (94, 102), 'hip': (108, 114), 'height': (175, 190)},
        'XXL': {'chest': (116, 124), 'waist': (102, 110), 'hip': (114, 120), 'height': (175, 195)}
    }
    
    clothing_types = ['shirt', 'pants', 'dress', 'jacket']
    
    for i in range(num_samples):
        gender = np.random.choice(['female', 'male'])
        sizes = female_sizes if gender == 'female' else male_sizes
        size = np.random.choice(list(sizes.keys()))
        size_ranges = sizes[size]
        
        chest = round(np.random.uniform(size_ranges['chest'][0], size_ranges['chest'][1]) + np.random.normal(0, 2), 1)
        waist = round(np.random.uniform(size_ranges['waist'][0], size_ranges['waist'][1]) + np.random.normal(0, 2), 1)
        hip = round(np.random.uniform(size_ranges['hip'][0], size_ranges['hip'][1]) + np.random.normal(0, 2), 1)
        height = round(np.random.uniform(size_ranges['height'][0], size_ranges['height'][1]) + np.random.normal(0, 3), 1)
        
        clothing_type = np.random.choice(clothing_types)
        
        sample = {
            'measurements': {
                'chest_cm': chest,
                'waist_cm': waist,
                'hip_cm': hip,
                'height_cm': height
            },
            'actual_size': size,
            'gender': gender,
            'clothing_type': clothing_type
        }
        
        training_data.append(sample)
    
    return training_data


def prepare_data(training_data):
    """Prepare data for training"""
    X = []
    y = []
    size_labels = ['XS', 'S', 'M', 'L', 'XL', 'XXL']
    
    for sample in training_data:
        measurements = sample['measurements']
        features = [
            measurements['chest_cm'],
            measurements['waist_cm'],
            measurements['hip_cm'],
            measurements['height_cm']
        ]
        X.append(features)
        
        size = sample['actual_size']
        if size in size_labels:
            y.append(size_labels.index(size))
    
    return np.array(X), np.array(y), size_labels


def save_training_history(training_samples, training_accuracy, testing_accuracy, duration):
    """Save training session to history"""
    history_file = 'training_history.json'
    
    if os.path.exists(history_file):
        with open(history_file, 'r') as f:
            history = json.load(f)
    else:
        history = []
    
    record = {
        'session': len(history) + 1,
        'timestamp': datetime.now().strftime('%Y-%m-%d %H:%M:%S'),
        'training_samples': training_samples,
        'training_accuracy': round(training_accuracy * 100, 2),
        'testing_accuracy': round(testing_accuracy * 100, 2),
        'duration': round(duration, 2)
    }
    
    history.append(record)
    
    with open(history_file, 'w') as f:
        json.dump(history, f, indent=2)


# ============================================================================
# MEASUREMENT MODEL TRAINING ENDPOINTS (NEW)
# ============================================================================

@app.route('/api/measurement/extract-from-photo', methods=['POST'])
def extract_from_photo():
    """Extract measurements AND gender from photo automatically using trained models"""
    try:
        if 'photo' not in request.files:
            return jsonify({'success': False, 'error': 'No photo uploaded'}), 400
        
        photo = request.files['photo']
        height_cm = request.form.get('height_cm')
        
        if not height_cm:
            return jsonify({'success': False, 'error': 'Height is required for calibration'}), 400
        
        height_cm = float(height_cm)
        
        # Save photo temporarily
        import tempfile
        with tempfile.NamedTemporaryFile(delete=False, suffix='.jpg') as tmp_file:
            photo.save(tmp_file.name)
            temp_path = tmp_file.name
        
        try:
            # Call AI service to extract measurements
            import requests
            
            with open(temp_path, 'rb') as f:
                files = {'image': f}
                data = {'height_cm': height_cm}
                
                response = requests.post(
                    'http://localhost:5000/api/ai/extract-measurements',
                    files=files,
                    data=data,
                    timeout=30
                )
            
            if response.status_code == 200:
                result = response.json()
                if result.get('success'):
                    measurements = result['measurements']
                    
                    # Try to use TRAINED gender detection model first
                    detected_gender = 'unknown'
                    gender_confidence = 0.5
                    gender_method = 'ratio-based'
                    
                    if gender_trainer and gender_trainer.model:
                        # Use trained gender detection model
                        gender_result = gender_trainer.predict_gender(temp_path)
                        if 'error' not in gender_result:
                            detected_gender = gender_result['gender']
                            gender_confidence = gender_result['confidence']
                            gender_method = 'trained-model'
                            print(f"✓ Using trained gender model: {detected_gender} ({gender_confidence*100:.1f}%)")
                    
                    # Fallback to ratio-based detection if no trained model
                    if detected_gender == 'unknown':
                        chest = measurements['chest_cm']
                        waist = measurements['waist_cm']
                        hip = measurements['hip_cm']
                        shoulder_width = measurements.get('shoulder_width_cm', chest / 2.2)
                        
                        # Calculate ratios for gender detection
                        shoulder_hip_ratio = shoulder_width / (hip / 2.0) if hip > 0 else 1.0
                        waist_hip_ratio = waist / hip if hip > 0 else 1.0
                        
                        # Gender detection logic
                        male_score = 0
                        female_score = 0
                        
                        # Shoulder-hip ratio (males: >0.95, females: <0.85)
                        if shoulder_hip_ratio > 0.95:
                            male_score += 2
                        elif shoulder_hip_ratio < 0.85:
                            female_score += 2
                        else:
                            male_score += 1
                            female_score += 1
                        
                        # Waist-hip ratio (males: >0.85, females: <0.80)
                        if waist_hip_ratio > 0.85:
                            male_score += 1
                        elif waist_hip_ratio < 0.80:
                            female_score += 1
                        
                        # Hip-chest ratio (females typically have larger hips relative to chest)
                        hip_chest_ratio = hip / chest if chest > 0 else 1.0
                        if hip_chest_ratio > 1.05:
                            female_score += 1
                        elif hip_chest_ratio < 0.95:
                            male_score += 1
                        
                        # Determine gender
                        detected_gender = 'male' if male_score > female_score else 'female'
                        gender_confidence = max(male_score, female_score) / (male_score + female_score) if (male_score + female_score) > 0 else 0.5
                        gender_method = 'ratio-based (no trained model)'
                        print(f"⚠ Using ratio-based gender detection: {detected_gender} ({gender_confidence*100:.1f}%)")
                    
                    # Clean up temp file
                    os.remove(temp_path)
                    
                    return jsonify({
                        'success': True,
                        'measurements': {
                            'height_cm': measurements['height_cm'],
                            'chest_cm': measurements['chest_cm'],
                            'waist_cm': measurements['waist_cm'],
                            'hip_cm': measurements['hip_cm'],
                            'confidence': measurements.get('confidence', 0.85)
                        },
                        'gender': {
                            'detected': detected_gender,
                            'confidence': round(gender_confidence, 2),
                            'method': gender_method
                        },
                        'message': f'Measurements extracted! Gender: {detected_gender} ({int(gender_confidence*100)}% confident, {gender_method})'
                    })
                else:
                    os.remove(temp_path)
                    return jsonify({
                        'success': False,
                        'error': result.get('message', 'Failed to extract measurements')
                    }), 400
            else:
                os.remove(temp_path)
                return jsonify({
                    'success': False,
                    'error': 'AI service error'
                }), 500
                
        except Exception as e:
            if os.path.exists(temp_path):
                os.remove(temp_path)
            raise e
            
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500


@app.route('/api/measurement/add-sample', methods=['POST'])
def add_measurement_sample():
    """Add a training sample with photo for measurement model"""
    if not measurement_trainer:
        return jsonify({'success': False, 'error': 'Measurement trainer not available'}), 503
    
    if not gender_trainer:
        return jsonify({'success': False, 'error': 'Gender trainer not available'}), 503
    
    try:
        # Get form data
        if 'photo' not in request.files:
            return jsonify({'success': False, 'error': 'No photo uploaded'}), 400
        
        photo = request.files['photo']
        height_cm = float(request.form.get('height_cm'))
        chest_cm = float(request.form.get('chest_cm'))
        waist_cm = float(request.form.get('waist_cm'))
        hip_cm = float(request.form.get('hip_cm'))
        gender = request.form.get('gender')
        
        # Validate inputs
        if not all([height_cm, chest_cm, waist_cm, hip_cm, gender]):
            return jsonify({'success': False, 'error': 'Missing required fields'}), 400
        
        # Create directory
        os.makedirs('training_photos', exist_ok=True)
        
        # Save photo
        timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
        filename = f"{gender}_{timestamp}_{photo.filename}"
        filepath = os.path.join('training_photos', filename)
        photo.save(filepath)
        
        # Add to measurement trainer
        success = measurement_trainer.add_training_sample(
            filepath, height_cm, chest_cm, waist_cm, hip_cm, gender
        )
        
        if not success:
            return jsonify({
                'success': False,
                'error': 'Could not process photo - ensure full body is visible'
            }), 400
        
        # Add to gender trainer (for training gender detection model)
        gender_trainer.add_training_sample(filepath, gender)
        
        # Save training data
        os.makedirs('training_data', exist_ok=True)
        measurement_trainer.save_training_data(MEASUREMENT_TRAINING_FILE)
        
        return jsonify({
            'success': True,
            'message': 'Training sample added successfully (measurements + gender)',
            'total_samples': len(measurement_trainer.training_data)
        })
        
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500
        return jsonify({'success': False, 'error': 'Measurement trainer not available'}), 503
    
    try:
        # Get form data
        if 'photo' not in request.files:
            return jsonify({'success': False, 'error': 'No photo uploaded'}), 400
        
        photo = request.files['photo']
        height_cm = float(request.form.get('height_cm'))
        chest_cm = float(request.form.get('chest_cm'))
        waist_cm = float(request.form.get('waist_cm'))
        hip_cm = float(request.form.get('hip_cm'))
        gender = request.form.get('gender')
        
        # Validate inputs
        if not all([height_cm, chest_cm, waist_cm, hip_cm, gender]):
            return jsonify({'success': False, 'error': 'Missing required fields'}), 400
        
        # Create directory
        os.makedirs('training_photos', exist_ok=True)
        
        # Save photo
        timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
        filename = f"{gender}_{timestamp}_{photo.filename}"
        filepath = os.path.join('training_photos', filename)
        photo.save(filepath)
        
        # Add to trainer
        success = measurement_trainer.add_training_sample(
            filepath, height_cm, chest_cm, waist_cm, hip_cm, gender
        )
        
        if not success:
            return jsonify({
                'success': False,
                'error': 'Could not process photo - ensure full body is visible'
            }), 400
        
        # Save training data
        os.makedirs('training_data', exist_ok=True)
        measurement_trainer.save_training_data(MEASUREMENT_TRAINING_FILE)
        
        return jsonify({
            'success': True,
            'message': 'Training sample added successfully',
            'total_samples': len(measurement_trainer.training_data)
        })
        
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500


@app.route('/api/measurement/stats', methods=['GET'])
def get_measurement_stats():
    """Get measurement training statistics"""
    if not measurement_trainer:
        return jsonify({
            'total_samples': 0,
            'male_samples': 0,
            'female_samples': 0,
            'ready_to_train': False,
            'recommended_samples': 100,
            'has_model': False,
            'error': 'Measurement trainer not available'
        })
    
    male_count = sum(1 for s in measurement_trainer.training_data if s['gender'] == 'male')
    female_count = sum(1 for s in measurement_trainer.training_data if s['gender'] == 'female')
    
    return jsonify({
        'total_samples': len(measurement_trainer.training_data),
        'male_samples': male_count,
        'female_samples': female_count,
        'ready_to_train': len(measurement_trainer.training_data) >= 10,
        'recommended_samples': 100,
        'has_model': os.path.exists('models/custom_measurement_model.pkl')
    })


@app.route('/api/measurement/samples', methods=['GET'])
def get_measurement_samples():
    """Get list of measurement training samples"""
    samples = []
    for sample in measurement_trainer.training_data:
        samples.append({
            'image': os.path.basename(sample['image_path']),
            'gender': sample['gender'],
            'height': sample['height_cm'],
            'chest': sample['chest_cm'],
            'waist': sample['waist_cm'],
            'hip': sample['hip_cm']
        })
    return jsonify({'samples': samples, 'count': len(samples)})


@app.route('/api/measurement/train', methods=['POST'])
def train_measurement_model():
    """Train the measurement extraction model"""
    global measurement_training_status
    
    if measurement_training_status['is_training']:
        return jsonify({'error': 'Measurement training already in progress'}), 400
    
    if len(measurement_trainer.training_data) < 10:
        return jsonify({
            'error': f'Need at least 10 samples (have {len(measurement_trainer.training_data)})'
        }), 400
    
    # Start training in background thread
    thread = threading.Thread(target=train_measurement_model_background)
    thread.start()
    
    return jsonify({'message': 'Measurement model training started'})


def train_measurement_model_background():
    """Train measurement model in background"""
    global measurement_training_status
    
    try:
        measurement_training_status['is_training'] = True
        measurement_training_status['progress'] = 0
        measurement_training_status['results'] = None
        
        # Stage 1: Prepare data
        measurement_training_status['stage'] = 'preparing'
        measurement_training_status['message'] = 'Preparing training data...'
        measurement_training_status['progress'] = 10
        time.sleep(0.5)
        
        # Stage 2: Train gender detection model FIRST
        measurement_training_status['stage'] = 'training_gender'
        measurement_training_status['message'] = 'Training gender detection model...'
        measurement_training_status['progress'] = 25
        
        gender_success = False
        if gender_trainer and len(gender_trainer.training_data) >= 10:
            gender_success = gender_trainer.train_model()
            if gender_success:
                gender_trainer.save_model('models/gender_detection_model.pkl')
                print("✓ Gender detection model trained and saved")
        else:
            print("⚠ Skipping gender model training (need at least 10 samples)")
        
        time.sleep(0.5)
        
        # Stage 3: Train measurement model
        measurement_training_status['stage'] = 'training_measurements'
        measurement_training_status['message'] = 'Training measurement extraction model...'
        measurement_training_status['progress'] = 50
        
        start_time = time.time()
        success = measurement_trainer.train_model()
        
        if not success:
            raise Exception("Measurement model training failed")
        
        # Stage 4: Train gender classifier (built into measurement model)
        measurement_training_status['stage'] = 'training_gender_classifier'
        measurement_training_status['message'] = 'Training integrated gender classifier...'
        measurement_training_status['progress'] = 75
        
        measurement_trainer.train_gender_classifier()
        
        duration = time.time() - start_time
        
        # Stage 5: Save model
        measurement_training_status['stage'] = 'saving'
        measurement_training_status['message'] = 'Saving trained models...'
        measurement_training_status['progress'] = 90
        
        measurement_trainer.save_model('models/custom_measurement_model.pkl')
        measurement_trainer.generate_training_report()
        
        # Prepare results
        results = {
            'training_samples': len(measurement_trainer.training_data),
            'accuracy': measurement_trainer.model['accuracy'],
            'avg_error': measurement_trainer.model['avg_mae'],
            'duration': round(duration, 2),
            'male_samples': sum(1 for s in measurement_trainer.training_data if s['gender'] == 'male'),
            'female_samples': sum(1 for s in measurement_trainer.training_data if s['gender'] == 'female'),
            'has_gender_classifier': measurement_trainer.gender_model is not None,
            'has_standalone_gender_model': gender_success
        }
        
        # Complete
        measurement_training_status['stage'] = 'complete'
        measurement_training_status['message'] = f'Training complete! Accuracy: {results["accuracy"]:.1f}%'
        measurement_training_status['progress'] = 100
        measurement_training_status['results'] = results
        
    except Exception as e:
        measurement_training_status['stage'] = 'error'
        measurement_training_status['message'] = f'Error: {str(e)}'
        measurement_training_status['progress'] = 0
    
    finally:
        measurement_training_status['is_training'] = False


@app.route('/api/measurement/status', methods=['GET'])
def get_measurement_training_status():
    """Get measurement training status"""
    return jsonify(measurement_training_status)


@app.route('/api/measurement/model-info', methods=['GET'])
def get_measurement_model_info():
    """Get information about trained measurement model"""
    model_path = 'models/custom_measurement_model.pkl'
    gender_model_path = 'models/gender_detection_model.pkl'
    
    if not os.path.exists(model_path):
        return jsonify({'exists': False})
    
    try:
        file_stats = os.stat(model_path)
        file_size_mb = file_stats.st_size / (1024 * 1024)
        modified_time = datetime.fromtimestamp(file_stats.st_mtime)
        
        with open(model_path, 'rb') as f:
            model_data = pickle.load(f)
        
        measurement_model = model_data['measurement_model']
        
        # Check for standalone gender model
        has_standalone_gender = os.path.exists(gender_model_path)
        gender_model_info = None
        
        if has_standalone_gender:
            try:
                with open(gender_model_path, 'rb') as f:
                    gender_data = pickle.load(f)
                gender_model_info = {
                    'training_samples': gender_data['training_samples'],
                    'male_samples': gender_data['male_samples'],
                    'female_samples': gender_data['female_samples'],
                    'trained_date': gender_data['trained_date']
                }
            except:
                pass
        
        return jsonify({
            'exists': True,
            'file_size_mb': round(file_size_mb, 2),
            'modified': modified_time.strftime('%Y-%m-%d %H:%M:%S'),
            'accuracy': round(measurement_model['accuracy'], 2),
            'avg_error_cm': round(measurement_model['avg_mae'], 2),
            'training_samples': measurement_model['training_samples'],
            'trained_date': measurement_model['trained_date'],
            'has_gender_classifier': model_data['gender_model'] is not None,
            'has_standalone_gender_model': has_standalone_gender,
            'gender_model_info': gender_model_info
        })
    except Exception as e:
        return jsonify({'exists': True, 'error': str(e)})


@app.route('/api/measurement/clear-data', methods=['POST'])
def clear_measurement_data():
    """Clear all measurement training data"""
    try:
        if os.path.exists(MEASUREMENT_TRAINING_FILE):
            os.remove(MEASUREMENT_TRAINING_FILE)
        
        # Clear trainer data
        measurement_trainer.training_data = []
        
        return jsonify({'message': 'Measurement training data cleared'})
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/api/measurement/predict-with-recommendations', methods=['POST'])
def predict_with_recommendations():
    """
    Predict measurements and gender from photo, then provide size recommendations
    This is the endpoint to use AFTER training the model
    """
    try:
        if 'photo' not in request.files:
            return jsonify({'success': False, 'error': 'No photo uploaded'}), 400
        
        photo = request.files['photo']
        height_cm = request.form.get('height_cm')
        
        if not height_cm:
            return jsonify({'success': False, 'error': 'Height is required'}), 400
        
        height_cm = float(height_cm)
        
        # Save photo temporarily
        import tempfile
        with tempfile.NamedTemporaryFile(delete=False, suffix='.jpg') as tmp_file:
            photo.save(tmp_file.name)
            temp_path = tmp_file.name
        
        try:
            # Step 1: Extract measurements using AI service
            import requests
            
            with open(temp_path, 'rb') as f:
                files = {'image': f}
                data = {'height_cm': height_cm}
                
                response = requests.post(
                    'http://localhost:5000/api/ai/extract-measurements',
                    files=files,
                    data=data,
                    timeout=30
                )
            
            if response.status_code != 200:
                os.remove(temp_path)
                return jsonify({'success': False, 'error': 'Failed to extract measurements'}), 500
            
            result = response.json()
            if not result.get('success'):
                os.remove(temp_path)
                return jsonify({'success': False, 'error': 'Could not detect person in photo'}), 400
            
            measurements = result['measurements']
            
            # Step 2: Detect gender using TRAINED model
            detected_gender = 'unknown'
            gender_confidence = 0.0
            gender_method = 'none'
            
            if gender_trainer and gender_trainer.model:
                gender_result = gender_trainer.predict_gender(temp_path)
                if 'error' not in gender_result:
                    detected_gender = gender_result['gender']
                    gender_confidence = gender_result['confidence']
                    gender_method = 'trained-model'
                    print(f"✓ Gender detected: {detected_gender} ({gender_confidence*100:.1f}%)")
            
            # Step 3: Get size recommendations based on measurements and gender
            chest = measurements['chest_cm']
            waist = measurements['waist_cm']
            hip = measurements['hip_cm']
            
            # Simple size recommendation logic
            size_recommendations = []
            
            if detected_gender == 'female':
                if chest < 82:
                    size_recommendations.append({'size': 'XS', 'confidence': 0.85})
                elif chest < 88:
                    size_recommendations.append({'size': 'S', 'confidence': 0.90})
                elif chest < 94:
                    size_recommendations.append({'size': 'M', 'confidence': 0.90})
                elif chest < 100:
                    size_recommendations.append({'size': 'L', 'confidence': 0.85})
                elif chest < 108:
                    size_recommendations.append({'size': 'XL', 'confidence': 0.85})
                else:
                    size_recommendations.append({'size': 'XXL', 'confidence': 0.80})
            
            elif detected_gender == 'male':
                if chest < 92:
                    size_recommendations.append({'size': 'S', 'confidence': 0.85})
                elif chest < 100:
                    size_recommendations.append({'size': 'M', 'confidence': 0.90})
                elif chest < 108:
                    size_recommendations.append({'size': 'L', 'confidence': 0.90})
                elif chest < 116:
                    size_recommendations.append({'size': 'XL', 'confidence': 0.85})
                else:
                    size_recommendations.append({'size': 'XXL', 'confidence': 0.80})
            
            # Clean up
            os.remove(temp_path)
            
            return jsonify({
                'success': True,
                'measurements': {
                    'height_cm': measurements['height_cm'],
                    'chest_cm': chest,
                    'waist_cm': waist,
                    'hip_cm': hip,
                    'confidence': measurements.get('confidence', 0.85)
                },
                'gender': {
                    'detected': detected_gender,
                    'confidence': gender_confidence,
                    'method': gender_method
                },
                'recommendations': size_recommendations,
                'message': f'Analysis complete! Gender: {detected_gender}, Recommended size: {size_recommendations[0]["size"] if size_recommendations else "N/A"}'
            })
            
        except Exception as e:
            if os.path.exists(temp_path):
                os.remove(temp_path)
            raise e
            
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500


if __name__ == '__main__':
    print("\n" + "=" * 70)
    print("🎓 AI Model Training Web UI")
    print("=" * 70)
    print("\nStarting training interface...")
    print("\n📱 Open in browser: http://localhost:5001")
    print("\n✨ Features:")
    print("  - Visual training interface")
    print("  - Real-time progress tracking")
    print("  - Model information dashboard")
    print("  - Training history viewer")
    print("  - Perfect for demonstrations!")
    print("\n" + "=" * 70)
    print()
    
    app.run(host='0.0.0.0', port=5001, debug=False)
