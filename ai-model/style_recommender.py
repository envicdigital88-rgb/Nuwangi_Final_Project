"""
AI Style & Color Recommendation System
Suggests best colors and styles based on skin tone, body shape, and preferences
"""

import numpy as np
from sklearn.ensemble import RandomForestClassifier
import json

class StyleRecommender:
    def __init__(self):
        # Color palettes for different skin tones
        self.color_palettes = {
            'light': {
                'best': ['navy', 'burgundy', 'forest_green', 'royal_blue', 'charcoal'],
                'good': ['black', 'white', 'gray', 'brown'],
                'avoid': ['pale_yellow', 'beige']
            },
            'medium': {
                'best': ['emerald', 'coral', 'turquoise', 'purple', 'red'],
                'good': ['white', 'black', 'navy', 'olive'],
                'avoid': ['orange', 'neon_colors']
            },
            'tan': {
                'best': ['gold', 'orange', 'brown', 'olive', 'cream'],
                'good': ['black', 'white', 'red', 'blue'],
                'avoid': ['pale_pink', 'light_gray']
            },
            'dark': {
                'best': ['white', 'bright_colors', 'pastels', 'gold', 'silver'],
                'good': ['red', 'blue', 'green', 'yellow'],
                'avoid': ['dark_brown', 'black']
            }
        }
        
        # Style recommendations by body shape
        self.style_guide = {
            'hourglass': {
                'tops': ['fitted', 'wrap', 'v-neck', 'belted'],
                'bottoms': ['high-waist', 'bootcut', 'straight'],
                'avoid': ['boxy', 'shapeless']
            },
            'pear': {
                'tops': ['boat-neck', 'off-shoulder', 'bright_colors'],
                'bottoms': ['dark_colors', 'straight', 'bootcut'],
                'avoid': ['skinny_jeans', 'tight_bottoms']
            },
            'apple': {
                'tops': ['v-neck', 'empire_waist', 'flowing'],
                'bottoms': ['bootcut', 'wide_leg', 'dark_colors'],
                'avoid': ['tight_waist', 'crop_tops']
            },
            'rectangle': {
                'tops': ['peplum', 'ruffles', 'layered'],
                'bottoms': ['flared', 'patterned', 'textured'],
                'avoid': ['straight_cuts', 'boxy']
            },
            'inverted-triangle': {
                'tops': ['v-neck', 'dark_colors', 'simple'],
                'bottoms': ['flared', 'bright_colors', 'patterned'],
                'avoid': ['shoulder_pads', 'boat_neck']
            }
        }
    
    def recommend_colors(self, skin_tone, occasion='casual'):
        """
        Recommend colors based on skin tone
        
        Args:
            skin_tone: 'light', 'medium', 'tan', 'dark'
            occasion: 'casual', 'formal', 'party'
            
        Returns:
            dict: Color recommendations with hex codes
        """
        palette = self.color_palettes.get(skin_tone, self.color_palettes['medium'])
        
        # Map color names to hex codes
        color_hex = {
            'navy': '#000080',
            'burgundy': '#800020',
            'forest_green': '#228B22',
            'royal_blue': '#4169E1',
            'charcoal': '#36454F',
            'black': '#000000',
            'white': '#FFFFFF',
            'gray': '#808080',
            'brown': '#8B4513',
            'emerald': '#50C878',
            'coral': '#FF7F50',
            'turquoise': '#40E0D0',
            'purple': '#800080',
            'red': '#DC143C',
            'olive': '#808000',
            'gold': '#FFD700',
            'orange': '#FF8C00',
            'cream': '#FFFDD0',
            'blue': '#0000FF',
            'green': '#008000',
            'yellow': '#FFFF00',
            'bright_colors': '#FF69B4',
            'pastels': '#FFB6C1',
            'silver': '#C0C0C0'
        }
        
        recommendations = {
            'best_colors': [
                {'name': color, 'hex': color_hex.get(color, '#808080'), 'match': 95}
                for color in palette['best'][:5]
            ],
            'good_colors': [
                {'name': color, 'hex': color_hex.get(color, '#808080'), 'match': 75}
                for color in palette['good'][:4]
            ],
            'avoid_colors': palette['avoid'],
            'skin_tone': skin_tone,
            'occasion': occasion
        }
        
        return recommendations
    
    def recommend_style(self, body_shape, gender='female', clothing_type='shirt'):
        """
        Recommend clothing styles based on body shape
        
        Args:
            body_shape: 'hourglass', 'pear', 'apple', 'rectangle', 'inverted-triangle'
            gender: 'male' or 'female'
            clothing_type: 'shirt', 'pants', 'dress'
            
        Returns:
            dict: Style recommendations
        """
        guide = self.style_guide.get(body_shape, self.style_guide['rectangle'])
        
        recommendations = {
            'body_shape': body_shape,
            'recommended_styles': guide['tops'] if clothing_type == 'shirt' else guide['bottoms'],
            'avoid_styles': guide['avoid'],
            'tips': self._generate_style_tips(body_shape, clothing_type),
            'confidence': 88
        }
        
        return recommendations
    
    def _generate_style_tips(self, body_shape, clothing_type):
        """Generate personalized style tips"""
        tips = {
            'hourglass': [
                "Emphasize your waist with fitted styles",
                "Wrap dresses and belted tops work great",
                "Avoid shapeless, boxy clothing"
            ],
            'pear': [
                "Draw attention to your upper body with bright colors",
                "Choose darker colors for bottoms",
                "A-line skirts and bootcut jeans are flattering"
            ],
            'apple': [
                "V-necks elongate your torso",
                "Empire waist styles are very flattering",
                "Avoid tight waistbands"
            ],
            'rectangle': [
                "Create curves with peplum tops and ruffles",
                "Belts help define your waist",
                "Layering adds dimension"
            ],
            'inverted-triangle': [
                "Balance proportions with flared bottoms",
                "Keep tops simple and dark",
                "Avoid shoulder pads and boat necks"
            ]
        }
        
        return tips.get(body_shape, ["Choose styles that make you feel confident!"])
    
    def get_complete_recommendation(self, user_profile):
        """
        Get complete style recommendation
        
        Args:
            user_profile: dict with skin_tone, body_shape, gender, preferences
            
        Returns:
            dict: Complete style guide
        """
        skin_tone = user_profile.get('skin_tone', 'medium')
        body_shape = user_profile.get('body_shape', 'rectangle')
        gender = user_profile.get('gender', 'female')
        
        colors = self.recommend_colors(skin_tone)
        styles = self.recommend_style(body_shape, gender)
        
        return {
            'color_recommendations': colors,
            'style_recommendations': styles,
            'personalized_message': f"Based on your {skin_tone} skin tone and {body_shape} body shape, "
                                   f"we've curated the perfect style guide for you!",
            'confidence': 90
        }


# Example usage
if __name__ == "__main__":
    recommender = StyleRecommender()
    
    # Test recommendations
    user_profile = {
        'skin_tone': 'medium',
        'body_shape': 'hourglass',
        'gender': 'female'
    }
    
    result = recommender.get_complete_recommendation(user_profile)
    print("\n=== Style Recommendations ===")
    print(json.dumps(result, indent=2))
