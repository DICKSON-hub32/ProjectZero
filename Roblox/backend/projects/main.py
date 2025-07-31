import pandas as pd
import os
from django.http import JsonResponse
import requests
import google.generativeai as genai

# Set up paths
base_dir = os.path.dirname(os.path.abspath(__file__))
data_path = os.path.join(base_dir, 'crop_data.csv')
dataset = pd.read_csv(data_path)

# Function to check if value falls within a range
def check_range(value, range_str):
    try:
        if '-' in range_str:
            min_val, max_val = map(float, range_str.split('-'))
            return min_val <= value <= max_val
        return float(range_str) == value
    except Exception as e:
        print(f"Error in check_range: {e}")
        return False

# Function to calculate similarity score for a crop based on sensor values
def calculate_similarity_score(sensor_values, crop_row):
    """
    Calculate similarity score between sensor values and crop requirements
    Returns a score between 0 and 1 (1 being perfect match)
    """
    try:
        scores = []
        parameters = [
            ('Nitrogen', 'Nitrogen (%)'),
            ('Phosphorous', 'Phosphorous (%)'), 
            ('Potassium', 'Potassium (%)'),
            ('Ph', 'Soil pH'),
            ('Moisture', 'Soil Moisture (%)'),
            ('Humidity', 'Humidity (%)'),
            ('Temperature', 'Temperature (C)')
        ]
        
        for sensor_key, crop_key in parameters:
            sensor_val = sensor_values[sensor_key]
            range_str = crop_row[crop_key]
            
            if '-' in range_str:
                min_val, max_val = map(float, range_str.split('-'))
                mid_val = (min_val + max_val) / 2
                range_width = max_val - min_val
                
                # If value is within range, score is 1.0
                if min_val <= sensor_val <= max_val:
                    scores.append(1.0)
                else:
                    # Calculate distance from range
                    if sensor_val < min_val:
                        distance = min_val - sensor_val
                    else:
                        distance = sensor_val - max_val
                    
                    # Normalize distance by range width, with maximum penalty distance of 2x range width
                    max_penalty_distance = range_width * 2
                    normalized_distance = min(distance / max_penalty_distance, 1.0)
                    score = max(0, 1.0 - normalized_distance)
                    scores.append(score)
            else:
                # Single value comparison
                target_val = float(range_str)
                distance = abs(sensor_val - target_val)
                # Use 10% of target value as maximum penalty distance
                max_penalty_distance = max(target_val * 0.1, 1.0)
                normalized_distance = min(distance / max_penalty_distance, 1.0)
                score = max(0, 1.0 - normalized_distance)
                scores.append(score)
        
        # Return weighted average (all parameters equally weighted for now)
        return sum(scores) / len(scores)
    
    except Exception as e:
        print(f"Error calculating similarity score: {e}")
        return 0.0

# Function to filter suggested crops to only include ones in the dataset
def filter_crops(suggested_crops):
    return [crop for crop in suggested_crops if crop in dataset['crop_name'].values]

def suggest_plant(Nitrogen, Phosphorous, Potassium, Ph,Humidity,Temperature,Moisture,language, location=None, season=None):
    try:
        # Convert input values to floats
        Nitrogen = float(Nitrogen)
        Phosphorous = float(Phosphorous)
        Potassium = float(Potassium)
        Ph = float(Ph)
        Temperature=float(Temperature)
        Moisture=float(Moisture)
        language=language


        # Prepare sensor values for similarity calculation
        sensor_values = {
            'Nitrogen': Nitrogen,
            'Phosphorous': Phosphorous,
            'Potassium': Potassium,
            'Ph': Ph,
            'Moisture': Moisture,
            'Humidity': Humidity,
            'Temperature': Temperature
        }
        
        # Calculate similarity scores for all crops
        crop_scores = []
        print("Calculating similarity scores for all crops...")
        
        for _, row in dataset.iterrows():
            similarity_score = calculate_similarity_score(sensor_values, row)
            crop_scores.append({
                'crop_row': row,
                'score': similarity_score
            })
        
        # Sort by similarity score (highest first) and take top matches
        crop_scores.sort(key=lambda x: x['score'], reverse=True)
        
        # Set minimum threshold (e.g., 0.3 means at least 30% similarity)
        min_threshold = 0.3
        
        print(f"Top crop scores: {[(item['crop_row']['crop_name'], round(item['score'], 3)) for item in crop_scores[:10]]}")
        
        # Filter crops above threshold and take top 4
        suitable_crops = [item for item in crop_scores if item['score'] >= min_threshold][:4]
        
        # If no crops meet the threshold, take the top 4 anyway (with lower threshold)
        if not suitable_crops:
            print(f"No crops meet minimum threshold of {min_threshold}. Taking top 4 crops anyway.")
            suitable_crops = crop_scores[:4]
        
        # Prepare crop data for single API call
        crops_data = []
        for crop_item in suitable_crops:
            row = crop_item['crop_row']
            score = crop_item['score']
            crops_data.append({
                'name': row['crop_name'],
                'score': round(score, 3),
                'nitrogen_range': row['Nitrogen (%)'],
                'phosphorous_range': row['Phosphorous (%)'],
                'potassium_range': row['Potassium (%)'],
                'ph_range': row['Soil pH'],
                'temperature_range': row['Temperature (C)'],
                'humidity_range': row['Humidity (%)'],
                'moisture_range': row['Soil Moisture (%)'],
                'irrigation_per_day': row['Number of times of irrigation in a day'],
                'irrigation_days_per_week': row['Number of days of irrigation in a week']
            })
        
        genai.configure(api_key="AIzaSyD2aILZSjqcXNQ8s01iR6RoSFjNvBpzYYA")
        model = genai.GenerativeModel('gemini-2.0-flash')
        
        location_info = f" in {location}" if location else ""
        season_info = f" during {season} season" if season else ""
        
        query = f"""
        You are an expert agricultural advisor specializing in East African farming. For each of these {len(crops_data)} recommended crops{location_info}{season_info}, provide comprehensive farming advice in {language} language.
        
        Current soil and environmental conditions:
        - Nitrogen: {Nitrogen}%, Phosphorous: {Phosphorous}%, Potassium: {Potassium}%
        - pH: {Ph}, Temperature: {Temperature}°C, Humidity: {Humidity}%, Moisture: {Moisture}%
        
        For each crop below, provide detailed advice:
        {chr(10).join([f"{i+1}. {crop['name']} (Match Score: {crop['score']*100:.1f}%) - Optimal ranges: N:{crop['nitrogen_range']}, P:{crop['phosphorous_range']}, K:{crop['potassium_range']}, pH:{crop['ph_range']}, Temp:{crop['temperature_range']}°C, Humidity:{crop['humidity_range']}%, Moisture:{crop['moisture_range']}%. Irrigation: {crop['irrigation_per_day']} times/day, {crop['irrigation_days_per_week']} days/week" for i, crop in enumerate(crops_data)])}
        
        For each crop, provide practical advice covering:
        1. **Suitability**: Why this crop matches current conditions
        2. **Economic Benefits**: Market demand, profit margins, income per acre
        3. **Growing Timeline**: Planting to harvest timeline with milestones
        4. **Care Instructions**: Fertilizer schedule, pest control, planting spacing, watering
        5. **Harvest & Storage**: Harvest signs, techniques, storage, market timing
        
        Format response as: "CROP_NAME_1: [detailed advice]\n\n---\n\nCROP_NAME_2: [detailed advice]" etc.
        Focus on practical, cost-effective solutions for small-scale farmers.
        """
        
        try:
            response = model.generate_content(query)
            response_text = response.text
            
            # Split response by crop names to get individual descriptions
            crop_descriptions = {}
            response_parts = response_text.split('---')
            
            for i, part in enumerate(response_parts):
                if i < len(suitable_crops):
                    crop_name = suitable_crops[i]['crop_row']['crop_name']
                    # Clean up the description by removing crop name prefix if present
                    description = part.strip()
                    if description.startswith(crop_name + ':'):
                        description = description[len(crop_name)+1:].strip()
                    crop_descriptions[crop_name] = description
            
            # If splitting failed, use full response for each crop (fallback)
            if not crop_descriptions:
                for crop_item in suitable_crops:
                    crop_descriptions[crop_item['crop_row']['crop_name']] = response_text
            
            # Create crop details with individual descriptions
            suggested_crops = []
            for crop_item in suitable_crops:
                row = crop_item['crop_row']
                score = crop_item['score']
                crop_name = row['crop_name']
                
                crop_details = {
                    'id': hash(crop_name) % 10000,  # Generate simple ID
                    'crop_name': crop_name,
                    'description': crop_descriptions.get(crop_name, response_text),
                    'Nitrogen': row['Nitrogen (%)'],
                    'Phosporous': row['Phosphorous (%)'],
                    'Potassium': row['Potassium (%)'],
                    'Moisture': row['Soil Moisture (%)'],
                    'Temperature': row['Temperature (C)'],
                    'Humidity': row['Humidity (%)'],
                    'Soil_pH': row['Soil pH'],
                    'isChosen': False,
                    'No_of_irigation_per_day': row['Number of times of irrigation in a day'],
                    'No_of_irigation_per_week': row['Number of days of irrigation in a week'],
                    'Altitude': '1',
                    'created_at': '2025-07-31T14:21:45.686425Z'
                }
                suggested_crops.append(crop_details)
                
        except Exception as e:
            print(f'Error with Gemini API: {e}')
            return {'error': str(e)}

        # Filter suggested crops that are not present in the dataset
        # suggested_crops = filter_crops([crop['crop_name'] for crop in suggested_crops])
        print("suggested",suggested_crops)
        # Generate suggestion message
        if not suggested_crops:
            return {}

        # Return the full details of the suggested crops
        print('show crops  ',suggested_crops)
        return suggested_crops

    except Exception as e:
        print(f'Error in suggest_plant: {e}')
        # return {'error': str(e)}rint(str(e),'an error has occured ')
        return []  # Return empty list instead of JsonResponse

# Django view function example