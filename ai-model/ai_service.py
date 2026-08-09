"""
AI Service API - Flask Server
Serves AI models for Virtual Try-On application
Run: python ai_service.py
"""

from flask import Flask, request, jsonify
from flask_cors import CORS
import os
import base64
from size_recommender import SizeRecommender
from body_measurement_extractor import BodyMeasurementExtractor
from style_recommender import StyleRecommender
from fit_calculator import FitCalculator

app = Flask(__name__)
CORS(app)  # Allow requests from Java backend

# Initialize AI models
size_recommender = SizeRecommender()
measurement_extractor = BodyMeasurementExtractor()
style_recommender = StyleRecommender()
fit_calculator = FitCalculator()

# Create upload folder
UPLOAD_FOLDER = 'uploads'
os.makedirs(UPLOAD_FOLDER, exist_ok=True)


@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'service': 'AI Virtual Try-On Service',
        'version': '1.0.0'
    })


@app.route('/api/ai/extract-measurements', methods=['POST'])
def extract_measurements():
    """
    Extract body measurements from uploaded photo
    
    Request:
        - image: base64 encoded image or file upload
        - height_cm: optional height for calibration
        
    Response:
        - measurements: chest, waist, hip, shoulders
        - confidence: accuracy score
    """
    try:
        # Handle file upload
        if 'image' in request.files:
            file = request.files['image']
            filepath = os.path.join(UPLOAD_FOLDER, file.filename)
            file.save(filepath)
        elif 'image_base64' in request.json:
            # Handle base64 image
            image_data = request.json['image_base64']
            image_data = image_data.split(',')[1] if ',' in image_data else image_data
            filepath = os.path.join(UPLOAD_FOLDER, 'temp_image.jpg')
            with open(filepath, 'wb') as f:
                f.write(base64.b64decode(image_data))
        else:
            return jsonify({'error': 'No image provided'}), 400
        
        height_cm = request.form.get('height_cm') or request.json.get('height_cm')
        if height_cm:
            height_cm = float(height_cm)
        
        # Extract measurements
        measurements = measurement_extractor.extract_measurements_from_photo(
            filepath, height_cm
        )
        
        # Clean up
        if os.path.exists(filepath):
            os.remove(filepath)
        
        return jsonify({
            'success': True,
            'measurements': measurements,
            'message': 'Measurements extracted successfully'
        })
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e),
            'message': 'Failed to extract measurements'
        }), 500


@app.route('/api/ai/recommend-size', methods=['POST'])
def recommend_size():
    """
    Recommend clothing size based on measurements
    
    Request:
        - measurements: {chest_cm, waist_cm, hip_cm, height_cm}
        - gender: 'male' or 'female'
        - clothing_type: 'shirt', 'pants', 'dress'
        
    Response:
        - recommended_size: XS, S, M, L, XL, XXL
        - confidence: percentage
        - alternatives: other possible sizes
    """
    try:
        data = request.json
        measurements = data.get('measurements', {})
        gender = data.get('gender', 'female')
        clothing_type = data.get('clothing_type', 'shirt')
        
        recommendation = size_recommender.recommend_size(
            measurements, gender, clothing_type
        )
        
        return jsonify({
            'success': True,
            'recommendation': recommendation
        })
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500


@app.route('/api/ai/recommend-colors', methods=['POST'])
def recommend_colors():
    """
    Recommend colors based on skin tone
    
    Request:
        - skin_tone: 'light', 'medium', 'tan', 'dark'
        - occasion: 'casual', 'formal', 'party'
        
    Response:
        - best_colors: list of recommended colors with hex codes
        - good_colors: alternative colors
        - avoid_colors: colors to avoid
    """
    try:
        data = request.json
        skin_tone = data.get('skin_tone', 'medium')
        occasion = data.get('occasion', 'casual')
        
        recommendations = style_recommender.recommend_colors(skin_tone, occasion)
        
        return jsonify({
            'success': True,
            'recommendations': recommendations
        })
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500


@app.route('/api/ai/recommend-style', methods=['POST'])
def recommend_style():
    """
    Recommend clothing styles based on body shape
    
    Request:
        - body_shape: 'hourglass', 'pear', 'apple', 'rectangle', 'inverted-triangle'
        - gender: 'male' or 'female'
        - clothing_type: 'shirt', 'pants', 'dress'
        
    Response:
        - recommended_styles: list of style suggestions
        - avoid_styles: styles to avoid
        - tips: personalized styling tips
    """
    try:
        data = request.json
        body_shape = data.get('body_shape', 'rectangle')
        gender = data.get('gender', 'female')
        clothing_type = data.get('clothing_type', 'shirt')
        
        recommendations = style_recommender.recommend_style(
            body_shape, gender, clothing_type
        )
        
        return jsonify({
            'success': True,
            'recommendations': recommendations
        })
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500


@app.route('/api/ai/calculate-fit', methods=['POST'])
def calculate_fit():
    """
    Calculate how well a product fits the user
    
    Request:
        - measurements: user body measurements
        - product_size_chart: product-specific size chart (optional)
        - clothing_type: type of clothing
        
    Response:
        - best_size: recommended size for this product
        - fit_score: 0-100
        - fit_level: PERFECT_FIT, GOOD_FIT, LOOSE_FIT, TIGHT_FIT
        - detailed fit analysis
    """
    try:
        data = request.json
        measurements = data.get('measurements', {})
        product_size_chart = data.get('product_size_chart', None)
        clothing_type = data.get('clothing_type', 'shirt')
        
        fit_details = fit_calculator.calculate_fit_score(
            measurements, product_size_chart, clothing_type
        )
        
        return jsonify({
            'success': True,
            'fit_details': fit_details
        })
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500


@app.route('/api/ai/complete-recommendation', methods=['POST'])
def complete_recommendation():
    """
    Get complete AI-powered recommendations
    
    Request:
        - measurements: body measurements
        - skin_tone: skin tone
        - body_shape: body shape
        - gender: gender
        - clothing_type: type of clothing
        
    Response:
        - size_recommendation: recommended size
        - color_recommendations: best colors
        - style_recommendations: best styles
        - personalized_tips: styling advice
    """
    try:
        data = request.json
        
        # Get all recommendations
        size_rec = size_recommender.recommend_size(
            data.get('measurements', {}),
            data.get('gender', 'female'),
            data.get('clothing_type', 'shirt')
        )
        
        color_rec = style_recommender.recommend_colors(
            data.get('skin_tone', 'medium'),
            data.get('occasion', 'casual')
        )
        
        style_rec = style_recommender.recommend_style(
            data.get('body_shape', 'rectangle'),
            data.get('gender', 'female'),
            data.get('clothing_type', 'shirt')
        )
        
        # Calculate fit score if product size is provided
        fit_analysis = None
        if 'product_size' in data:
            fit_analysis = fit_calculator.calculate_fit_score(
                data.get('measurements', {}),
                data['product_size'],
                data.get('clothing_type', 'shirt')
            )
        
        return jsonify({
            'success': True,
            'size_recommendation': size_rec,
            'color_recommendations': color_rec,
            'style_recommendations': style_rec,
            'fit_analysis': fit_analysis,
            'message': 'Complete AI recommendations generated successfully'
        })
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500


if __name__ == '__main__':
    print("=" * 60)
    print("🤖 AI Virtual Try-On Service Starting...")
    print("=" * 60)
    print("✓ Size Recommender: Ready")
    print("✓ Measurement Extractor: Ready")
    print("✓ Style Recommender: Ready")
    print("=" * 60)
    print("🚀 Server running on http://localhost:5000")
    print("=" * 60)
    
    app.run(host='0.0.0.0', port=5000, debug=True)
