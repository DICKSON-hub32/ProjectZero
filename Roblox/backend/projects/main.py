import pandas as pd
import os
from django.http import JsonResponse
import requests

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

def suggest_plant(Nitrogen, Phosphorous, Potassium, Ph,Humidity,Temperature,Moisture,language):
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
                url = "https://chatgpt4-ai-chatbot.p.rapidapi.com/ask"

                headers = {
            "x-rapidapi-key": "e08368f7a7msha8ba132fff83c24p146541jsn00e14b7db420",
            "x-rapidapi-host": "chatgpt4-ai-chatbot.p.rapidapi.com",
            "Content-Type": "application/json"
                }  

                payload = { "query": f'why should i choose this crop {row["crop_name"]} in 50 words provide in {language}' }

                try:
                   response = requests.post(url, json=payload, headers=headers)
                except Exception as e:
                    print(str(e),'an error has occured ')
                    return response({'error':str(e)})
                crop_details = {
                    'crop_name': row['crop_name'],
                    'description':response.json()['response'],
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
        print(f"Error in suggest_plant: {e}")
        return JsonResponse({'error': "Error in AI processing."})

# Django view function example