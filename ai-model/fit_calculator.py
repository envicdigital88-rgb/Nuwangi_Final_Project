"""
Smart Fit Calculator
Calculates how well a product fits a user's body measurements
"""

class FitCalculator:
    def __init__(self):
        # Standard size measurements (in cm)
        self.size_chart = {
            'XS': {'chest': 80, 'waist': 64, 'hip': 88},
            'S': {'chest': 86, 'waist': 68, 'hip': 92},
            'M': {'chest': 92, 'waist': 74, 'hip': 98},
            'L': {'chest': 98, 'waist': 80, 'hip': 104},
            'XL': {'chest': 106, 'waist': 88, 'hip': 112},
            'XXL': {'chest': 114, 'waist': 96, 'hip': 120},
        }
    
    def calculate_fit_score(self, user_measurements, product_size_chart, clothing_type='shirt'):
        """
        Calculate how well a product fits the user using PRODUCT-SPECIFIC measurements
        
        Args:
            user_measurements: dict with chest_cm, waist_cm, hip_cm
            product_size_chart: dict like {"S": {"chest": 86, "waist": 68, "hip": 92}, "M": {...}}
            clothing_type: 'shirt', 'pants', 'dress'
        
        Returns:
            dict: {
                'best_size': 'M',
                'fit_score': 95,
                'fit_level': 'PERFECT_FIT',
                'all_sizes': [{'size': 'M', 'score': 95}, {'size': 'L', 'score': 78}]
            }
        """
        if not product_size_chart:
            # Fallback to standard size chart
            product_size_chart = self.size_chart
        
        # Calculate fit score for each available size
        size_scores = []
        
        for size, size_measurements in product_size_chart.items():
            # Calculate difference for each measurement
            chest_diff = abs(user_measurements['chest_cm'] - size_measurements.get('chest', 0))
            waist_diff = abs(user_measurements['waist_cm'] - size_measurements.get('waist', 0))
            hip_diff = abs(user_measurements['hip_cm'] - size_measurements.get('hip', 0))
            
            # Calculate fit percentages (closer to 0 diff = better fit)
            chest_fit = max(0, 100 - (chest_diff * 5))
            waist_fit = max(0, 100 - (waist_diff * 5))
            hip_fit = max(0, 100 - (hip_diff * 5))
            
            # Overall fit score (weighted average)
            if clothing_type == 'shirt':
                fit_score = (chest_fit * 0.5 + waist_fit * 0.3 + hip_fit * 0.2)
            elif clothing_type == 'pants':
                fit_score = (waist_fit * 0.5 + hip_fit * 0.4 + chest_fit * 0.1)
            else:
                fit_score = (chest_fit + waist_fit + hip_fit) / 3
            
            size_scores.append({
                'size': size,
                'score': round(fit_score, 1),
                'chest_fit': round(chest_fit, 1),
                'waist_fit': round(waist_fit, 1),
                'hip_fit': round(hip_fit, 1),
                'chest_diff': round(chest_diff, 1),
                'waist_diff': round(waist_diff, 1),
                'hip_diff': round(hip_diff, 1)
            })
        
        # Sort by fit score (best first)
        size_scores.sort(key=lambda x: x['score'], reverse=True)
        
        best_size = size_scores[0]
        
        # Determine fit level
        if best_size['score'] >= 90:
            fit_level = 'PERFECT_FIT'
            recommendation = 'This will fit you perfectly!'
        elif best_size['score'] >= 75:
            fit_level = 'GOOD_FIT'
            recommendation = 'This should fit you well'
        elif best_size['score'] >= 60:
            fit_level = 'LOOSE_FIT'
            recommendation = 'This might be slightly loose'
        else:
            fit_level = 'TIGHT_FIT'
            recommendation = 'This might be tight'
        
        return {
            'best_size': best_size['size'],
            'fit_score': best_size['score'],
            'fit_level': fit_level,
            'recommendation': recommendation,
            'chest_fit': best_size['chest_fit'],
            'waist_fit': best_size['waist_fit'],
            'hip_fit': best_size['hip_fit'],
            'all_sizes': size_scores,
            'size_difference': {
                'chest': best_size['chest_diff'],
                'waist': best_size['waist_diff'],
                'hip': best_size['hip_diff']
            }
        }
    
    def find_best_fitting_products(self, user_measurements, products):
        """
        Find products that fit the user best
        
        Returns:
            list: Products sorted by fit score with fit details
        """
        results = []
        
        for product in products:
            # Get recommended size for this user
            recommended_size = self._get_recommended_size(user_measurements)
            
            # Calculate fit score
            fit_details = self.calculate_fit_score(
                user_measurements, 
                recommended_size,
                product.get('category', 'shirt').lower()
            )
            
            results.append({
                'product': product,
                'recommended_size': recommended_size,
                'fit_details': fit_details
            })
        
        # Sort by fit score (best fit first)
        results.sort(key=lambda x: x['fit_details']['fit_score'], reverse=True)
        
        return results
    
    def _get_recommended_size(self, measurements):
        """Get recommended size based on measurements"""
        chest = measurements['chest_cm']
        
        if chest < 83:
            return 'XS'
        elif chest < 89:
            return 'S'
        elif chest < 95:
            return 'M'
        elif chest < 102:
            return 'L'
        elif chest < 110:
            return 'XL'
        else:
            return 'XXL'
    
    def _default_fit(self):
        return {
            'fit_score': 50,
            'fit_level': 'UNKNOWN',
            'chest_fit': 50,
            'waist_fit': 50,
            'hip_fit': 50,
            'recommendation': 'Size information not available'
        }


# Example usage
if __name__ == "__main__":
    calculator = FitCalculator()
    
    # User measurements
    user = {
        'chest_cm': 92,
        'waist_cm': 76,
        'hip_cm': 98
    }
    
    # Test fit for different sizes
    print("=== Fit Analysis ===")
    for size in ['S', 'M', 'L']:
        fit = calculator.calculate_fit_score(user, size, 'shirt')
        print(f"\nSize {size}:")
        print(f"  Fit Score: {fit['fit_score']}%")
        print(f"  Fit Level: {fit['fit_level']}")
        print(f"  Recommendation: {fit['recommendation']}")
        print(f"  Chest Fit: {fit['chest_fit']}%")
        print(f"  Waist Fit: {fit['waist_fit']}%")
        print(f"  Hip Fit: {fit['hip_fit']}%")
