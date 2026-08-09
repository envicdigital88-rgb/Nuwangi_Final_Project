"""
Generate Synthetic Training Data for Size Recommendation
Creates realistic training data automatically - perfect for campus project!
"""

import json
import random
import numpy as np

def generate_size_training_data(num_samples=2000):
    """
    Generate synthetic training data for size recommendation
    Increased to 2000 samples for maximum accuracy
    
    Args:
        num_samples: Number of training samples to generate
        
    Returns:
        List of training samples
    """
    training_data = []
    
    # Size ranges for females (in cm)
    female_sizes = {
        'XS': {'chest': (78, 82), 'waist': (60, 64), 'hip': (86, 90), 'height': (155, 165)},
        'S':  {'chest': (82, 88), 'waist': (64, 70), 'hip': (90, 96), 'height': (160, 170)},
        'M':  {'chest': (88, 94), 'waist': (70, 76), 'hip': (96, 102), 'height': (165, 175)},
        'L':  {'chest': (94, 100), 'waist': (76, 82), 'hip': (102, 108), 'height': (165, 175)},
        'XL': {'chest': (100, 108), 'waist': (82, 90), 'hip': (108, 116), 'height': (165, 180)},
        'XXL': {'chest': (108, 116), 'waist': (90, 98), 'hip': (116, 124), 'height': (165, 180)}
    }
    
    # Size ranges for males (in cm)
    male_sizes = {
        'S':  {'chest': (86, 92), 'waist': (72, 78), 'hip': (90, 96), 'height': (165, 175)},
        'M':  {'chest': (92, 100), 'waist': (78, 86), 'hip': (96, 102), 'height': (170, 180)},
        'L':  {'chest': (100, 108), 'waist': (86, 94), 'hip': (102, 108), 'height': (175, 185)},
        'XL': {'chest': (108, 116), 'waist': (94, 102), 'hip': (108, 114), 'height': (175, 190)},
        'XXL': {'chest': (116, 124), 'waist': (102, 110), 'hip': (114, 120), 'height': (175, 195)}
    }
    
    clothing_types = ['shirt', 'pants', 'dress', 'jacket']
    
    # Generate samples
    for i in range(num_samples):
        # Randomly choose gender
        gender = random.choice(['female', 'male'])
        sizes = female_sizes if gender == 'female' else male_sizes
        
        # Randomly choose size
        size = random.choice(list(sizes.keys()))
        size_ranges = sizes[size]
        
        # Generate measurements within size range (with some noise)
        chest = round(random.uniform(size_ranges['chest'][0], size_ranges['chest'][1]) + random.gauss(0, 2), 1)
        waist = round(random.uniform(size_ranges['waist'][0], size_ranges['waist'][1]) + random.gauss(0, 2), 1)
        hip = round(random.uniform(size_ranges['hip'][0], size_ranges['hip'][1]) + random.gauss(0, 2), 1)
        height = round(random.uniform(size_ranges['height'][0], size_ranges['height'][1]) + random.gauss(0, 3), 1)
        
        # Randomly choose clothing type
        clothing_type = random.choice(clothing_types)
        
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


def save_training_data(data, filename='training_data_size.json'):
    """Save training data to JSON file"""
    with open(filename, 'w') as f:
        json.dump(data, f, indent=2)
    print(f"✓ Saved {len(data)} training samples to {filename}")


def generate_measurement_training_data(num_samples=50):
    """
    Generate synthetic training data for measurement extraction
    (For when you don't have real photos)
    """
    training_data = []
    
    for i in range(num_samples):
        gender = random.choice(['female', 'male'])
        
        if gender == 'female':
            chest = round(random.uniform(78, 108), 1)
            waist = round(random.uniform(60, 90), 1)
            hip = round(random.uniform(86, 116), 1)
            height = round(random.uniform(155, 180), 1)
        else:
            chest = round(random.uniform(86, 124), 1)
            waist = round(random.uniform(72, 110), 1)
            hip = round(random.uniform(90, 120), 1)
            height = round(random.uniform(165, 195), 1)
        
        sample = {
            'image': f'photos/person_{i+1}.jpg',  # Placeholder
            'measurements': {
                'chest': chest,
                'waist': waist,
                'hip': hip,
                'height': height
            },
            'gender': gender
        }
        
        training_data.append(sample)
    
    return training_data


if __name__ == "__main__":
    print("=" * 60)
    print("🤖 Generating Training Data for AI Models")
    print("=" * 60)
    print()
    
    # Generate size recommendation training data
    print("1. Generating Size Recommendation Training Data...")
    size_data = generate_size_training_data(num_samples=2000)  # Increased to 2000
    save_training_data(size_data, 'training_data_size.json')
    
    print()
    print("Sample data:")
    print(json.dumps(size_data[0], indent=2))
    
    print()
    print("=" * 60)
    print("✅ Training Data Generated Successfully!")
    print("=" * 60)
    print()
    print("Next steps:")
    print("1. Review the generated data: training_data_size.json")
    print("2. Train the model: python train_size_model.py")
    print("3. Test the model: python test_trained_model.py")
    print()
    print("For better accuracy, you can:")
    print("- Add more samples (edit num_samples)")
    print("- Add real data from friends/family")
    print("- Mix synthetic and real data")
    print()
