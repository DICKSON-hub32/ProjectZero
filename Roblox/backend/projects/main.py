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


        # Filter dataset based on conditions
        suggested_crops = []
        for _, row in dataset.iterrows():
            if (check_range(Nitrogen, row['Nitrogen (%)']) and
                check_range(Potassium, row['Potassium (%)']) and
                check_range(Phosphorous, row['Phosphorous (%)']) and
                check_range(Ph, row['Soil pH'])and
                check_range(Moisture, row['Soil Moisture (%)'])and
                check_range(Humidity, row['Humidity (%)']) and
                check_range(Temperature, row['Temperature (�C)']) ):
                
                # Append full row details as a dictionary
    #             class cropSpecs(models.Model):
    # crop_name=models.CharField(max_length=100,blank=False)
    # Temperature=models.IntegerField(blank=False)
    # Humidity=models.IntegerField(blank=False)
    # Moisture=models.IntegerField(blank=False)
    # Nitrogen=models.IntegerField(blank=False)
    # Phosporous=models.IntegerField(blank=False)
    # description=models.CharField(max_length=300,blank=False,default='provide More information about why farmer should plant the crop you specified')
    # Potassium=models.IntegerField(blank=False)
    # Irrigation_interval=models.IntegerField(blank=False,default=1)
    # created_at=models.DateTimeField(default=timezone.now())
    # isChosen=models.BooleanField(default=False)
                genai.configure(api_key="AIzaSyD2aILZSjqcXNQ8s01iR6RoSFjNvBpzYYA")
                model = genai.GenerativeModel('gemini-2.0-flash')

                # Create comprehensive query with all available data
                location_info = f" in {location}" if location else ""
                season_info = f" during {season} season" if season else ""
                
                query = f"""
                You are an expert agricultural advisor specializing in East African farming. Provide comprehensive farming advice for {row["crop_name"]}{location_info}{season_info} in {language} language.
                
                Current soil and environmental conditions:
                - Nitrogen: {Nitrogen}% (Optimal range: {row['Nitrogen (%)']})
                - Phosphorous: {Phosphorous}% (Optimal range: {row['Phosphorous (%)']})
                - Potassium: {Potassium}% (Optimal range: {row['Potassium (%)']})
                - Soil pH: {Ph} (Optimal range: {row['Soil pH']})
                - Temperature: {Temperature}°C (Optimal range: {row['Temperature (°C)']})
                - Humidity: {Humidity}% (Optimal range: {row['Humidity (%)']})
                - Soil Moisture: {Moisture}% (Optimal range: {row['Soil Moisture (%)']})
                
                Irrigation requirements:
                - Water {row['Number of times of irrigation in a day']} times per day
                - Irrigate {row['Number of days of irrigation in a week']} days per week
                
                Please provide practical advice covering:
                1. **Suitability**: Why this crop matches your current soil and climate conditions perfectly
                2. **Economic Benefits**: Current market demand, expected profit margins, and potential income per acre
                3. **Growing Timeline**: Complete planting to harvest timeline with critical milestones (germination, flowering, maturity)
                4. **Care Instructions**: 
                   - Essential fertilizer application schedule
                   - Common pests and diseases with prevention methods
                   - Optimal planting spacing and depth
                   - Critical watering stages
                5. **Harvest & Storage**: 
                   - Signs of readiness for harvest
                   - Best harvesting techniques to maximize yield
                   - Post-harvest handling and storage methods
                   - Market timing for best prices
                
                Focus on practical, cost-effective solutions for small-scale farmers. Include specific timeframes, measurements, and actionable steps they can implement immediately.
                """

                try:
                   response = model.generate_content(query)
                   response_text = response.text  # Extract the actual text content
                except Exception as e:
                    print(str(e),'an error has occured ')
                    return response({'error':str(e)})
                crop_details = {
                    'crop_name': row['crop_name'],
                    'description':response_text,
                    'Nitrogen': row['Nitrogen (%)'],
                    'Phosporous': row['Phosphorous (%)'],
                    'Potassium': row['Potassium (%)'],
                    'Moisture': row['Soil Moisture (%)'],
                    'isChosen':False,
                    'No_of_irrigation_per_day': row['Number of times of irrigation in a day'],
                    'No_of_irrigation_per_Week': row['Number of days of irrigation in a week'],
                    'Soil_pH': row['Soil pH'],
                    'Humidity':row['Humidity (%)'],#inputed manually
                    'Temperature':row['Temperature (�C)']#inputed
                    
                }
                print('crop details',crop_details)
                suggested_crops.append(crop_details)

                # If three crops are already found, stop filtering
                if len(suggested_crops) == 4:
                    break

        # Filter suggested crops that are not present in the dataset
        # suggested_crops = filter_crops([crop['crop_name'] for crop in suggested_crops])

        # Generate suggestion message
        if not suggested_crops:
            return {}

        # Return the full details of the suggested crops
        print('show crops  ',suggested_crops)
        return suggested_crops

    except Exception as e:
        print(str(e),'an error has occured ')
        return []  # Return empty list instead of JsonResponse

# Django view function example