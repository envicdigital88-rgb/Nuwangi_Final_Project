"""
Web UI for Training Custom Measurement Model
Easy-to-use interface for collecting training data
"""

from flask import Flask, render_template, request, jsonify
from flask_cors import CORS
import os
import json
from datetime import datetime
from train_measurement_model import MeasurementModelTrainer

app = Flask(__name__)
CORS(app)

# Initialize trainer
trainer = MeasurementModelTrainer()

# Create necessary directories
os.makedirs('training_photos', exist_ok=True)
os.makedirs('training_data', exist_ok=True)
os.makedirs('models', exist_ok=True)

# Load existing training data if available
TRAINING_DATA_FILE = 'training_data/measurement_samples.json'
if os.path.exists(TRAINING_DATA_FILE):
    try:
        with open(TRAINING_DATA_FILE, 'r') as f:
            existing_data = json.load(f)
            print(f"✓ Loaded {len(existing_data)} existing training samples")
            # Reload samples into trainer
            for sample in existing_data:
                trainer.add_training_sample(
                    sample['image_path'],
                    sample['height_cm'],
                    sample['chest_cm'],
                    sample['waist_cm'],
                    sample['hip_cm'],
                    sample['gender']
                )
    except Exception as e:
        print(f"⚠ Could not load existing data: {e}")


@app.route('/')
def index():
    """Main training interface"""
    return render_template('measurement_training_ui.html')


@app.route('/api/training/add-sample', methods=['POST'])
def add_sample():
    """Add a new training sample"""
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
        
        # Save photo
        timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
        filename = f"{gender}_{timestamp}_{photo.filename}"
        filepath = os.path.join('training_photos', filename)
        photo.save(filepath)
        
        # Add to trainer
        success = trainer.add_training_sample(
            filepath, height_cm, chest_cm, waist_cm, hip_cm, gender
        )
        
        if not success:
            return jsonify({
                'success': False,
                'error': 'Could not process photo - ensure full body is visible'
            }), 400
        
        # Save training data
        trainer.save_training_data(TRAINING_DATA_FILE)
        
        return jsonify({
            'success': True,
            'message': 'Training sample added successfully',
            'total_samples': len(trainer.training_data)
        })
        
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500


@app.route('/api/training/stats', methods=['GET'])
def get_stats():
    """Get training statistics"""
    male_count = sum(1 for s in trainer.training_data if s['gender'] == 'male')
    female_count = sum(1 for s in trainer.training_data if s['gender'] == 'female')
    
    return jsonify({
        'total_samples': len(trainer.training_data),
        'male_samples': male_count,
        'female_samples': female_count,
        'ready_to_train': len(trainer.training_data) >= 10
    })


@app.route('/api/training/train', methods=['POST'])
def train_model():
    """Train the model"""
    try:
        if len(trainer.training_data) < 10:
            return jsonify({
                'success': False,
                'error': f'Need at least 10 samples (have {len(trainer.training_data)})'
            }), 400
        
        # Train measurement model
        success = trainer.train_model()
        if not success:
            return jsonify({'success': False, 'error': 'Training failed'}), 500
        
        # Train gender classifier
        trainer.train_gender_classifier()
        
        # Save model
        trainer.save_model('models/custom_measurement_model.pkl')
        
        # Generate report
        trainer.generate_training_report()
        
        return jsonify({
            'success': True,
            'message': 'Model trained successfully',
            'accuracy': trainer.model['accuracy'],
            'avg_error': trainer.model['avg_mae'],
            'training_samples': len(trainer.training_data)
        })
        
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500


@app.route('/api/training/samples', methods=['GET'])
def get_samples():
    """Get list of training samples"""
    samples = []
    for sample in trainer.training_data:
        samples.append({
            'image': os.path.basename(sample['image_path']),
            'gender': sample['gender'],
            'chest': sample['chest_cm'],
            'waist': sample['waist_cm'],
            'hip': sample['hip_cm']
        })
    return jsonify({'samples': samples})


if __name__ == '__main__':
    print("""
╔══════════════════════════════════════════════════════════════╗
║      Measurement Model Training UI                           ║
║      Collect training data and train your own AI model       ║
╚══════════════════════════════════════════════════════════════╝

🚀 Server starting on http://localhost:5001

📝 Instructions:
1. Open http://localhost:5001 in your browser
2. Upload photos with actual measurements
3. Add at least 10 samples (100+ recommended)
4. Click "Train Model" to create your custom AI
5. Model will be saved to models/custom_measurement_model.pkl

💡 Tips:
- Use clear, full-body photos
- Measure yourself accurately with a tape measure
- Include diverse body types and genders
- More samples = better accuracy
    """)
    
    app.run(host='0.0.0.0', port=5001, debug=True)
